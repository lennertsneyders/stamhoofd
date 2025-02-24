

import { ArrayDecoder,ConvertArrayToPatchableArray, Decoder, PatchableArray, PatchableArrayAutoEncoder } from '@simonbackx/simple-encoding'
import { Sodium } from '@stamhoofd/crypto';
import { Keychain, LoginHelper, MemberManagerBase, SessionManager } from '@stamhoofd/networking'
import {  EncryptedMemberWithRegistrations, Gender, Group, KeychainedResponseDecoder, MemberWithRegistrations, PermissionLevel, Registration, User } from '@stamhoofd/structures'

import { OrganizationManager } from './OrganizationManager';

export type MemberChangeEvent = "changedGroup" | "deleted" | "created" | "payment"
export type MembersChangedListener = (type: MemberChangeEvent, member: MemberWithRegistrations | null) => void


/**
 * Controls the fetching and decrypting of members
 */
export class MemberManagerStatic extends MemberManagerBase {
    protected listeners: Map<any, MembersChangedListener> = new Map()

    addListener(owner: any, listener: MembersChangedListener) {
        this.listeners.set(owner, listener)
    }

    removeListener(owner: any) {
        this.listeners.delete(owner)
    }

    callListeners(type: MemberChangeEvent, member: MemberWithRegistrations | null) {
        for (const listener of this.listeners.values()) {
            listener(type, member)
        }
    }

    async decryptMembersWithRegistrations(data: EncryptedMemberWithRegistrations[]) {
        const members: MemberWithRegistrations[] = []
        const groups = OrganizationManager.organization.groups

        for (const member of data) {
            const decryptedMember = MemberWithRegistrations.fromMember(
                await this.decryptMember(member, OrganizationManager.organization),
                member.registrations,
                member.users,
                groups
            )
            members.push(decryptedMember)
        }

        return members;
    }

    async loadMembers(groupIds: string[] = [], waitingList: boolean | null = false, cycleOffset: number | null = 0, owner?: any): Promise<MemberWithRegistrations[]> {
        if (waitingList === null) {
            // Load both waiting list and without waiting list
            const members: MemberWithRegistrations[] = []
            members.push(...(await this.loadMembers(groupIds, true, cycleOffset, owner)))
            members.push(...(await this.loadMembers(groupIds, false, cycleOffset, owner)))
            return Object.values(members.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
        }

        if (cycleOffset === null) {
            // Load both current and future cycle
            const members: MemberWithRegistrations[] = []
            members.push(...(await this.loadMembers(groupIds, waitingList, 1, owner)))
            members.push(...(await this.loadMembers(groupIds, waitingList, 0, owner)))

            return Object.values(members.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
        }

        const session = SessionManager.currentSession!

        if (groupIds.length === 0) {
            const members: MemberWithRegistrations[] = []
            for (const group of session.organization!.groups) {
                if (group.privateSettings && group.privateSettings.permissions.getPermissionLevel(session.user!.permissions!) !== PermissionLevel.None) {
                    members.push(...(await this.loadMembers([group.id], waitingList, cycleOffset, owner)))
                }
            }
            // remove duplicates
            return Object.values(members.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
        }

        if (groupIds.length > 1) {
            const members: MemberWithRegistrations[] = []
            for (const groupId of groupIds) {
                members.push(...(await this.loadMembers([groupId], waitingList, cycleOffset, owner)))
            }
            // remove duplicates
            return Object.values(members.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
        }

        const response = await session.authenticatedServer.request({
            method: "GET",
            path: "/organization/group/" + groupIds[0] + "/members",
            decoder: new KeychainedResponseDecoder(new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)),
            query: { waitingList, cycleOffset },
            owner
        })

        Keychain.addItems(response.data.keychainItems)
        return await this.decryptMembersWithRegistrations(response.data.data)
    }

    getRegistrationsPatchArray(): ConvertArrayToPatchableArray<Registration[]> {
        return new PatchableArray()
    }

    getPatchArray(): ConvertArrayToPatchableArray<EncryptedMemberWithRegistrations[]> {
        return new PatchableArray()
    }

    /**
     * Return a list of patches that is needed to create users that provide all parents and members access to the given members
     * OR that removes access in some situations
     */
    getMembersAccessPatch(members: MemberWithRegistrations[]): PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations> {
        const encryptedMembers: PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations> = new PatchableArray()
        for (const member of members) {

            // Check if this user has missing users
            const missing: PatchableArrayAutoEncoder<User> = new PatchableArray()
            const managers = member.details.getManagerEmails()
            for(const email of managers) {
                const user = member.users.find(u => u.email === email)
                if (!user) {
                    console.log("Linking email "+email)
                    missing.addPut(User.create({
                        email
                    }))
                }
            }

            // Delete users that never created an account and are not in managers
            for (const user of member.users) {
                if (user.publicKey) {
                    continue
                }

                const exists = managers.find(m => m === user.email)
                if (!exists) {
                    // This email has been removed from the managers
                    missing.addDelete(user.id)
                }
            }

            if (missing.changes.length > 0) {
                encryptedMembers.addPatch(
                    EncryptedMemberWithRegistrations.patch({
                        id: member.id,
                        users: missing
                    })
                )
            }
        }

        return encryptedMembers
    }

    /**
     * Update the users that are connected to these members
     */
    async updateMembersAccess(members: MemberWithRegistrations[]) {
        // Update the users that are connected to these members
        const encryptedMembers: PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations> = this.getMembersAccessPatch(members)

        if (encryptedMembers.changes.length > 0) {
            const updated = await this.patchMembers(encryptedMembers)

            for (const member of members) {
                const updatedData = updated.find(m => m.id === member.id)
                if (updatedData) {
                    member.copyFrom(updatedData)
                }
            }
        }
    }   

    async getEncryptedMembersPatch(members: MemberWithRegistrations[]): Promise<PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations>> {
        // Update the users that are connected to these members
        const encryptedMembers: PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations> = this.getMembersAccessPatch(members)

        // Aldo include encryption blobs
        const p = await this.getEncryptedMembers(members, OrganizationManager.organization, false)
        encryptedMembers.merge(p.members as any) // we can merge since it's a subtype
        return encryptedMembers
    }   
    
    /**
     * Reset all the member keys + send invites
     */
    async createNewMemberKey(members: MemberWithRegistrations[]): Promise<MemberWithRegistrations | null> {
        const keyPair = await Sodium.generateEncryptionKeyPair()
        const patch = await this.getEncryptedMembers(members, OrganizationManager.organization, false, keyPair.publicKey)

        const session = SessionManager.currentSession!
        const response = await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patch.members,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        // Send invites
        const didSendInvite = new Set<string>()

        for (const member of members) {
            for (const user of member.users) {
                if (didSendInvite.has(user.id) || !user.publicKey) {
                    continue
                }
                await LoginHelper.shareKey(keyPair, user.id, user.publicKey)
                didSendInvite.add(user.id)
            }
        }

        return (await this.decryptMembersWithRegistrations(response.data))[0] ?? null
    }

    private chunkArray<T>(array: T[], size = 10): T[][] {
        const chunked: T[][] = []

        for (let i = 0;  i < array.length; i += size) {
            chunked.push(array.slice(i, i + size))
        }

        return chunked
    }

    async patchMembersDetails(members: MemberWithRegistrations[], shouldRetry = true): Promise<void> {
        // Patch maximum 10 members at the same time
        const chunked = this.chunkArray(members, 10)

        for (const group of chunked) {
            await this.patchMembers(await this.getEncryptedMembersPatch(group), shouldRetry)
        }
    }

    async patchMembers(members: PatchableArrayAutoEncoder<EncryptedMemberWithRegistrations>, shouldRetry = true) {
        const session = SessionManager.currentSession!
        const response = await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>),
            body: members,
            shouldRetry
        })
        return await this.decryptMembersWithRegistrations(response.data)
    }

    async deleteMembers(members: MemberWithRegistrations[]) {
        const patchArray = new PatchableArray()
        for (const member of members) (
            patchArray.addDelete(member.id)
        )
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", null)
    }

    async deleteMember(member: MemberWithRegistrations) {
        const patchArray = new PatchableArray()
        patchArray.addDelete(member.id)
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", member)
    }

    async unregisterMembers(members: MemberWithRegistrations[], group: Group | null = null, cycleOffset = 0, waitingList = false) {
        const patchArray = new PatchableArray()

        for (const member of members) {
            const patchMember = EncryptedMemberWithRegistrations.patch({ id: member.id })

            if (group === null) {
                for (const registration of member.activeRegistrations) {
                    if (registration.waitingList === waitingList) {
                        patchMember.registrations.addDelete(registration.id)
                    }
                }
            } else {
                for (const registration of member.registrations) {
                    if (registration.groupId === group.id && registration.cycle === group.cycle - cycleOffset && registration.waitingList === waitingList) {
                        patchMember.registrations.addDelete(registration.id)
                    }
                }
            }
            
            patchArray.addPatch(patchMember)
        }
   
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", null)
    }

    async acceptFromWaitingList(members: MemberWithRegistrations[], group: Group | null = null, cycleOffset = 0) {
        const patchArray = new PatchableArray()

        for (const member of members) {
            const patchMember = EncryptedMemberWithRegistrations.patch({ id: member.id })

            if (group === null) {
                for (const registration of member.activeRegistrations) {
                    if (registration.waitingList === true) {
                        patchMember.registrations.addPatch(Registration.patch({
                            id: registration.id,
                            waitingList: false
                        }))
                    }
                }
            } else {
                for (const registration of member.registrations) {
                    if (registration.groupId === group.id && registration.cycle === group.cycle - cycleOffset && registration.waitingList === true) {
                        patchMember.registrations.addPatch(Registration.patch({
                            id: registration.id,
                            waitingList: false
                        }))
                    }
                }
            }
            
            patchArray.addPatch(patchMember)
        }
   
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", null)
    }

    async deleteDataExceptContacts(members: MemberWithRegistrations[]) {
        for (const member of members) {
            member.details.birthDay = null
            member.details.gender = Gender.Other
            member.details.reviewTimes.removeReview("details")

            member.details.records = []
            member.details.reviewTimes.removeReview("records")

            member.details.emergencyContacts = []
            member.details.doctor = null
            member.details.reviewTimes.removeReview("emergencyContacts")

            if (!member.details.age || member.details.age >= 18) {
                member.details.parents = []
                member.details.reviewTimes.removeReview("parents")
            }
        }
        await this.patchMembersDetails(members)
    }

    async deleteData(members: MemberWithRegistrations[]) {
        for (const member of members) {
            member.details.address = null
            member.details.gender = Gender.Other

            member.details.phone = null
            member.details.email = null
            member.details.birthDay = null
            member.details.address = null

            member.details.reviewTimes.removeReview("details")

            member.details.records = []
            member.details.reviewTimes.removeReview("records")

            member.details.emergencyContacts = []
            member.details.doctor = null
            member.details.reviewTimes.removeReview("emergencyContacts")

            member.details.parents = []
            member.details.reviewTimes.removeReview("parents")
        }
        await this.patchMembersDetails(members)
    }

    async moveToWaitingList(members: MemberWithRegistrations[], group: Group | null = null, cycleOffset = 0) {
        const patchArray = new PatchableArray()

        for (const member of members) {
            const patchMember = EncryptedMemberWithRegistrations.patch({ id: member.id })

            if (group === null) {
                for (const registration of member.activeRegistrations) {
                    if (registration.waitingList === false) {
                        patchMember.registrations.addPatch(Registration.patch({
                            id: registration.id,
                            waitingList: true
                        }))
                    }
                }
            } else {
                for (const registration of member.registrations) {
                    if (registration.groupId === group.id && registration.cycle === group.cycle - cycleOffset && registration.waitingList === false) {
                        patchMember.registrations.addPatch(Registration.patch({
                            id: registration.id,
                            waitingList: true
                        }))
                    }
                }
            }
            
            patchArray.addPatch(patchMember)
        }
   
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", null)
    }

    async unregisterMember(member: MemberWithRegistrations, group: Group | null = null, cycleOffset = 0, waitingList = false) {
        const patchArray = new PatchableArray()
        const patchMember = EncryptedMemberWithRegistrations.patch({ id: member.id })

        if (group === null) {
            for (const registration of member.activeRegistrations) {
                if (registration.waitingList === waitingList) {
                    patchMember.registrations.addDelete(registration.id)
                }
            }
        } else {
            for (const registration of member.registrations) {
                if (registration.groupId === group.id && registration.cycle === group.cycle - cycleOffset && registration.waitingList === waitingList) {
                    patchMember.registrations.addDelete(registration.id)
                }
            }
        }

        patchArray.addPatch(patchMember)
 
        const session = SessionManager.currentSession!

        // Send the request
        await session.authenticatedServer.request({
            method: "PATCH",
            path: "/organization/members",
            body: patchArray,
            decoder: new ArrayDecoder(EncryptedMemberWithRegistrations as Decoder<EncryptedMemberWithRegistrations>)
        })

        this.callListeners("deleted", member)
    }
}

export const MemberManager = new MemberManagerStatic()
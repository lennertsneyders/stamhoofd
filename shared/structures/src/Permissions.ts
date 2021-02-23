import { ArrayDecoder, AutoEncoder, BooleanDecoder, EnumDecoder, field, StringDecoder } from '@simonbackx/simple-encoding';
import { v4 as uuidv4 } from "uuid";


export enum PermissionLevel {
    /** No access */
    None = "None",

    /** Read all data, but not allowed to write */
    Read = "Read",
    
    /** Read and write child data, but not allowed to modify settings */
    Write = "Write",
    
    /** Full access */
    Full = "Full",
}

export function getPermissionLevelNumber(level: PermissionLevel): number {
    switch (level) {
        case PermissionLevel.None: return 0;
        case PermissionLevel.Read: return 1;
        case PermissionLevel.Write: return 2;
        case PermissionLevel.Full: return 3;
        default: {
            const l: never = level; // will throw compile error if new levels are added without editing this method
            throw new Error("Unknown permission level "+l);
        }
    }
}

export class PermissionRole extends AutoEncoder {
    @field({ decoder: StringDecoder, defaultValue: () => uuidv4() })
    id: string;

    @field({ decoder: StringDecoder })
    name = "";
}

export class PermissionRoleDetailed extends PermissionRole {
    /**
     * Access to payments
     */
    @field({ decoder: BooleanDecoder })
    managePayments = false

    /**
     * Can create new webshops
     */
    @field({ decoder: BooleanDecoder })
    createWebshops = false

    /**
     * Can view all webshops
     */
    @field({ decoder: BooleanDecoder })
    readWebshops = false

    /**
     * Manage settings of webshops with read access
     */
    @field({ decoder: BooleanDecoder })
    manageWebshops = false
}

/**
 * Give access to a given resouce based by the roles of a user
 */
export class PermissionsByRole extends AutoEncoder {
    @field({ decoder: new ArrayDecoder(PermissionRole) })
    read: PermissionRole[] = []

    @field({ decoder: new ArrayDecoder(PermissionRole) })
    write: PermissionRole[] = []

    @field({ decoder: new ArrayDecoder(PermissionRole) })
    full: PermissionRole[] = []
}


export class GroupPermissions extends AutoEncoder {
    @field({ decoder: StringDecoder })
    groupId: string

    /**
     * Allow to read members and member details
     */
    @field({ decoder: new EnumDecoder(PermissionLevel) })
    level: PermissionLevel
}

export class Permissions extends AutoEncoder {
    /**
     * Automatically have all permissions (e.g. when someone created a new group)
     * Also allows creating new groups
     */
    @field({ decoder: new EnumDecoder(PermissionLevel) })
    level: PermissionLevel

    @field({ decoder: new ArrayDecoder(GroupPermissions) })
    groups: GroupPermissions[] = []

    @field({ decoder: new ArrayDecoder(PermissionRole), version: 60 })
    roles: PermissionRole[] = []

    hasAccess(level: PermissionLevel, groupId: string | null = null) {
        if (getPermissionLevelNumber(this.level) >= getPermissionLevelNumber(level)) {
            // Someone with read / write access for the whole organization, also the same access for each group
            return true;
        }

        if (!groupId) {
            return false
        }

        const permission = this.groups.find(g => g.groupId === groupId)
        if (permission) {
            if (getPermissionLevelNumber(permission.level) >= getPermissionLevelNumber(level)) {
                return true;
            }
        }

        return false

    }

    hasReadAccessForAtLeastOneGroup() {
        if (this.hasReadAccess()) {
            return true;
        }
        return this.groups.find(g => (getPermissionLevelNumber(g.level) >= getPermissionLevelNumber(PermissionLevel.Read)))
    }

    hasReadAccess(groupId: string | null = null) {
        return this.hasAccess(PermissionLevel.Read, groupId)
    }

    hasWriteAccess(groupId: string | null = null) {
        return this.hasAccess(PermissionLevel.Write, groupId)
    }

    hasFullAccess(groupId: string | null = null) {
        return this.hasAccess(PermissionLevel.Full, groupId)
    }
}
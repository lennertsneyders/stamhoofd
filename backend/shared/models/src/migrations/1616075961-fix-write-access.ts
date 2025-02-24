import { Migration } from '@simonbackx/simple-database';
import { PermissionLevel, PermissionRole, PermissionRoleDetailed } from '@stamhoofd/structures';
import { Group } from '../models/Group';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Invite } from '../models/Invite';

export default new Migration(async () => {
    if (STAMHOOFD.environment == "test") {
        console.log("skipped in tests")
        return;
    }

    // This migration is not needed any longer on newer servers
    console.log("Skipped")

    /*
    const organizations = await Organization.all();

    for (const organization of organizations) {
        const d = new Date()

        const invites = (await Invite.where({ 
            organizationId: organization.id, 
            permissions: {
                value: null,
                sign: "!="
            }
        }))

         // Get all admins
        const users = [
            ...await User.where({ 
                organizationId: organization.id, 
                permissions: {
                    value: null,
                    sign: "!="
                }
            }), 
            ...invites
        ]
        
        for (const user of users) {
            if (!user.permissions) {
                console.error("PERMISSIONS MISSING!")
                continue
            }

            if (user.permissions.level === PermissionLevel.Write) {
                if (user instanceof Invite) {
                    console.warn("Invite had write permissions: "+(user.userDetails?.firstName ?? "")+" @"+organization.name )
                } else {
                    console.warn("User had write permissions: "+(user.firstName ?? "")+" @"+organization.name )
                }
                user.permissions.level = PermissionLevel.None
                await user.save()
            }
        }        
    } */
});



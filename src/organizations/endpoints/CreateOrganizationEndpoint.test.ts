import { Request } from "@/routing/classes/Request";
import { CreateOrganizationEndpoint } from "./CreateOrganizationEndpoint";
import Sodium from "@/tools/classes/Sodium";
import { User } from "@/users/models/User";
import { Organization } from "../models/Organization";
import { Formatter } from "@/tools/classes/Formatter";

describe("Endpoint.CreateOrganization", () => {
    // Test endpoint
    const endpoint = new CreateOrganizationEndpoint();

    test("Create an organization", async () => {
        const userKeyPair = await Sodium.boxKeyPair();
        const organizationKeyPair = await Sodium.signKeyPair();

        const r = Request.buildJson("POST", "/organizations", "todo-host.be", {
            // eslint-disable-next-line @typescript-eslint/camelcase
            name: "My endpoint test organization",
            publicKey: organizationKeyPair.publicKey,
            user: {
                email: "admin@domain.com",
                password: "My user password",
                publicKey: userKeyPair.publicKey,
                adminSignature: await Sodium.signMessage(
                    userKeyPair.publicKey,
                    Buffer.from(organizationKeyPair.privateKey, "base64")
                ),
            },
        });

        const response = await endpoint.getResponse(r, {});
        expect(response.body).toBeUndefined();
        expect(response.status).toEqual(200);

        const organization = await Organization.getByURI(Formatter.slug("My endpoint test organization"));
        expect(organization).toBeDefined();
        if (!organization) throw new Error("impossible");

        const user = await User.login(organization, "admin@domain.com", "My user password");
        expect(user).toBeDefined();
    });

    test("Organization already exists throws", async () => {
        const userKeyPair = await Sodium.boxKeyPair();
        const organizationKeyPair = await Sodium.signKeyPair();

        const r = Request.buildJson("POST", "/organizations", "todo-host.be", {
            // eslint-disable-next-line @typescript-eslint/camelcase
            name: "My endpoint test organization",
            publicKey: organizationKeyPair.publicKey,
            user: {
                email: "admin@domain.com",
                password: "My user password",
                publicKey: userKeyPair.publicKey,
                adminSignature: await Sodium.signMessage(
                    userKeyPair.publicKey,
                    Buffer.from(organizationKeyPair.privateKey, "base64")
                ),
            },
        });

        await expect(endpoint.getResponse(r, {})).rejects.toThrow(/name/);
    });

    test("Mising admin signature", async () => {
        const userKeyPair = await Sodium.boxKeyPair();
        const organizationKeyPair = await Sodium.signKeyPair();

        const r = Request.buildJson("POST", "/organizations", "todo-host.be", {
            // eslint-disable-next-line @typescript-eslint/camelcase
            name: "My endpoint test 2 organization",
            publicKey: organizationKeyPair.publicKey,
            user: {
                email: "admin@domain.com",
                password: "My user password",
                publicKey: userKeyPair.publicKey,
            },
        });

        await expect(endpoint.getResponse(r, {})).rejects.toThrow(/sign/);
    });

    test("Invalid admin signature", async () => {
        const userKeyPair = await Sodium.boxKeyPair();
        const organizationKeyPair = await Sodium.signKeyPair();
        const invalidKeyPair = await Sodium.signKeyPair();

        const r = Request.buildJson("POST", "/organizations", "todo-host.be", {
            // eslint-disable-next-line @typescript-eslint/camelcase
            name: "My endpoint test 3 organization",
            publicKey: organizationKeyPair.publicKey,
            user: {
                email: "admin@domain.com",
                password: "My user password",
                publicKey: userKeyPair.publicKey,
                adminSignature: await Sodium.signMessage(
                    userKeyPair.publicKey,
                    Buffer.from(invalidKeyPair.privateKey, "base64")
                ),
            },
        });

        await expect(endpoint.getResponse(r, {})).rejects.toThrow(/adminSignature/);
    });
});

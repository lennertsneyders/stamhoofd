import { ArrayDecoder, AutoEncoderPatchType, Decoder } from '@simonbackx/simple-encoding';
import { DecodedRequest, Endpoint, Request, Response } from "@simonbackx/simple-endpoints";
import { SimpleError } from "@simonbackx/simple-errors";
import { Ticket } from '@stamhoofd/models';
import { Token } from '@stamhoofd/models';
import { Webshop } from '@stamhoofd/models';
import { getPermissionLevelNumber, PermissionLevel, TicketPrivate } from "@stamhoofd/structures";

type Params = { id: string };
type Query = undefined;
type Body = AutoEncoderPatchType<TicketPrivate>[]
type ResponseBody = TicketPrivate[]

export class PatchWebshopTicketsEndpoint extends Endpoint<Params, Query, Body, ResponseBody> {
    bodyDecoder = new ArrayDecoder(TicketPrivate.patchType() as Decoder<AutoEncoderPatchType<TicketPrivate>>)

    protected doesMatch(request: Request): [true, Params] | [false] {
        if (request.method != "PATCH") {
            return [false];
        }

        const params = Endpoint.parseParameters(request.url, "/webshop/@id/tickets/private", { id: String });

        if (params) {
            return [true, params as Params];
        }
        return [false];
    }

    async handle(request: DecodedRequest<Params, Query, Body>) {
        const token = await Token.authenticate(request);

        if (request.body.length == 0) {
            return new Response([]);
        }

        const webshop = await Webshop.getByID(request.params.id)
        if (!webshop || token.user.organizationId != webshop.organizationId) {
            throw new SimpleError({
                code: "not_found",
                message: "Webshop not found",
                human: "Deze webshop bestaat niet (meer)"
            })
        }

        if (!token.user.permissions || getPermissionLevelNumber(webshop.privateMeta.permissions.getPermissionLevel(token.user.permissions)) < getPermissionLevelNumber(PermissionLevel.Write)) {
            throw new SimpleError({
                code: "permission_denied",
                message: "No permissions for this webshop",
                human: "Je hebt geen toegang om tickets te scannen in deze webshop",
                statusCode: 403
            })
        }

        const tickets: Ticket[] = []

        for (const patch of request.body) {
            const model = await Ticket.getByID(patch.id)
            if (!model || model.webshopId !== webshop.id) {
                throw new SimpleError({
                    code: "not_found",
                    message: "Ticket with id "+patch.id+" does not exist"
                })
            }

            if (patch.scannedAt !== undefined) {
                model.scannedAt = patch.scannedAt
            }

            if (patch.scannedBy !== undefined) {
                model.scannedBy = patch.scannedBy
            }

            await model.save()

            tickets.push(model)
        }

        return new Response(
            tickets.map(ticket => TicketPrivate.create(ticket))
        );
    }
}

import { Database, ManyToOneRelation,OneToManyRelation } from '@simonbackx/simple-database';
import { ArrayDecoder, Decoder } from '@simonbackx/simple-encoding';
import { DecodedRequest, Endpoint, Request, Response } from "@simonbackx/simple-endpoints";
import { SimpleError } from "@simonbackx/simple-errors";
import { Group, Webshop } from '@stamhoofd/models';
import { Member } from '@stamhoofd/models';
import { Order } from '@stamhoofd/models';
import { Payment } from '@stamhoofd/models';
import { Registration } from '@stamhoofd/models';
import { Token } from '@stamhoofd/models';
import { EncryptedPaymentGeneral, getPermissionLevelNumber, Order as OrderStruct, OrderStatus, PaymentMethod, PaymentPatch, PaymentStatus, PermissionLevel } from "@stamhoofd/structures";

import { GetOrganizationPaymentsEndpoint } from './GetOrganizationPaymentsEndpoint';
type Params = Record<string, never>;
type Query = undefined;
type Body = PaymentPatch[]
type ResponseBody = EncryptedPaymentGeneral[]

type RegistrationWithMember = Registration & { member: Member}
type PaymentWithRegistrations = Payment & { registrations: RegistrationWithMember[] }
type PaymentWithOrder = Payment & { order: Order }

/**
 * One endpoint to create, patch and delete groups. Usefull because on organization setup, we need to create multiple groups at once. Also, sometimes we need to link values and update multiple groups at once
 */

export class PatchOrganizationPaymentsEndpoint extends Endpoint<Params, Query, Body, ResponseBody> {
    bodyDecoder = new ArrayDecoder(PaymentPatch as Decoder<PaymentPatch>)
    protected doesMatch(request: Request): [true, Params] | [false] {
        if (request.method != "PATCH") {
            return [false];
        }

        const params = Endpoint.parseParameters(request.url, "/organization/payments", {});

        if (params) {
            return [true, params as Params];
        }
        return [false];
    }

    async handle(request: DecodedRequest<Params, Query, Body>) {
        const token = await Token.authenticate(request);
        const user = token.user

        // If the user has permission, we'll also search if he has access to the organization's key
        if (!user.permissions) {
            throw new SimpleError({
                code: "permission_denied",
                message: "You don't have permissions to access payments",
                human: "Je hebt geen toegang tot betalingen"
            })
        }


        const payments = await GetOrganizationPaymentsEndpoint.getPaymentsWithRegistrations(user.organizationId)
        const orderPayments = await GetOrganizationPaymentsEndpoint.getPaymentsWithOrder(user.organizationId, true)
        const changedPayments: (PaymentWithRegistrations | PaymentWithOrder)[] = []

        let groups: Group[] = []
        let webshops: Webshop[] = []
        if (!user.permissions.hasFullAccess() && !user.permissions.canManagePayments(user.organization.privateMeta.roles)) {
            groups = await Group.where({organizationId: user.organization.id})
        }

        if (!user.permissions.hasFullAccess() && !user.permissions.canManagePayments(user.organization.privateMeta.roles)) {
            webshops = await Webshop.where({organizationId: user.organization.id})
        }

        // Modify payments
        for (const patch of request.body) {
            const pay = payments.find(p => p.id == patch.id)
            const orderPay = orderPayments.find(p => p.id == patch.id)
            const model = pay ?? orderPay

            if (!model) {
                throw new SimpleError({
                    code: "payment_not_found",
                    message: "Payment with id "+patch.id+" does not exist",
                    human: "De betaling die je wilt wijzigen bestaat niet of je hebt er geen toegang toe"
                })
            }

            if (!user.permissions.hasFullAccess() && !user.permissions.canManagePayments(user.organization.privateMeta.roles)) {
                if (!pay) {
                    const webshop = webshops.find(w => w.id === orderPay?.order.webshopId)
                    if (!orderPay || !webshop || getPermissionLevelNumber(webshop.privateMeta.permissions.getPermissionLevel(user.permissions)) < getPermissionLevelNumber(PermissionLevel.Write)) {
                        throw new SimpleError({
                            code: "payment_not_found",
                            message: "Payment with id "+patch.id+" does not exist",
                            human: "De betaling die je wilt wijzigen bestaat niet of je hebt er geen toegang toe"
                        })
                    }
                } else {
                    // Check permissions if not full permissions or paymetn permissions
                    const registrations = pay.registrations
                    if (!Member.haveRegistrationsWriteAccess(registrations, user, groups, true)) {
                        throw new SimpleError({
                            code: "payment_not_found",
                            message: "Payment with id "+patch.id+" does not exist",
                            human: "Je hebt geen toegang om deze betaling te wijzigen. Vraag het aan een hoofdbeheerder of beheerder met rechten voor het financieel beheer."
                        })
                    }
                }
            }

            let markPaid = false

            if (patch.status) {
                if (model.status != PaymentStatus.Succeeded && model.paidAt === null && patch.status == PaymentStatus.Succeeded) {
                    model.paidAt = new Date()
                    markPaid = true
                } else if (model.paidAt !== null && patch.status != PaymentStatus.Succeeded) {
                    model.paidAt = null
                }

                model.status = patch.status
            }

            if (patch.price || patch.method || patch.paidAt !== undefined) {
                if (model.method && ![PaymentMethod.Unknown, PaymentMethod.Transfer].includes(model.method)) {
                    throw new SimpleError({
                        code: "invalid_field",
                        message: "Invalid payment method",
                        human: "Je kan online betalingen niet wijzigen"
                    })
                }
            }

            if (patch.method) {
                if (![PaymentMethod.Unknown, PaymentMethod.Transfer].includes(patch.method)) {
                    throw new SimpleError({
                        code: "invalid_field",
                        message: "Invalid payment method",
                        human: "De betaalmethode die je wilt gebruiken is niet toegestaan",
                        field: "method"
                    })
                }
                model.method = patch.method

                if (model.method === PaymentMethod.Transfer && patch.transferDescription === undefined && !model.transferDescription) {
                    model.transferDescription = Payment.generateDescription(user.organization, user.organization.meta.transferSettings, pay?.registrations.map(r => r.member.firstName).join(", ") ?? orderPay?.order.number?.toString() ?? "")
                }
            }

            if (patch.transferDescription && model.method == PaymentMethod.Transfer) {
                model.transferDescription = patch.transferDescription
            }

            if (patch.paidAt !== undefined) {
                if ((patch.paidAt === null && model.status === PaymentStatus.Succeeded) || (patch.paidAt !== null && model.status !== PaymentStatus.Succeeded)) {
                    // Ignore this change: this is invalid
                } else {
                    model.paidAt = patch.paidAt
                }
            }

            if (patch.price) {
                model.price = patch.price
            }

            if (markPaid) {
                // Send e-mail if needed with tickets
                await orderPay?.order?.markPaid(orderPay, user.organization)
            }

            changedPayments.push(model)
        }

        for (const payment of changedPayments) {
            // Automatically checks if it is changed or not
            await payment.save()
        }

         return new Response(
            (request.request.getVersion() >= 97 ? changedPayments : [...payments, ...orderPayments]).map((p) => {
                return GetOrganizationPaymentsEndpoint.getPaymentStructure(p)
            })
        );
    }
}

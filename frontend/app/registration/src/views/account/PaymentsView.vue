<template>
    <section>
        <main>
            <h1>Afrekeningen</h1>
            <p>Hier kan je de betaalstatus van jouw inschrijvingen opvolgen.</p>

            <p v-if="payments.length === 0" class="info-box">
                Er zijn momenteel nog geen afrekeningen beschikbaar voor jouw account
            </p>

            <STList v-else>
                <STListItem v-for="payment in payments" :key="payment.id" class="right-stack" :selectable="canOpenPayment(payment)" @click="openPayment(payment)">
                    <span slot="left" class="icon card" />

                    <h2 class="style-title-list">
                        {{ getPaymentPeriod(payment) }}
                    </h2>
                    <p class="style-description-small">
                        {{ payment.getMemberNames() }}
                    </p>
                    <p v-if="payment.status == 'Succeeded'" class="style-description-small">
                        {{ paymentMethodName(payment.method) }}
                    </p>
                    <p v-else class="style-description-small">
                        Betaal via overschrijving
                    </p>

                    <template slot="right">
                        {{ payment.price | price }}
                        <span v-if="payment.status == 'Succeeded'" class="icon green success" />
                        <span v-else class="icon arrow-right" />
                    </template>
                </STListItem>
            </STList>
        </main>
    </section>
</template>

<script lang="ts">
import { ComponentWithProperties, NavigationController, NavigationMixin } from "@simonbackx/vue-app-navigation";
import { Checkbox, LoadingView, OrganizationLogo, STList, STListItem, STNavigationBar, STToolbar, TransferPaymentView } from "@stamhoofd/components";
import { SessionManager, UrlHelper } from "@stamhoofd/networking";
import { PaymentMethodHelper } from "@stamhoofd/structures";
import { Payment, PaymentDetailed, PaymentMethod, RegistrationWithMember } from '@stamhoofd/structures';
import { Formatter } from '@stamhoofd/utility';
import { Component, Mixins } from "vue-property-decorator";

import { MemberManager } from '../../classes/MemberManager';
import { OrganizationManager } from '../../classes/OrganizationManager';

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STList,
        STListItem,
        LoadingView,
        Checkbox,
        OrganizationLogo
    },
    filters: {
        price: Formatter.price
    }
})
export default class PaymentsView extends Mixins(NavigationMixin){
    MemberManager = MemberManager

    /**
     * Return members that are currently registered in
     */
    get registeredMembers() {
        if (!this.members) {
            return []
        }
        return this.members.filter(m => m.groups.length > 0)
    }

    get organization() {
        return OrganizationManager.organization
    }

    get rootCategory() {
        return this.organization.categoryTree
    }

    logout() {
        if (SessionManager.currentSession && SessionManager.currentSession.isComplete()) {
            SessionManager.currentSession.logout()
            return;
        }
    }

    /**
     * Return members that are currently registered in
     */
    get waitingMembers() {
        if (!this.members) {
            return []
        }
        return this.members.filter(m => m.waitingGroups.length > 0 || m.acceptedWaitingGroups.length > 0)
    }

    getPaymentPeriod(payment: Payment) {
        return Formatter.capitalizeFirstLetter(Formatter.month(payment.createdAt.getMonth() + 1)) + " " + payment.createdAt.getFullYear()
    }

    paymentMethodName(method: PaymentMethod) {
        return "Betaald via "+PaymentMethodHelper.getName(method)
    }

    get payments() {
        if (!this.members) {
            return []
        }

        const payments: Map<string, PaymentDetailed> = new Map()
        const groups = OrganizationManager.organization.groups
        for (const member of this.members) {
            for (const registration of member.registrations) {
                if (!registration.payment) {
                    continue;
                }
                const existing = payments.get(registration.payment.id)
                const group = groups.find(g => g.id == registration.groupId)
                if (!group) {
                    continue;
                }
                const reg = RegistrationWithMember.create(
                    Object.assign({
                        member,
                        group
                    }, registration)
                );
                if (existing) {
                    existing.registrations.push(reg)
                } else {
                    payments.set(registration.payment.id, PaymentDetailed.create(Object.assign({
                        registrations: [reg]
                    }, registration.payment)))
                }
            }
        }
        return Array.from(payments.values())
    }

    get members() {
        if (MemberManager.members) {
            return MemberManager.members
        }
        return []
    }

    mounted() {
        UrlHelper.setUrl("/")
    }

    canOpenPayment(payment: PaymentDetailed) {
        return payment.method == PaymentMethod.Transfer
    }

    openPayment(payment: PaymentDetailed) {
        if (!this.canOpenPayment(payment)) {
            return;
        }
        this.present(new ComponentWithProperties(NavigationController, {
            root: new ComponentWithProperties(TransferPaymentView, {
                type: "registration",
                organization: OrganizationManager.organization,
                payment,
                settings: OrganizationManager.organization.meta.transferSettings,
                additionalReference: payment.getMemberLastNames(),
                isPopup: true
            })
        }).setDisplayStyle("popup"))
    }
}
</script>
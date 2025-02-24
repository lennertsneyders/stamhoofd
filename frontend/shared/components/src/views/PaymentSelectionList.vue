<template>
    <STList class="payment-selection-list">
        <STListItem v-for="paymentMethod in sortedPaymentMethods" :key="paymentMethod" :selectable="true" element-name="label" class="right-stack left-center">
            <Radio slot="left" v-model="selectedPaymentMethod" name="choose-payment-method" :value="paymentMethod" />
            <h2 :class="{ 'style-title-list': !!getDescription(paymentMethod) }">
                {{ getName(paymentMethod) }}
            </h2>
            <p v-if="getDescription(paymentMethod)" class="style-description-small">
                {{ getDescription(paymentMethod) }}
            </p>

            <div v-if="paymentMethod == 'Payconiq'" class="payment-app-banner">
                <img class="payment-app-logo" src="~@stamhoofd/assets/images/partners/payconiq/app.svg">
                <img class="payment-app-logo" src="~@stamhoofd/assets/images/partners/kbc/app.svg">
                <img class="payment-app-logo" src="~@stamhoofd/assets/images/partners/ing/app.svg">
            </div>

            <img v-if="getLogo(paymentMethod)" slot="right" :src="getLogo(paymentMethod)" class="payment-method-logo" :class="paymentMethod.toLowerCase()">
        </STListItem>
    </STList>
</template>

<script lang="ts">
import { NavigationMixin } from "@simonbackx/vue-app-navigation";
import bancontactLogo from "@stamhoofd/assets/images/partners/bancontact/logo.svg"
import idealLogo from "@stamhoofd/assets/images/partners/ideal/logo.svg"
import payconiqLogo from "@stamhoofd/assets/images/partners/payconiq/payconiq-vertical-pos.svg"
import { LoadingButton, Radio, STErrorsDefault,STList, STListItem, STNavigationBar, STToolbar } from "@stamhoofd/components"
import { PaymentMethodHelper } from "@stamhoofd/structures";
import { Country, Organization, PaymentMethod } from '@stamhoofd/structures';
import { Component, Mixins,  Prop,Vue } from "vue-property-decorator";

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STList,
        STListItem,
        Radio,
        LoadingButton,
        STErrorsDefault
    },
    model: {
        // Already vue 3 compliant
        prop: 'modelValue',
        event: 'update:modelValue'
    },
})
export default class PaymentSelectionList extends Mixins(NavigationMixin){
    @Prop({ default: null })
    modelValue: PaymentMethod | null

    @Prop({ required: true }) 
    organization: Organization

    @Prop({ required: true }) 
    paymentMethods: PaymentMethod[]

    mounted() {
        if (!this.selectedPaymentMethod || this.selectedPaymentMethod === PaymentMethod.Unknown || !this.paymentMethods.includes(this.selectedPaymentMethod)) {
            this.selectedPaymentMethod = this.sortedPaymentMethods[0] ?? null
        }
    }

    get selectedPaymentMethod() {
        return this.modelValue
    }

    set selectedPaymentMethod(method: PaymentMethod | null) {
        this.$emit('update:modelValue', method)
    }

    get sortedPaymentMethods() {
        const methods = this.paymentMethods
        const r: PaymentMethod[] = []

        // Force a given ordering
        if (methods.includes(PaymentMethod.iDEAL) && this.organization.address.country == Country.Netherlands) {
            r.push(PaymentMethod.iDEAL)
        }

        // Force a given ordering
        if (methods.includes(PaymentMethod.Payconiq)) {
            r.push(PaymentMethod.Payconiq)
        }

        // Force a given ordering
        if (methods.includes(PaymentMethod.Bancontact)) {
            r.push(PaymentMethod.Bancontact)
        }

        // Force a given ordering
        if (methods.includes(PaymentMethod.iDEAL) && this.organization.address.country != Country.Netherlands) {
            r.push(PaymentMethod.iDEAL)
        }

        // Others
        r.push(...methods.filter(p => p != PaymentMethod.Payconiq && p != PaymentMethod.Bancontact && p != PaymentMethod.iDEAL))

        return r
    }

    getName(paymentMethod: PaymentMethod): string {
        switch (paymentMethod) {
            case PaymentMethod.Payconiq: return "Payconiq, KBC mobile of ING-app (snelst)"
            case PaymentMethod.Transfer: return "Via overschrijving"
        }
        return PaymentMethodHelper.getNameCapitalized(paymentMethod)
    }

    getDescription(paymentMethod: PaymentMethod): string {
        switch (paymentMethod) {
            case PaymentMethod.Payconiq: return "Betaal mobiel met de Payconiq by Bancontact app, de KBC-app of de ING-app."
            case PaymentMethod.Transfer: return ""
            case PaymentMethod.Bancontact: return ""
            case PaymentMethod.iDEAL: return ""
            case PaymentMethod.Unknown: return ""
            case PaymentMethod.DirectDebit: return ""
            case PaymentMethod.CreditCard: return ""
        }
    }

    getLogo(paymentMethod: PaymentMethod): string | null {
        switch (paymentMethod) {
            case PaymentMethod.Payconiq: return payconiqLogo
            case PaymentMethod.Transfer: return null
            case PaymentMethod.Bancontact: return bancontactLogo
            case PaymentMethod.iDEAL: return idealLogo
            case PaymentMethod.Unknown: return null
            case PaymentMethod.DirectDebit: return null
            case PaymentMethod.CreditCard: return null
        }
    }
}
</script>

<style lang="scss">
@use "@stamhoofd/scss/base/variables.scss" as *;
@use "@stamhoofd/scss/base/text-styles.scss" as *;

.payment-selection-list {
    .payment-method-logo {
        max-height: 30px;

        &.bancontact {
            max-height: 38px;
            margin: -4px 0 !important; // Fix white borders in bancontact logo
        }
    }

    .payment-app-logo {
        height: 35px;
    }

    .payment-app-banner {
        display: flex;
        flex-direction: row;
        padding-top: 10px;

        > * {
            margin-right: 5px
        }
    }
}

</style>
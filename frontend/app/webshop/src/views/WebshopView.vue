<template>
    <section class="st-view webshop-view">
        <STNavigationBar :large="true">
            <template slot="left">
                <OrganizationLogo :organization="organization" />
            </template>

            <template slot="right">
                <a v-if="organization.website" class="button text limit-space" :href="organization.website" target="_blank" rel="nofollow noreferrer noopener">
                    <span class="icon external" />
                    <span>Terug naar website</span>
                </a>
                <button class="primary button" @click="openCart(true)">
                    <span class="icon basket" />
                    <span>{{ cartCount }}</span>
                </button>
            </template>
        </STNavigationBar>

        <main class="limit-width">
            <section class="white-top view">
                <main>
                    <figure v-if="bannerImageSrc" class="webshop-banner">
                        <img :src="bannerImageSrc" :width="bannerImageWidth" :height="bannerImageHeight">
                    </figure>
                    <h1>{{ webshop.meta.title || webshop.meta.name }}</h1>
                    <p v-if="webshop.meta.description" class="description" v-text="webshop.meta.description" />

                    <p v-if="isTrial" class="error-box">
                        Dit is een demo webshop
                    </p>
                </main>
            </section>
            <section class="gray-shadow view enable-grid">
                <main>
                    <p v-if="webshop.categories.length == 0 && webshop.products.length == 0" class="warning-box">
                        Er zijn nog geen artikels toegevoegd aan deze webshop, kom later eens terug.
                    </p>

                    <p v-if="closed" class="error-box">
                        Bestellingen zijn gesloten
                    </p>
                    <p v-else-if="almostClosed" class="warning-box">
                        Bestellen kan tot {{ webshop.meta.availableUntil | time }}
                    </p>

                    <template v-if="!closed">
                        <CategoryBox v-for="(category, index) in webshop.categories" :key="category.id" :category="category" :webshop="webshop" :cart="cart" :save-handler="onAddItem" :is-last="index === webshop.categories.length - 1" />
                        <ProductGrid v-if="webshop.categories.length == 0" :products="webshop.products" :webshop="webshop" :cart="cart" :save-handler="onAddItem" />
                    </template>
                </main>
                <div class="legal-footer">
                    <hr class="style-hr">
                    <div>
                        <aside>
                            {{ organization.meta.companyName || organization.name }}{{ organization.meta.VATNumber || organization.meta.companyNumber ? (", "+(organization.meta.VATNumber || organization.meta.companyNumber)) : "" }}
                            <template v-if="organization.website">
                                -
                            </template>
                            <a v-if="organization.website" :href="organization.website" class="inline-link secundary" rel="nofollow noreferrer noopener" target="_blank">
                                Website
                            </a>
                            
                            <template v-for="policy in policies">
                                -
                                <a :key="policy.id" :href="policy.calculatedUrl" class="inline-link secundary" rel="nofollow noreferrer noopener" target="_blank">
                                    {{ policy.name }}
                                </a>
                            </template>

                            <template v-if="privacyUrl">
                                -
                            </template>

                            <a v-if="privacyUrl" :href="privacyUrl" class="inline-link secundary" rel="nofollow noreferrer noopener" target="_blank">
                                Privacyvoorwaarden
                            </a>

                            <br>
                            {{ organization.meta.companyAddress || organization.address }}
                        </aside>
                        <div>
                            <a v-if="hasTickets" :href="'https://'+$t('shared.domains.marketing')+'/ticketverkoop'">Ticketverkoop via <Logo /></a>
                            <a v-else :href="'https://'+$t('shared.domains.marketing')+'/webshops'">Webshop via <Logo /></a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </section>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ComponentWithProperties, NavigationController, NavigationMixin } from "@simonbackx/vue-app-navigation";
import { CategoryBox, CenteredMessage, Checkbox, GlobalEventBus, LoadingView, Logo, OrganizationLogo, PaymentPendingView, ProductGrid, STList, STListItem, STNavigationBar, STToolbar, Toast } from "@stamhoofd/components";
import { UrlHelper } from "@stamhoofd/networking";
import { CartItem, Payment, PaymentStatus, WebshopTicketType } from '@stamhoofd/structures';
import { Formatter } from '@stamhoofd/utility';
import { Component, Mixins } from "vue-property-decorator";

import { CheckoutManager } from '../classes/CheckoutManager';
import { WebshopManager } from '../classes/WebshopManager';
import CartView from './checkout/CartView.vue';
import { CheckoutStepsManager, CheckoutStepType } from './checkout/CheckoutStepsManager';
import OrderView from './orders/OrderView.vue';
import TicketView from "./orders/TicketView.vue";

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STList,
        STListItem,
        LoadingView,
        Checkbox,
        CategoryBox,
        ProductGrid,
        OrganizationLogo,
        Logo
    },
    filters: {
        price: Formatter.price.bind(Formatter),
        time: Formatter.time.bind(Formatter)
    },
    metaInfo() {
        return {
            title: WebshopManager.webshop.meta.name,
            titleTemplate: '%s | '+WebshopManager.organization.name,
            meta: [
                {
                    vmid: 'description',
                    name: 'description',
                    content: WebshopManager.webshop.meta.description,
                },
                {
                    hid: 'og:site_name',
                    name: 'og:site_name',
                    content: WebshopManager.organization.name
                },
                {
                    hid: 'og:title',
                    name: 'og:title',
                    content: WebshopManager.webshop.meta.title ?? WebshopManager.webshop.meta.name
                },
                ...(this.bannerImageSrc ? [
                     {
                        hid: 'og:image',
                        name: 'og:image',
                        content: this.bannerImageSrc
                    },
                    {
                        hid: 'og:image:width',
                        name: 'og:image:width',
                        content: this.bannerImageWidth
                    },
                    {
                        hid: 'og:image:height',
                        name: 'og:image:height',
                        content: this.bannerImageHeight
                    },
                    {
                        hid: 'og:image:type',
                        name: 'og:image:type',
                        content: this.bannerImageSrc.endsWith(".png") ? 'image/png' : 'image/jpeg'
                    },
                ] : [])
            ]
        }
    }
})
export default class WebshopView extends Mixins(NavigationMixin){
    CheckoutManager = CheckoutManager
    CheckoutStepsManager = CheckoutStepsManager
    WebshopManager = WebshopManager
    visible = true

    get organization() {
        return WebshopManager.organization
    }
    
    get webshop() {
        return WebshopManager.webshop
    }

    get hasTickets() {
        return this.webshop.meta.ticketType === WebshopTicketType.Tickets
    }

    get policies() {
        return this.webshop.meta.policies
    }

    get privacyUrl() {
        if (this.webshop.meta.policies.length > 0) {
            return null
        }
        if (WebshopManager.organization.meta.privacyPolicyUrl) {
            return WebshopManager.organization.meta.privacyPolicyUrl
        }
        if (WebshopManager.organization.meta.privacyPolicyFile) {
            return WebshopManager.organization.meta.privacyPolicyFile.getPublicPath()
        }
        return null
    }

    get cart() {
        return CheckoutManager.cart
    }

    get cartCount() {
        return CheckoutManager.cart.count
    }

    openCart(animated = true) {
        this.present(new ComponentWithProperties(NavigationController, { root: new ComponentWithProperties(CartView) }).setAnimated(animated).setDisplayStyle("popup"))
    }

    get bannerImage() {
        return this.webshop.meta.coverPhoto?.getResolutionForSize(800, undefined)
    }
    
    get bannerImageWidth() {
        return this.bannerImage?.width
    }

    get bannerImageHeight() {
        return this.bannerImage?.height
    }

    get bannerImageSrc() {
        return this.bannerImage?.file.getPublicPath()
    }

    get isTrial() {
        return this.organization.meta.packages.isWebshopsTrial
    }

    get closed() {
        // 2 minutes in advance already
        if (this.webshop.meta.availableUntil && this.webshop.meta.availableUntil.getTime() < new Date().getTime() + 2*60*1000) {
            return true
        }
        return false
    }

    get almostClosed() {
        if (this.webshop.meta.availableUntil && this.webshop.meta.availableUntil.getTime() < new Date().getTime() + 6*60*60*1000) {
            return true
        }
        return false
    }
    
    onAddItem(cartItem: CartItem) {
        cartItem.validate(this.webshop, CheckoutManager.cart)
        new Toast(cartItem.product.name+" is toegevoegd aan je winkelmandje", "success green").setHide(2000).show()
        CheckoutManager.cart.addItem(cartItem)
        CheckoutManager.saveCart()
    }

    mounted() {
        GlobalEventBus.addListener(this, "checkout", async (cartComponent: CartView) => {
            const nextStep = await CheckoutStepsManager.getNextStep(undefined, true)

            if (!nextStep) {
                // Not possible
                new Toast("Bestellen is nog niet mogelijk omdat nog enkele instellingen ontbreken.", "error red").show()
                return;
            }

            const comp = await nextStep.getComponent();
            if (this.visible) {
                cartComponent.dismiss({ force: true })
                this.show(new ComponentWithProperties(comp, {}).setAnimated(true))
            } else {
                cartComponent.show(new ComponentWithProperties(comp, {}).setAnimated(true))
            }
        })

        const path = this.webshop.removeSuffix(UrlHelper.shared.getParts());
        const params = UrlHelper.shared.getSearchParams()
        UrlHelper.shared.clear()
        UrlHelper.setUrl(this.webshop.getUrlSuffix())

        if (path.length == 2 && path[0] == 'order') {
            const orderId = path[1];
            this.show(new ComponentWithProperties(OrderView, { orderId }).setAnimated(false))
        } else if (path.length == 2 && path[0] == 'tickets') {
            const secret = path[1];
            this.show(new ComponentWithProperties(TicketView, { secret }).setAnimated(false))
        } else if (path.length == 1 && path[0] == 'payment' && params.get("id")) {
            const paymentId = params.get("id")
            const me = this
            this.show({
                components: [
                    new ComponentWithProperties(PaymentPendingView, { 
                        server: WebshopManager.server, 
                        paymentId,
                        finishedHandler: function(this: NavigationMixin, payment: Payment | null) {
                            if (payment && payment.status == PaymentStatus.Succeeded) {
                                // Can't use this.show, becaus this is deactivated -> no parents
                                this.navigationController!.push({
                                    components: [
                                        new ComponentWithProperties(OrderView, { paymentId: payment.id, success: true })
                                    ],
                                    animated: false,
                                    replace: 1,
                                    force: true
                                }).catch(console.error)
                            } else {
                                this.navigationController!.popToRoot({ force: true }).catch(e => console.error(e))
                                new CenteredMessage("Betaling mislukt", "De betaling werd niet voltooid of de bank heeft de betaling geweigerd. Probeer het opnieuw.", "error").addCloseButton().show()
                                me.resumeStep(CheckoutStepType.Payment).catch(e => {
                                    console.error(e)
                                })
                            }
                        } 
                    })
                ],
                animated: false,
                force: true
            })
        } else if (path.length == 2 && path[0] == 'checkout') {
            const stepName = Formatter.capitalizeFirstLetter(path[1])
            if (Object.values(CheckoutStepType).includes(stepName as any)) {
                const step = stepName as CheckoutStepType
                this.resumeStep(step, false).catch(e => {
                    console.error(e)
                })
            }
        } else if (path.length == 1 && path[0] == 'cart') {
            this.openCart(false)
        }
    }

    async resumeStep(destination: CheckoutStepType, animated = true) {
         // Quickly recreate all steps
        let step: CheckoutStepType | undefined = undefined
        const components: Promise<any>[] = []

        while (step != destination) {
            try {
                const nextStep = await CheckoutStepsManager.getNextStep(step)
                if (!nextStep) {
                    break;
                }
                components.push(nextStep.getComponent())
                step = nextStep.type
            } catch (e) {
                // Possible invalid checkout -> stop here
                break;
            }
        }

        const comp = await Promise.all(components)
        if (comp.length == 0) {
            this.openCart(animated)
            return;
        }
        const replaceWith = comp.map(component => new ComponentWithProperties(component, {}))

        // Can't use show here -> might be deactivated
        await this.navigationController!.push({
            components: replaceWith,
            animated,
        })
    }

    deactivated() {
        // For an unknown reason, activated is also called when the view is displayed for the first time
        // so we need to only start setting the url when we were deactivated first
        this.visible = false
    }

    beforeDestroy() {
        GlobalEventBus.removeListener(this)
    }

    activated() {
        this.visible = true
    }
}
</script>

<style lang="scss">
@use "@stamhoofd/scss/base/variables.scss" as *;
@use "@stamhoofd/scss/base/text-styles.scss" as *;

.webshop-view {
    /*display: flex;
    flex-direction: column;
    min-height: 100vh;
    box-sizing: border-box;
    min-height: calc(var(--vh, 1vh) * 100);*/

    .webshop-banner {
        height: 0px;
        width: 100%;
        margin: 0 auto;
        padding-bottom: 300 / 720 * 100%;
        background: $color-gray;
        border-radius: $border-radius;
        margin-bottom: 30px;
        margin-top: 0px;
        position: relative;

        @media (max-width: 801px) {
            margin-bottom: 20px;
        }

        img {
            position: absolute;
            border-radius: $border-radius;
            height: 100%;
            width: 100%;
            object-fit: cover;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
    }

    > main {
        @extend .main-text-container;

        .white-top > main > h1 {
            @extend .style-huge-title-1;
            padding-bottom: 15px;
        }

        .white-top > main .description {
            @extend .style-description;
            white-space: pre-wrap;
        }

        .stamhoofd-footer {
            padding-top: 15px;
            @extend .style-description-small;

            a {
                white-space: normal;
                text-overflow: initial;
                height: auto;
                line-height: 1.4;
            }

            strong {
                color: $color-primary-original;
            }
        }

        .legal-footer {
            @extend .style-description-small;
            padding-top: 30px;
            margin-top: auto;
            line-height: 1.6;

            > div {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap-reverse;

                @media (max-width: 500px) {
                    .stamhoofd-logo-container {
                        svg {
                            width: 120px;
                        }
                    }
                }

                > div, > aside {
                    &:first-child {
                        padding-right: 10px;
                    }

                    &:last-child {
                        --color-primary: #{$color-primary-original};
                        flex-shrink: 0;
                        text-align: right;

                        a {
                            display: flex;
                            flex-direction: row;
                            align-items: center;

                            > :last-child {
                                margin-left: 10px;
                            }

                            &, &:hover, &:link, &:active, &:visited {
                                color: $color-gray;
                                font-weight: 600;
                                text-decoration: none;
                            }
                        }
                    }
                }
            }
        }
    }

    //padding: 0 var(--st-horizontal-padding, 40px) var(--st-vertical-padding, 20px) var(--st-horizontal-padding, 40px);
    
    /*@media (min-width: 801px) {
        max-width: 800px;
        margin: 0 auto;
        min-height: auto;
    }*/
}
</style>
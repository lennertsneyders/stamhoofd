<template>
    <div id="app">
        <!--<ComponentWithPropertiesInstance :component="root" />-->
        <ModalStackComponent ref="modalStack" :root="root" />
        <ToastBox />
    </div>
</template>

<script lang="ts">
import { Decoder } from '@simonbackx/simple-encoding';
import { isSimpleError, isSimpleErrors } from '@simonbackx/simple-errors';
import { ComponentWithProperties, HistoryManager, ModalStackComponent, NavigationController } from "@simonbackx/vue-app-navigation";
import { CenteredMessage, CenteredMessageView, ColorHelper, ErrorBox, PromiseView, Toast, ToastBox } from '@stamhoofd/components';
import { I18nController } from '@stamhoofd/frontend-i18n';
import { NetworkManager, UrlHelper } from '@stamhoofd/networking';
import { OrganizationWithWebshop } from '@stamhoofd/structures';
import { GoogleTranslateHelper } from '@stamhoofd/utility';
import { Component, Vue } from "vue-property-decorator";

import { WebshopManager } from './classes/WebshopManager';
import InvalidWebshopView from './views/errors/InvalidWebshopView.vue';
import WebshopView from './views/WebshopView.vue';

@Component({
    components: {
        ModalStackComponent,
        ToastBox
    },
})
export default class App extends Vue {
    root = new ComponentWithProperties(PromiseView, {
        promise: async () => {
            // get organization
            try {
                const ignorePath = ["checkout", "order", "cart", "payment", "tickets"];
                const path = UrlHelper.shared.getParts()
                const response = await NetworkManager.server.request({
                    method: "GET",
                    path: "/webshop-from-domain",
                    query: {
                        domain: window.location.hostname,
                        uri: path[0] && !ignorePath.includes(path[0]) ? path[0] : ''
                    },
                    decoder: OrganizationWithWebshop as Decoder<OrganizationWithWebshop>
                })

                I18nController.skipUrlPrefixForLocale = "nl-"+response.data.organization.address.country
                await I18nController.loadDefault("webshop", response.data.organization.address.country, "nl", response.data.organization.address.country)

                WebshopManager.organization = response.data.organization
                WebshopManager.webshop = response.data.webshop

                document.title = WebshopManager.webshop.meta.name +" - "+WebshopManager.organization.name

                // Set color
                if (WebshopManager.organization.meta.color) {
                    ColorHelper.setColor(WebshopManager.organization.meta.color)
                }

                return new ComponentWithProperties(NavigationController, { 
                    root: new ComponentWithProperties(WebshopView, {}) 
                })

            } catch (e) {
                if (!I18nController.shared) {
                    try {
                        await I18nController.loadDefault("webshop", undefined, "nl")
                    } catch (e) {
                        console.error(e)
                    }
                }

                if (isSimpleError(e) || isSimpleErrors(e)) {
                    if (!(e.hasCode("invalid_domain") || e.hasCode("unknown_organization") || e.hasCode("unknown_webshop"))) {
                        Toast.fromError(e).show()

                        return new ComponentWithProperties(InvalidWebshopView, {
                            errorBox: new ErrorBox(e)
                        })
                    }
                }
                return new ComponentWithProperties(InvalidWebshopView, {})
            }
        }
    })

    created() {
        if (GoogleTranslateHelper.isGoogleTranslateDomain(window.location.hostname)) {
            // Enable translations
            document.documentElement.translate = true
        }

        if (STAMHOOFD.environment == "development") {
            ComponentWithProperties.debug = true
        }
        HistoryManager.activate();
    }

    mounted() {
        CenteredMessage.addListener(this, async (centeredMessage) => {
            if (this.$refs.modalStack === undefined) {
                // Could be a webpack dev server error (HMR) (not fixable) or called too early
                await this.$nextTick()
            }
            (this.$refs.modalStack as any).present(
                {
                    components: [new ComponentWithProperties(CenteredMessageView, { centeredMessage }).setDisplayStyle("overlay")]
                }
            )
        })
    }
		
}
</script>

<style lang="scss">
// We need to include the component styling of vue-app-navigation first
@use "~@stamhoofd/scss/main";
@import "~@simonbackx/vue-app-navigation/dist/main.css";
</style>

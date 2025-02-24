// import 'core-js/stable'; // only needed for entry or 'false' useBuiltIns
// import 'regenerator-runtime/runtime'; // only needed for entry or 'false' useBuiltIns

// Load icon font
require('@stamhoofd/assets/images/icons/icons.font');

import * as Sentry from "@sentry/vue";
import { ViewportHelper } from "@stamhoofd/components";
import { I18nController } from "@stamhoofd/frontend-i18n";
import Vue from "vue";
import VueMeta from 'vue-meta'

Vue.use(VueMeta)

const isPrerender = navigator.userAgent.toLowerCase().indexOf('prerender') !== -1;

if (!isPrerender && STAMHOOFD.environment == "production") {
    Sentry.init({
        Vue,
        dsn: "https://23478e05aa5948959641d836213ba82c@o431770.ingest.sentry.io/6002543",
        logErrors: true
    });
}

import App from "./App.vue";
const i18n = I18nController.getI18n()
I18nController.fixedCountry = true

const app = new Vue({
    i18n,
    render: (h) => h(App),
});

(window as any).app = app;
ViewportHelper.setup()
app.$mount("#app")
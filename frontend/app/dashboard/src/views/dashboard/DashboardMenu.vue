<template>
    <div class="st-menu st-view">
        <STNavigationBar v-if="isNative" :title="organization.name" />
        <main>
            <h1 v-if="isNative" @click="switchOrganization">
                <span>{{ organization.name }}</span>
                <span class="icon arrow-down-small gray" />
            </h1>

            <div v-else class="padding-group">
                <Logo />
                <button id="organization-switcher" @click="switchOrganization">
                    <span class="text">{{ organization.name }}</span>
                    <span class="icon arrow-down-small gray" />
                </button>
            </div>

            <button v-if="whatsNewBadge" class="menu-button button heading" @click="manageWhatsNew()">
                <span class="icon gift" />
                <span>Wat is er nieuw?</span>
                <span v-if="whatsNewBadge" class="bubble">{{ whatsNewBadge }}</span>
            </button>

            <button v-if="fullAccess && organization.privateMeta && organization.privateMeta.requestKeysCount > 0" class="menu-button button heading" :class="{ selected: currentlySelected == 'keys' }" @click="manageKeys()">
                <span class="icon key" />
                <span>Gebruikers goedkeuren</span>
                <span class="bubble">{{ organization.privateMeta.requestKeysCount }}</span>
            </button>

            <hr v-if="whatsNewBadge || (enableMemberModule && false) || (fullAccess && organization.privateMeta && organization.privateMeta.requestKeysCount > 0)">

            <template v-if="enableMemberModule">
                <div v-for="category in tree.categories" :key="category.id">
                    <div>
                        <button class="menu-button button heading" :class="{ selected: currentlySelected == 'category-'+category.id }" @click="openCategory(category)">
                            <span class="icon group" />
                            <span>{{ category.settings.name }}</span>
                            <span v-if="isCategoryDeactivated(category)" v-tooltip="'Deze categorie is onzichtbaar voor leden omdat activiteiten niet geactiveerd is'" class="icon error red right-icon" />
                        </button>

                        <button
                            v-for="group in category.groups"
                            :key="group.id"
                            class="menu-button button"
                            :class="{ selected: currentlySelected == 'group-'+group.id }"
                            @click="openGroup(group)"
                        >
                            <span>{{ group.settings.name }}</span>
                        </button>

                        <button
                            v-for="c in category.categories"
                            :key="c.id"
                            class="menu-button button"
                            :class="{ selected: currentlySelected == 'category-'+c.id }"
                            @click="openCategory(c)"
                        >
                            <span>{{ c.settings.name }}</span>
                        </button>
                    </div>
                    <hr>
                </div>
            </template>
        

            <div v-if="enableWebshopModule && (canCreateWebshops || webshops.length > 0)">
                <button class="menu-button heading">
                    <span class="icon basket" />
                    <span>Webshops</span>
                    <button v-if="canCreateWebshops" class="button text" @click="addWebshop()">
                        <span class="icon add" />
                        <span>Nieuw</span>
                    </button>
                </button>

                <button
                    v-for="webshop in webshops"
                    :key="webshop.id"
                    class="menu-button button"
                    :class="{ selected: currentlySelected == 'webshop-'+webshop.id }"
                    @click="openWebshop(webshop)"
                >
                    {{ webshop.meta.name }}
                </button>
            </div>
            <hr v-if="enableWebshopModule && (canCreateWebshops || webshops.length > 0)">

            <button v-if="canManagePayments" class="menu-button button heading" :class="{ selected: currentlySelected == 'manage-payments'}" @click="managePayments(true)"> 
                <span class="icon card" />
                <span>Overschrijvingen</span>
            </button>

            <div v-if="fullAccess">
                <button class="menu-button button heading" :class="{ selected: currentlySelected == 'manage-settings'}" @click="manageSettings(true)">
                    <span class="icon settings" />
                    <span>Instellingen</span>
                </button>

                <button v-if="isSGV" class="menu-button button heading" :class="{ selected: currentlySelected == 'manage-sgv-groepsadministratie'}" @click="openSyncScoutsEnGidsen(true)">
                    <span class="icon sync" />
                    <span>Groepsadministratie</span>
                </button>
            </div>
            <hr v-if="fullAccess || canManagePayments">
            <div class="">
                <button class="menu-button button heading" :class="{ selected: currentlySelected == 'manage-account'}" @click="manageAccount(true)">
                    <span class="icon user" />
                    <span>Mijn account</span>
                </button>

                <a class="menu-button button heading" :href="'https://'+$t('shared.domains.marketing')+'/docs'" target="_blank">
                    <span class="icon info" />
                    <span>Documentatie</span>
                </a>

                <button class="menu-button button heading" @click="gotoFeedback(false)">
                    <span class="icon feedback" />
                    <span>Feedback</span>
                </button>

                <button class="menu-button button heading" @click="logout">
                    <span class="icon logout" />
                    <span>Uitloggen</span>
                </button>
            </div>
        </main>
    </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentWithProperties } from "@simonbackx/vue-app-navigation";
import { NavigationMixin } from "@simonbackx/vue-app-navigation";
import { NavigationController } from "@simonbackx/vue-app-navigation";
import { CenteredMessage, LoadComponent, Logo, STNavigationBar,TooltipDirective } from '@stamhoofd/components';
import { AppManager, SessionManager, UrlHelper } from '@stamhoofd/networking';
import { Group, GroupCategory, GroupCategoryTree, OrganizationType, Permissions, UmbrellaOrganization, WebshopPreview } from '@stamhoofd/structures';
import { Formatter } from "@stamhoofd/utility";
import { Component, Mixins } from "vue-property-decorator";

import { openNolt } from "../../classes/NoltHelper";
import { OrganizationManager } from '../../classes/OrganizationManager';
import { WhatsNewCount } from '../../classes/WhatsNewCount';

@Component({
    components: {
        Logo,
        STNavigationBar
    },
    directives: {
        tooltip: TooltipDirective
    }
})
export default class DashboardMenu extends Mixins(NavigationMixin) {
    SessionManager = SessionManager // needed to make session reactive
    currentlySelected: string | null = null
    whatsNewBadge = ""

    get organization() {
        return OrganizationManager.organization
    }

    get isNative() {
        return AppManager.shared.isNative
    }

    get isSGV() {
        return this.organization.meta.type == OrganizationType.Youth && this.organization.meta.umbrellaOrganization == UmbrellaOrganization.ScoutsEnGidsenVlaanderen
    }

    get tree() {
        return this.organization.categoryTreeForPermissions(OrganizationManager.user.permissions ?? Permissions.create({}))
    }

    mounted() {
        const parts = UrlHelper.shared.getParts()

        UrlHelper.setUrl("/")
        let didSet = false

        if ((parts.length >= 1 && parts[0] == 'settings') || (parts.length == 2 && parts[0] == 'oauth' && parts[1] == 'mollie')) {
            if (this.fullAccess) {
                this.manageSettings(false).catch(console.error)
                didSet = true
            }
        }

        if (parts.length >= 1 && parts[0] == 'transfers') {
            if (this.canManagePayments) {
                this.managePayments(false).catch(console.error).finally(() => UrlHelper.shared.clear())
                didSet = true
            }
        }

        if (parts.length >= 1 && parts[0] == 'account') {
            this.manageAccount(false).catch(console.error).finally(() => UrlHelper.shared.clear())
            didSet = true
        }

        if ((parts.length >= 1 && parts[0] == 'scouts-en-gidsen-vlaanderen') || (parts.length == 2 && parts[0] == 'oauth' && parts[1] == 'sgv')) {
            if (this.fullAccess) {
                this.openSyncScoutsEnGidsen(false).catch(console.error)
                didSet = true
            }
        }

        if ((parts.length == 2 && parts[0] == 'auth' && parts[1] == 'nolt')) {
            this.gotoFeedback(true).catch(console.error).finally(() => UrlHelper.shared.clear())
        }

        if (!didSet && this.enableMemberModule && parts.length >= 2 && parts[0] == "category") {
            for (const category of this.organization.meta.categories) {
                if (parts[1] == Formatter.slug(category.settings.name)) {
                    if (parts[2] && parts[2] == "all") {
                        this.openCategoryMembers(category, false).catch(console.error).finally(() => UrlHelper.shared.clear())
                    } else {
                        this.openCategory(category, false).catch(console.error).finally(() => UrlHelper.shared.clear())
                    }
                    didSet = true
                    break;
                }
            }
        }

        if (!didSet && this.enableMemberModule && parts.length >= 2 && parts[0] == "groups") {
            for (const group of this.organization.groups) {
                if (parts[1] == Formatter.slug(group.settings.name)) {
                    this.openGroup(group, false).catch(console.error).finally(() => UrlHelper.shared.clear())
                    didSet = true
                    break;
                }
            }
        }

        if (!didSet && this.enableWebshopModule && parts.length >= 2 && parts[0] == "webshops") {
            for (const webshop of this.organization.webshops) {
                if (parts[1] == Formatter.slug(webshop.meta.name)) {
                    this.openWebshop(webshop, false).catch(console.error)
                    didSet = true
                    break;
                }
            }
        }
        
        if (!didSet && !this.splitViewController?.shouldCollapse()) {
            UrlHelper.shared.clear()
            //if (this.groups.length > 0) {
                //this.openGroup(this.groups[0], false)
            //} else {
                if (this.fullAccess) {
                    this.manageSettings(false).catch(console.error)
                } else {
                    this.manageAccount(false).catch(console.error)
                }
            //}
        }

        document.title = "Stamhoofd - "+OrganizationManager.organization.name

        const currentCount = localStorage.getItem("what-is-new")
        if (currentCount) {
            const c = parseInt(currentCount)
            if (!isNaN(c) && WhatsNewCount - c > 0) {
                this.whatsNewBadge = (WhatsNewCount - c).toString()
            }
        } else {
            localStorage.setItem("what-is-new", (WhatsNewCount as any).toString());
        }

        if (!didSet && this.fullAccess) {
            if (!this.organization.meta.modules.useMembers && !this.organization.meta.modules.useWebshops) {
                LoadComponent(() => import(/* webpackChunkName: "SignupModulesView" */ "../signup/SignupModulesView.vue"), {}, { instant: true }).then((component) => {
                    this.present(component.setDisplayStyle("popup").setAnimated(false))
                }).catch(console.error)
            }
        }
    }

    get webshops() {
        return this.organization.webshops
    }

    switchOrganization() {
        SessionManager.deactivateSession()
    }

    async openGroup(group: Group, animated = true) {
        this.currentlySelected = "group-"+group.id
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "GroupMembersView", webpackPrefetch: true */  "./groups/GroupMembersView.vue"), { group }, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async manageKeys(animated = true) {
        this.currentlySelected = "keys"
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "KeysView" */ "./keys/KeysView.vue"), {}, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async openCategory(category: GroupCategory, animated = true) {
        this.currentlySelected = "category-"+category.id
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "CategoryView" */ "./groups/CategoryView.vue"), { category }, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async openCategoryMembers(category: GroupCategory, animated = true) {
        this.currentlySelected = "category-"+category.id

        this.showDetail(new ComponentWithProperties(NavigationController, { 
            root: await LoadComponent(() => import(/* webpackChunkName: "GroupMembersView", webpackPrefetch: true */ "./groups/GroupMembersView.vue"), {
                category: GroupCategoryTree.build(category, this.organization.meta.categories, this.organization.groups)
            }, { instant: !animated })
        }).setAnimated(animated));
    }

    async openWebshop(webshop: WebshopPreview, animated = true) {
        this.currentlySelected = "webshop-"+webshop.id
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "WebshopOverview" */ './webshop/WebshopOverview.vue'), { preview: webshop }, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async managePayments(animated = true) {
        this.currentlySelected = "manage-payments"
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "PaymentsView" */ './payments/PaymentsView.vue'), {}, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async manageSettings(animated = true) {
        this.currentlySelected = "manage-settings"
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "SettingsView" */ './settings/SettingsView.vue'), {}, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async manageAccount(animated = true) {
        this.currentlySelected = "manage-account"
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "AccountSettingsView" */ './account/AccountSettingsView.vue'), {}, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    manageWhatsNew() {
        this.whatsNewBadge = ""

        window.open('https://'+this.$t('shared.domains.marketing')+'/release-notes', '_blank');
        localStorage.setItem("what-is-new", WhatsNewCount.toString());
    }

    async logout() {
        if (!await CenteredMessage.confirm("Ben je zeker dat je wilt uitloggen?", "Uitloggen")) {
            return;
        }
        SessionManager.logout()
    }

    async openSyncScoutsEnGidsen(animated = true) {
        this.currentlySelected = "manage-sgv-groepsadministratie"
        this.showDetail(
            new ComponentWithProperties(NavigationController, { 
                root: await LoadComponent(() => import(/* webpackChunkName: "SGVGroepsadministratieView" */'./settings/SGVGroepsadministratieView.vue'), {}, { instant: !animated })
            }).setAnimated(animated)
        );
    }

    async addWebshop() {
        this.present(
            (await LoadComponent(() => import(/* webpackChunkName: "EditWebshopView" */ './webshop/edit/EditWebshopView.vue'))).setDisplayStyle("popup")
        )
    }

    get canCreateWebshops() {
        return OrganizationManager.user.permissions?.canCreateWebshops(OrganizationManager.organization.privateMeta?.roles ?? [])
    }

    get canManagePayments() {
        return OrganizationManager.user.permissions?.canManagePayments(OrganizationManager.organization.privateMeta?.roles ?? [])
    }

    get fullAccess() {
        return SessionManager.currentSession!.user!.permissions!.hasFullAccess()
    }

    get fullReadAccess() {
        return SessionManager.currentSession!.user!.permissions!.hasReadAccess()
    }

    get enableMemberModule() {
        return this.organization.meta.modules.useMembers
    }

    get enableWebshopModule() {
        return this.organization.meta.modules.useWebshops
    }

    isCategoryDeactivated(category: GroupCategoryTree) {
        return this.organization.isCategoryDeactivated(category)
    }

    async gotoFeedback(check = false) {
        await openNolt(check)
    }
}
</script>
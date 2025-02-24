<template>
    <div id="account-view" class="st-view background">
        <STNavigationBar title="Mijn account">
            <BackButton v-if="canPop" slot="left" @click="pop" />
        </STNavigationBar>

        <main>
            <h1>
                Mijn account
            </h1>
        
            <STErrorsDefault :error-box="errorBox" />

            <STInputBox title="Naam" error-fields="firstName,lastName" :error-box="errorBox">
                <div class="input-group">
                    <div>
                        <input v-model="firstName" class="input" type="text" placeholder="Voornaam" autocomplete="given-name">
                    </div>
                    <div>
                        <input v-model="lastName" class="input" type="text" placeholder="Achternaam" autocomplete="family-name">
                    </div>
                </div>
            </STInputBox>

            <EmailInput v-model="email" title="E-mailadres" :validator="validator" placeholder="Vul jouw e-mailadres hier in" autocomplete="username" />

            <button class="button text" @click="openChangePassword">
                Wachtwoord wijzigen
            </button>
        </main>

        <STToolbar>
            <template slot="right">
                <LoadingButton :loading="saving">
                    <button class="button primary" @click="save">
                        Opslaan
                    </button>
                </LoadingButton>
            </template>
        </STToolbar>
    </div>
</template>

<script lang="ts">
import { AutoEncoder, AutoEncoderPatchType, patchContainsChanges } from '@simonbackx/simple-encoding';
import { SimpleErrors } from '@simonbackx/simple-errors';
import { ComponentWithProperties, NavigationMixin } from "@simonbackx/vue-app-navigation";
import { BackButton, CenteredMessage, ChangePasswordView,Checkbox, ConfirmEmailView, DateSelection, EmailInput, ErrorBox, LoadingButton, RadioGroup, STErrorsDefault,STInputBox, STNavigationBar, STToolbar, Toast, Validator } from "@stamhoofd/components";
import { LoginHelper,SessionManager } from '@stamhoofd/networking';
import { UrlHelper } from '@stamhoofd/networking';
import { Organization, OrganizationPatch, User, Version } from "@stamhoofd/structures"
import { Component, Mixins } from "vue-property-decorator";

import { OrganizationManager } from "../../../classes/OrganizationManager"

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STInputBox,
        STErrorsDefault,
        Checkbox,
        DateSelection,
        RadioGroup,
        BackButton,
        LoadingButton,
        EmailInput
    },
})
export default class AccountSettingsView extends Mixins(NavigationMixin) {
    errorBox: ErrorBox | null = null
    validator = new Validator()
    saving = false
    showDomainSettings = true
    
    get user() {
        return User.create(SessionManager.currentSession!.user!)
    }

    userPatch = User.patch({ id: this.user.id })
    organizationPatch: AutoEncoderPatchType<Organization> & AutoEncoder = OrganizationPatch.create({ id: OrganizationManager.organization.id })

    mounted() {
        UrlHelper.setUrl("/account")
        document.title = "Stamhoofd - Mijn account"
    }

    get patchedUser() {
        return this.user.patch(this.userPatch)
    }

    get email() {
        return this.patchedUser.email
    }

    set email(email: string) {
        this.$set(this.userPatch, "email", email)
    }

    get firstName() {
        return this.patchedUser.firstName
    }

    set firstName(firstName: string | null) {
        this.$set(this.userPatch, "firstName", firstName)
    }

    get lastName() {
        return this.patchedUser.lastName
    }

    set lastName(lastName: string | null) {
        this.$set(this.userPatch, "lastName", lastName)
    }

    async save() {
        if (this.saving) {
            return;
        }

        const errors = new SimpleErrors()
        // validations here

        let valid = false

        if (errors.errors.length > 0) {
            this.errorBox = new ErrorBox(errors)
        } else {
            this.errorBox = null
            valid = true
        }
        valid = valid && await this.validator.validate()

        if (!valid) {
            return;
        }

        this.saving = true

        try {
            const result = await LoginHelper.patchUser(SessionManager.currentSession!, this.userPatch)

            if (result.verificationToken) {
                this.present(new ComponentWithProperties(ConfirmEmailView, { session: SessionManager.currentSession!, token: result.verificationToken }).setDisplayStyle("sheet"))
            } else {
                const toast = new Toast('De wijzigingen zijn opgeslagen', "success green")
                toast.withOffset = true
                toast.show()
            }

            // Create a new patch
            this.userPatch = User.patch({ id: this.user.id })
        } catch (e) {
            this.errorBox = new ErrorBox(e)
        }

        this.saving = false
    }

    async shouldNavigateAway() {
        if (!patchContainsChanges(this.userPatch, this.user, { version: Version })) {
            return true;
        }
        if (await CenteredMessage.confirm("Ben je zeker dat je wilt sluiten zonder op te slaan?", "Sluiten zonder opslaan")) {
            return true;
        }
        return false;
    }

    openChangePassword() {
        this.present(new ComponentWithProperties(ChangePasswordView, {}).setDisplayStyle("sheet"))
    }

}
</script>

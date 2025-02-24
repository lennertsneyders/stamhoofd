<template>
    <div id="sgv-report-view" class="st-view">
        <STNavigationBar title="Synchronisatie-rapport">
            <BackButton v-if="canPop" slot="left" @click="pop" />
            <button v-if="canDismiss" slot="right" class="button icon close gray" @click="dismiss" />
        </STNavigationBar>

        <main>
            <h1>
                Synchronisatie-rapport
            </h1>

            <div class="info-box">
                Kijk zelf ook nog snel eens alles na in de groepsadministratie als het de eerste keer is dat je synchroniseert.
            </div>

            <div v-for="(error, index) in report.errors" :key="index" class="error-box-parent">
                <div class="error-box" :class="{ selectable: canClickError(error)}" @click="handleError(error)">
                    <h2 v-if="error.member" class="style-title-list">
                        {{ error.member.firstName }} {{ error.member.lastName || error.member.details.lastName }}<span v-if="canClickError(error)" class="icon arrow-right-small" />
                    </h2>
                    {{ getErrorMessage(error) }}
                </div>
            </div>

            <div v-for="(warning, index) in report.warnings" :key="index" class="warning-box">
                {{ warning }}
            </div>

            <template v-if="report.deleted.length > 0">
                <hr>
                <h2>Geschrapt in de groepsadministratie</h2>
                <STList>
                    <STListItem v-for="member in report.deleted" :key="member.id">
                        <div>
                            <h2 class="style-title-list">
                                {{ member.firstName }} {{ member.lastName }}
                            </h2>
                            <p class="style-description-small">
                                {{ member.birthDay | date }}
                            </p>
                        </div>
                    </STListItem>
                </STList>
            </template>
        
            <template v-if="report.created.length > 0">
                <hr>
                <h2>Nieuwe leden toegevoegd in de groepsadministratie</h2>
                <STList>
                    <STListItem v-for="member in report.created" :key="member.id">
                        <div>
                            <h2 class="style-title-list">
                                {{ member.details.firstName }} {{ member.details.lastName }}
                            </h2>
                            <p class="style-description-small">
                                {{ member.details.birthDay | date }}
                            </p>
                        </div>
                    </STListItem>
                </STList>
            </template>

            <template v-if="report.synced.length > 0">
                <hr>
                <h2>Aangepaste leden in de groepsadministratie</h2>
                <STList>
                    <STListItem v-for="member in report.synced" :key="member.id">
                        <div>
                            <h2 class="style-title-list">
                                {{ member.details.firstName }} {{ member.details.lastName }}
                            </h2>
                            <p class="style-description-small">
                                {{ member.details.birthDay | date }}
                            </p>
                        </div>
                    </STListItem>
                </STList>
            </template>

            <template v-if="report.imported.length > 0">
                <hr>
                <h2>Geïmporteerd in Stamhoofd</h2>
                <STList>
                    <STListItem v-for="member in report.imported" :key="member.id">
                        <div>
                            <h2 class="style-title-list">
                                {{ member.details.firstName }} {{ member.details.lastName }}
                            </h2>
                            <p class="style-description-small">
                                {{ member.details.birthDay | date }}
                            </p>
                        </div>
                    </STListItem>
                </STList>
            </template>
        </main>

        <STToolbar>
            <template slot="right">
                <LoadingButton :loading="loading">
                    <button class="button primary" type="button" @click="goNext">
                        Sluiten
                    </button>
                </LoadingButton>
            </template>
        </STToolbar>
    </div>
</template>

<script lang="ts">
import { isSimpleError, isSimpleErrors, SimpleError } from "@simonbackx/simple-errors";
import { ComponentWithProperties, NavigationMixin } from "@simonbackx/vue-app-navigation";
import { BackButton, Checkbox, LoadingButton, STErrorsDefault, STInputBox, STList, STListItem, STNavigationBar, STToolbar } from "@stamhoofd/components";
import { Formatter } from '@stamhoofd/utility';
import { Component, Mixins,Prop } from "vue-property-decorator";

import { SGVSyncReport } from '../../../classes/SGVGroepsadministratieSync';
import MemberView from '../member/MemberView.vue';

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STInputBox,
        STList,
        STListItem,
        STErrorsDefault,
        Checkbox,
        BackButton,
        LoadingButton
    },
    filters: {
        date: Formatter.date.bind(Formatter)
    }
})
export default class SGVReportView extends Mixins(NavigationMixin) {
    loading = false

    @Prop({ required: true })
    report: SGVSyncReport

    goNext() {
        if (this.loading) {
            return;
        }

        this.dismiss({ force: true })
    }

    getErrorMessage(error: Error) {
        if (!isSimpleError(error) || !isSimpleErrors(error)) {
            return error.message
        }
        
        if (error.hasCode("network_error") || error.hasCode("network_timeout")) {
            return "Geen of slechte internetverbinding"
        }
        return error.getHuman()
    }

    canClickError(error) {
        return (error.member && error.member.details)
    }

    handleError(error) {
        if (error.member && error.member.details) {
            this.present(new ComponentWithProperties(MemberView, { member: error.member }).setDisplayStyle("popup"))
        }
    } 
}
</script>
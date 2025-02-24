<template>
    <div class="st-view record-edit-view">
        <STNavigationBar :title="title">
            <template slot="right">
                <button v-if="!isNew" class="button text" @click="deleteMe">
                    <span class="icon trash" />
                    <span>Verwijderen</span>
                </button>
                <button class="button icon close gray" @click="pop" />
            </template>
        </STNavigationBar>

        <main>
            <h1>
                {{ title }}
            </h1>
        
            <STErrorsDefault :error-box="errorBox" />

            <div class="split-inputs">
                <div>
                    <STInputBox title="Naam (kort)" error-fields="name" :error-box="errorBox">
                        <input
                            ref="firstInput"
                            v-model="name"
                            class="input"
                            type="text"
                            placeholder="bv. Toestemming publicatie foto’s"
                            autocomplete=""
                        >
                    </STInputBox>
                </div>

                <div />
            </div>

            <STInputBox title="Type" error-fields="type" :error-box="errorBox" class="max">
                <STList>
                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Checkbox" name="type" />
                        <h3 class="style-title-list">
                            Aankruisvakje
                        </h3>
                        <p class="style-description-small">
                            Je kan nog een extra opmerking vragen indien aangevinkt
                        </p>
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.ChooseOne" name="type" />
                        Kies één uit lijst
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.MultipleChoice" name="type" />
                        Kies meerdere uit lijst
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Text" name="type" />
                        Tekst op één lijn
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Textarea" name="type" />
                        Meerdere lijnen tekst
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Address" name="type" />
                        Adres
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Phone" name="type" />
                        Telefoonnummer
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="type" :value="RecordType.Email" name="type" />
                        E-mailadres
                    </STListItem>
                </STList>
            </STInputBox>

            <STInputBox v-if="type == RecordType.MultipleChoice || type == RecordType.ChooseOne" title="Keuzemogelijkheden" error-fields="choices" :error-box="errorBox" class="max">
                <template slot="right">
                    <button class="button text" @click="addChoice">
                        <span class="icon add" />
                        <span>Nieuw</span>
                    </button>
                </template>

                <STList v-if="patchedRecord.choices.length > 0">
                    <RecordChoiceRow v-for="choice in patchedRecord.choices" :key="choice.id" :choice="choice" :parent-record="patchedRecord" :selectable="true" @patch="addChoicesPatch" />
                </STList>
                
                <p v-else class="info-box">
                    Geen keuzemogelijkheden. Voeg een keuze toe via de <span class="icon add middle" />-knop.
                </p>
            </STInputBox>

            <hr>
            <h2 class="style-with-button">
                <div>Formulier</div>
                <div>
                    <button class="button text" @click="openPreview">
                        <span class="icon eye" />
                        <span>Voorbeeld</span>
                    </button>
                </div>
            </h2>
            <p>Het kenmerk dat je hebt toegevoegd moet natuurlijk op één of andere manier kunnen worden ingesteld. Hier bepaal je hoe dat formulier eruit ziet en welke beschrijving en tekst daarbij staat. Kijk zeker het voorbeeld na om te zien hoe iemand het kenmerk zal kunnen wijzigen of instellen.</p>

            <STInputBox :title="labelTitle" error-fields="label" :error-box="errorBox" class="max">
                <input
                    v-model="label"
                    class="input"
                    type="text"
                    :placeholder="name"
                    autocomplete=""
                >
            </STInputBox>
            <Checkbox v-model="required">
                {{ requiredText }}
            </Checkbox>

            <STInputBox :title="descriptionTitle" error-fields="description" :error-box="errorBox" class="max">
                <textarea
                    v-model="description"
                    class="input"
                    type="text"
                    placeholder="Optioneel"
                    autocomplete=""
                />
            </STInputBox>
            <p class="style-description-small">
                Gebruik deze tekst voor een langere uitleg bij het instellen van dit kenmerk, enkel indien dat echt nodig is.
            </p>

            <Checkbox v-if="type == RecordType.Checkbox" v-model="askComments">
                Voeg tekstvak toe indien aangevinkt
            </Checkbox>

            <STInputBox v-if="shouldAskInputPlaceholder" title="Tekst in leeg tekstvak" error-fields="label" :error-box="errorBox" class="max">
                <input
                    v-model="inputPlaceholder"
                    class="input"
                    type="text"
                    placeholder="bv. 'Vul hier jouw naam in'"
                    autocomplete=""
                >
            </STInputBox>
            <p class="style-description-small">
                Het is netter als je een tekst in lege tekstvakken instelt. Je kan van deze plaats gebruik maken om een voorbeeld te geven, om het duidelijker te maken (zoals we zelf doen hierboven).
            </p>

            <STInputBox v-if="shouldAskCommentsDescription" title="Tekst onder tekstvak" error-fields="label" :error-box="errorBox" class="max">
                <textarea
                    v-model="commentsDescription"
                    class="input"
                    type="text"
                    placeholder="Optioneel"
                    autocomplete=""
                />
            </STInputBox>
            <p v-if="shouldAskCommentsDescription" class="style-description-small">
                Laat hier eventueel extra instructies achter onder het tekstveld, als het aankruisvakje is aangevinkt.
            </p>

            <template v-if="canAddWarning">
                <hr>
                <h2>Waarschuwing</h2>
                <p>Soms wil je dat iets opvalt, dat kan je bereiken met waarschuwingen. Die zijn zichtbaar als dit kenmerk een bepaalde waarde heeft.</p>

                <STList>
                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="warningInverted" :value="null" name="warningInverted" />
                        <h3 class="style-title-list">
                            Geen waarschuwing
                        </h3>
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="warningInverted" :value="false" name="warningInverted" />
                        <h3 class="style-title-list">
                            {{ warningNonInvertedText }}
                        </h3>
                    </STListItem>

                    <STListItem :selectable="true" element-name="label">
                        <Radio slot="left" v-model="warningInverted" :value="true" name="warningInverted" />
                        <h3 class="style-title-list">
                            {{ warningInvertedText }}
                        </h3>
                    </STListItem>
                </STList>

                <STInputBox v-if="warningText !== null" title="Waarschuwingstekst" error-fields="label" :error-box="errorBox" class="max">
                    <input
                        v-model="warningText"
                        class="input"
                        type="text"
                        placeholder="bv. 'Geen toestemming om foto's te maken'"
                        autocomplete=""
                    >
                </STInputBox>

                <STInputBox v-if="warningType" class="max" title="Type">
                    <STList>
                        <STListItem :selectable="true" element-name="label">
                            <Radio slot="left" v-model="warningType" :value="RecordWarningType.Info" name="warningType" />
                            <h3 class="style-title-list">
                                Informatief
                            </h3>
                            <p class="style-description-small">
                                Grijze achtergrond. Voor minder belangrijke zaken
                            </p>
                        </STListItem>

                        <STListItem :selectable="true" element-name="label">
                            <Radio slot="left" v-model="warningType" :value="RecordWarningType.Warning" name="warningType" />
                            <h3 class="style-title-list">
                                Waarschuwing
                            </h3>
                            <p class="style-description-small">
                                Gele achtergrond
                            </p>
                        </STListItem>

                        <STListItem :selectable="true" element-name="label">
                            <Radio slot="left" v-model="warningType" :value="RecordWarningType.Error" name="warningType" />
                            <h3 class="style-title-list">
                                Foutmelding
                            </h3>
                            <p class="style-description-small">
                                Voor zaken die echt heel belangrijk zijn. Probeer dit weinig te gebruiken, zet niet alles op 'foutmelding', anders valt het niet meer op.
                            </p>
                        </STListItem>
                    </STList>
                </STInputBox>
            </template>

            <hr>
            <h2>Opslag en beveiliging</h2>
            <p>
                Verzamel je gevoelige informatie? Dan moet je daar in de meeste gevallen toestemming voor vragen volgens de GDPR-wetgeving. We raden je aan om altijd toestemming te vragen zodra je ook maar een beetje twijfelt. In onze gids geven we enkele voorbeelden, lees die zeker na. <a :href="'https://'+$t('shared.domains.marketing')+'/docs/toestemming-gegevens-verzamelen'" class="inline-link" target="_blank" rel="noopener">
                    Lees onze gids
                </a>
            </p>


            <Checkbox v-model="sensitive">
                Ik heb toestemming nodig om deze informatie te verzamelen, of de antwoorden zijn (of bevatten mogelijks) gevoelige informatie
            </Checkbox>
            <Checkbox v-if="!sensitive" v-model="encrypted">
                <h3 class="style-title-list">
                    Sla antwoorden end-to-end-versleuteld op
                </h3>
                <p class="style-description-small">
                    Vink dit zeker aan bij: vrije invoer, contactgegevens of persoonsgegevens
                </p>
            </Checkbox>
        </main>

        <STToolbar>
            <template slot="right">
                <button class="button secundary" @click="cancel">
                    Annuleren
                </button>
                <button class="button primary" @click="save">
                    Opslaan
                </button>
            </template>
        </STToolbar>
    </div>
</template>

<script lang="ts">
import { AutoEncoderPatchType, PatchableArray, PatchableArrayAutoEncoder, patchContainsChanges } from '@simonbackx/simple-encoding';
import { ComponentWithProperties, NavigationController, NavigationMixin } from "@simonbackx/vue-app-navigation";
import { CenteredMessage, Checkbox,ErrorBox, Radio,Spinner,STErrorsDefault,STInputBox, STList, STListItem, STNavigationBar, STToolbar, Toast, Validator } from "@stamhoofd/components";
import { RecordCategory, RecordChoice, RecordSettings, RecordType, RecordWarning,RecordWarningType,Version } from "@stamhoofd/structures"
import { Component, Mixins,Prop } from "vue-property-decorator";

import { OrganizationManager } from '../../../../../../classes/OrganizationManager';
import DataPermissionSettingsView from '../DataPermissionSettingsView.vue';
import EditRecordChoiceView from './EditRecordChoiceView.vue';
import PreviewRecordView from './PreviewRecordView.vue';
import RecordChoiceRow from "./RecordChoiceRow.vue"

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STInputBox,
        STErrorsDefault,
        Spinner,
        STList,
        STListItem,
        Radio,
        Checkbox,
        RecordChoiceRow
    },
})
export default class EditRecordView extends Mixins(NavigationMixin) {
    errorBox: ErrorBox | null = null
    validator = new Validator()

    @Prop({ required: true })
    record!: RecordSettings

    @Prop({ required: false, default: null })
    parentCategory!: RecordCategory | null

    @Prop({ required: true })
    isNew!: boolean

    patchRecord: AutoEncoderPatchType<RecordSettings> = RecordSettings.patch({ id: this.record.id })

    @Prop({ required: true })
    saveHandler: (patch: PatchableArrayAutoEncoder<RecordSettings>) => void;

    get patchedRecord() {
        return this.record.patch(this.patchRecord)
    }

    get RecordType() {
        return RecordType
    }

    get RecordWarningType() {
        return RecordWarningType
    }

    get canAddWarning() {
        return this.patchedRecord.type === RecordType.Checkbox || this.patchedRecord.type === RecordType.Text || this.patchedRecord.type === RecordType.Textarea
    }

    get warningNonInvertedText() {
        if (this.patchedRecord.type === RecordType.Checkbox) {
            return "Waarschuwing als aangevinkt"
        }
        return "Waarschuwing als ingevuld"
    }

    get warningInvertedText() {
        if (this.patchedRecord.type === RecordType.Checkbox) {
            return "Waarschuwing als niet aangevinkt"
        }
        return "Waarschuwing als niet ingevuld"
    }

    get title(): string {
        if (this.isNew) {
            return "Nieuw kenmerk"
        }
        return "Kenmerk bewerken"
    }

    get labelTitle(): string {
        if (this.type === RecordType.Checkbox) {
            return "Titel naast aankruisvakje"
        }
        if (this.type === RecordType.MultipleChoice) {
            return "Titel boven keuzemenu"
        }
        if (this.type === RecordType.ChooseOne) {
            return "Titel boven keuzemenu"
        }
        return "Titel boven tekstvak"
    }

    get descriptionTitle(): string {
        if (this.type === RecordType.Checkbox) {
            return "Beschrijving onder titel"
        }
        if (this.type === RecordType.MultipleChoice) {
            return "Beschrijving onder keuzemenu"
        }
        if (this.type === RecordType.ChooseOne) {
            return "Beschrijving onder keuzemenu"
        }
        return "Beschrijving onder tekstvak"
    }

    get name() {
        return this.patchedRecord.name
    }

    set name(name: string) {
        this.patchRecord = this.patchRecord.patch({ name })
    }

    get label() {
        return this.patchedRecord.label
    }

    set label(label: string) {
        this.patchRecord = this.patchRecord.patch({ label })
    }

    get required() {
        return this.patchedRecord.required
    }

    set required(required: boolean) {
        this.patchRecord = this.patchRecord.patch({ required })
    }

    get inputPlaceholder() {
        return this.patchedRecord.inputPlaceholder
    }

    set inputPlaceholder(inputPlaceholder: string) {
        this.patchRecord = this.patchRecord.patch({ inputPlaceholder })
    }

    get askComments() {
        return this.patchedRecord.askComments
    }

    set askComments(askComments: boolean) {
        this.patchRecord = this.patchRecord.patch({ askComments })
    }

    get shouldAskInput(): boolean {
        if (this.type === RecordType.Checkbox) {
            return this.askComments
        }
        if (this.type === RecordType.MultipleChoice) {
            return false
        }
        if (this.type === RecordType.ChooseOne) {
            return false
        }
        return true
    }

    get shouldAskInputPlaceholder(): boolean {
        if (!this.shouldAskInput) {
            return false
        }
        if (this.type === RecordType.Address) {
            return false
        }
        return true
    }

    get shouldAskCommentsDescription(): boolean {
        if (this.type === RecordType.Checkbox) {
            return this.askComments
        }
        return false
    }

    get requiredText() {
        if (this.type === RecordType.Checkbox) {
            return "Verplicht aankruisen"
        }
        if (this.type === RecordType.MultipleChoice) {
            return "Verplicht om minstens één keuze te selecteren"
        }
        if (this.type === RecordType.ChooseOne) {
            return "Verplicht om een keuze te selecteren"
        }
        return "Verplicht in te vullen"
    }

    get type() {
        return this.patchedRecord.type
    }

    set type(type: RecordType) {
        this.patchRecord = this.patchRecord.patch({ 
            type,
            // Set required if choose one and if it wasn't choose one when opening
            required: type === RecordType.ChooseOne && this.record.type !== RecordType.ChooseOne ? true : undefined
         })
    }

    get description() {
        return this.patchedRecord.description
    }

    set description(description: string) {
        this.patchRecord = this.patchRecord.patch({ description })
    }

    get commentsDescription() {
        return this.patchedRecord.commentsDescription
    }

    set commentsDescription(commentsDescription: string) {
        this.patchRecord = this.patchRecord.patch({ commentsDescription })
    }

    get warningInverted() {
        return this.patchedRecord.warning?.inverted ?? null
    }

    set warningInverted(inverted: boolean | null) {
        if (inverted === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: null
             })
            return
        }
        if (this.warningInverted === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.create({
                    inverted
                })
             })
        } else {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.patch({
                    inverted
                })
             })
        }
    }

    get warningText() {
        return this.patchedRecord.warning?.text ?? null
    }

    set warningText(text: string | null) {
        if (text === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: null
             })
            return
        }
        if (this.warningText === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.create({
                    text
                })
             })
        } else {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.patch({
                    text
                })
             })
        }
    }

    get warningType() {
        return this.patchedRecord.warning?.type ?? null
    }

    set warningType(type: RecordWarningType | null) {
        if (type === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: null
             })
            return
        }
        if (this.warningType === null) {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.create({
                    type
                })
             })
        } else {
            this.patchRecord = this.patchRecord.patch({ 
                warning: RecordWarning.patch({
                    type
                })
             })
        }
    }

    manageDataPermission(animated = true) {
        this.present(new ComponentWithProperties(NavigationController, {
            root: new ComponentWithProperties(DataPermissionSettingsView, {})
        }).setDisplayStyle("popup").setAnimated(animated))
    }

    get sensitive() {
        return this.patchedRecord.sensitive
    }

    set sensitive(sensitive: boolean) {
        if (sensitive && OrganizationManager.organization.meta.recordsConfiguration.dataPermission === null) {
            new Toast("Voor je kan instellen dat toestemming verplicht is voor dit kenmerk, moet je de functie om toestemming te vragen inschakelen.", "error red").show()
            this.manageDataPermission(true)
            return
        }
        // Always require encryption for sensitive information
        this.patchRecord = this.patchRecord.patch({ sensitive, encrypted: sensitive ? true : undefined })
    }

    get encrypted() {
        return this.patchedRecord.encrypted
    }

    set encrypted(encrypted: boolean) {
        // Always require encryption for sensitive information
        this.patchRecord = this.patchRecord.patch({ encrypted })
    }

    addPatch(patch: AutoEncoderPatchType<RecordSettings>) {
        this.patchRecord = this.patchRecord.patch(patch)
    }

    addChoicesPatch(patch: PatchableArrayAutoEncoder<RecordChoice>) {
        const p = RecordSettings.patch({
            choices: patch
        })
        this.addPatch(p)
    }

    addChoice() {
        const choice = RecordChoice.create({})

        this.present(new ComponentWithProperties(EditRecordChoiceView, {
            choice,
            isNew: true,
            parentRecord: this.patchedRecord,
            saveHandler: (patch: PatchableArrayAutoEncoder<RecordChoice>) => {
                this.addChoicesPatch(patch)
            }
        }).setDisplayStyle("sheet"))
    }

    async save() {
        const isValid = await this.validator.validate()
        if (!isValid) {
            return
        }

        const arrayPatch: PatchableArrayAutoEncoder<RecordSettings> = new PatchableArray()

        if (this.isNew) {
            arrayPatch.addPut(this.patchedRecord)
        } else {
            arrayPatch.addPatch(this.patchRecord)
        }

        this.saveHandler(arrayPatch)
        this.pop({ force: true })
    }

    async deleteMe() {
        if (!await CenteredMessage.confirm("Ben je zeker dat je dit kenmerk wilt verwijderen?", "Verwijderen", "Alle hieraan verbonden informatie gaat dan ook mogelijks verloren.")) {
            return
        }

        if (this.isNew) {
            // do nothing
            this.pop({ force: true })
            return
        }

        const arrayPatch: PatchableArrayAutoEncoder<RecordSettings> = new PatchableArray()
        arrayPatch.addDelete(this.record.id)

        this.saveHandler(arrayPatch)
        this.pop({ force: true })
    }

    cancel() {
        this.pop()
    }

    isChanged() {
        return patchContainsChanges(this.patchRecord, this.record, { version: Version })
    }

    async shouldNavigateAway() {
        if (!this.isChanged()) {
            return true
        }
        return await CenteredMessage.confirm("Ben je zeker dat je wilt sluiten zonder op te slaan?", "Niet opslaan")
    }

    openPreview() {
        this.present(new ComponentWithProperties(PreviewRecordView, {
            record: this.patchedRecord
        }).setDisplayStyle("popup"))
    }
}
</script>
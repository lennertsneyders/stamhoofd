import { column,Model } from '@simonbackx/simple-database';
import { Country, PaymentMethod, PaymentStatus, Settlement, TransferDescriptionType, TransferSettings } from '@stamhoofd/structures';
import { v4 as uuidv4 } from "uuid";
import { Organization } from './Organization';

export class Payment extends Model {
    static table = "payments"

    @column({
        primary: true, type: "string", beforeSave(value) {
            return value ?? uuidv4();
        }
    })
    id!: string;

    @column({ type: "string", nullable: true })
    method: PaymentMethod | null = null;

    @column({ type: "string" })
    status: PaymentStatus;

    @column({ type: "string", nullable: true })
    organizationId: string| null = null

    // Link a user for debugging
    @column({ type: "string", nullable: true })
    userId: string | null = null;

    /**
     * Total price
     */
    @column({ type: "integer" })
    price: number;

    /**
     * Included in the total price
     */
    @column({ type: "integer", nullable: true })
    freeContribution: number | null = null;

    @column({ type: "string", nullable: true })
    transferDescription: string | null = null;

    @column({
        type: "datetime", beforeSave(old?: any) {
            if (old !== undefined) {
                return old;
            }
            const date = new Date()
            date.setMilliseconds(0)
            return date
        }
    })
    createdAt: Date

    @column({
        type: "datetime", beforeSave() {
            const date = new Date()
            date.setMilliseconds(0)
            return date
        },
        skipUpdate: true
    })
    updatedAt: Date

    @column({ type: "datetime", nullable: true })
    paidAt: Date | null = null

    /// Settlement meta data
    @column({ type: "json", decoder: Settlement, nullable: true })
    settlement: Settlement | null = null;

    static generateDescription(organization: Organization, settings: TransferSettings, reference: string) {
        if (settings.type == TransferDescriptionType.Structured) {
            if (organization.address.country === Country.Belgium) {
                return this.generateOGM()
            }
            return this.generateOGMNL()
        }

        if (settings.type == TransferDescriptionType.Reference) {
            return (settings.prefix ? (settings.prefix + " ") : "" ) + reference
        }

        return settings.prefix
    }

    static generateOGMNL() {
        /**
         * Reference: https://www.betaalvereniging.nl/betalingsverkeer/giraal-betalingsverkeer/betalingskenmerken/
         * Check: https://rudhar.com/cgi-bin/chkdigit.cgi
         * Lengte: 16 cijfers
         * Eerste cijfer = controlegetal
         * Controlegetal wordt berekend door alle cijfers te vermenigvuldigen met een gewicht en vervolgens de modulus van 11 te nemen, 
         * het controlegetal is 11 min die modulus
         */

        const length = 15 // allowed values: 15, 12, 11, 10, 9, 8, 7
        const needsLengthIdentification = length < 15
        const L = needsLengthIdentification ? (length % 10) : ""
        // WARNING: lengths other than 15 are not yet supported because it is not clear whether L needs to be used in the calculation of C or not

        const weights = [2, 4, 8, 5, 10, 9, 7, 3, 6, 1] // repeat if needed (in reverse order!)

        // Warning: we'll reverse the order of the numbers afterwards!
        const numbers: number[] = []
        for (let index = 0; index < length; index++) {
            numbers.push(Math.floor(Math.random() * 10))
        }
        const sum = numbers.reduce((sum, num, index) => {
            const weight = weights[index % (weights.length)]
            return sum + num*weight
        }, 0)
        let C = 11 - (sum % 11)

        // Transform to 1 number following the specs
        if (C === 11) {
            C = 0
        }

        if (C === 10) {
            C = 1
        }

        return C+""+L+(numbers.reverse().map(n => n+"")).join("")
    }

    static generateOGM() {
        /**
         * De eerste tien cijfers zijn bijvoorbeeld een klantennummer of een factuurnummer. 
         * De laatste twee cijfers vormen het controlegetal dat verkregen wordt door van de 
         * voorgaande tien cijfers de rest bij Euclidische deling door 97 te berekenen (modulo 97). 
         * Voor en achter de cijfers worden drie plussen (+++) of sterretjes (***) gezet.
         * 
         * Uitzondering: Indien de rest 0 bedraagt, dan wordt als controlegetal 97 gebruikt.[1]
         */

        const firstChars = Math.round(Math.random() * 9999999999)
        let modulo = firstChars % 97
        if (modulo == 0) {
            modulo = 97
        }

        const str = (firstChars + "").padStart(10, "0") + (modulo + "").padStart(2, "0")

        return "+++"+str.substr(0, 3) + "/" + str.substr(3, 4) + "/"+str.substr(3 + 4)+"+++"
    }
}
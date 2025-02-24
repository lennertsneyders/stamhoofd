import { SimpleError } from "@simonbackx/simple-errors";
import { I18nController } from "@stamhoofd/frontend-i18n";
import { Address, Country, Parent, ParentType } from "@stamhoofd/structures";
import XLSX from "xlsx";

import { ColumnMatcher } from "../ColumnMatcher";
import { ImportingMember } from "../ImportingMember";
import { MatcherCategory } from "../MatcherCategory";
import { SharedMatcher } from "../SharedMatcher";

export class StreetNumberColumnMatcher extends SharedMatcher implements ColumnMatcher {
    getName(): string {
        return "Huisnummer"
    }

    get id() {
        return this.getName()+"-"+this.category
    }

    doesMatch(columnName: string, examples: string[]): boolean {
        const cleaned = columnName.trim().toLowerCase()

        for (const word of this.negativeMatch) {
            if (cleaned.includes(word)) {
                return false
            }
        }
        
        const possibleMatch = ["huisnummer", "street number", "huis"]

        for (const word of possibleMatch) {
            if (cleaned.includes(word)) {
                return !this.doExamplesHaveNumbers(examples)
            }
        }
        return false
    }

    doExamplesHaveNumbers(examples: string[]): boolean {
        if (examples.length == 0) {
            return false
        }
        for (const example of examples) {
            if (!example.match(/^\s*([^0-9]+?)[\s,]*([0-9].*?)\s*$/g)) {
                return false
            }
        }
        return true
    }

    apply(cell: XLSX.CellObject | undefined, member: ImportingMember) {
        if (!cell) {
            return
        }

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const number = ((cell.w ?? cell.v)+"")

        if (number.length == 0) {
            throw new SimpleError({
                code: "invalid_type",
                message: "Geen tekst in deze cel"
            })
        }

        if (this.category == MatcherCategory.Member) {
            if (!member.details.address) {
                member.details.address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.address.number = number
        } else if (this.category == MatcherCategory.Parent1) {
            if (member.details.parents.length == 0) {
                member.details.parents.push(Parent.create({
                    type: ParentType.Parent1
                }))
            }

            if (!member.details.parents[0].address) {
                member.details.parents[0].address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.parents[0].address.number = number
        } else if (this.category == MatcherCategory.Parent2) {
            while (member.details.parents.length < 2) {
                member.details.parents.push(Parent.create({
                    type: ParentType.Parent2
                }))
            }
            if (!member.details.parents[1].address) {
                member.details.parents[1].address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.parents[1].address.number = number
        }
    }
}
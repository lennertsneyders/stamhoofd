import { SimpleError } from "@simonbackx/simple-errors";
import { I18nController } from "@stamhoofd/frontend-i18n";
import { Address, Country, Parent, ParentType } from "@stamhoofd/structures";
import { DataValidator, Formatter } from "@stamhoofd/utility";
import XLSX from "xlsx";

import { ColumnMatcher } from "../ColumnMatcher";
import { ImportingMember } from "../ImportingMember";
import { MatcherCategory } from "../MatcherCategory";
import { SharedMatcher } from "../SharedMatcher";

export class CityColumnMatcher extends SharedMatcher implements ColumnMatcher {
    private reg = /^\s*(([0-9]+?)(\s?[A-Z]{2})?)[\s,]+(([A-Za-z]|\s)+)\s*$/
    private regReverse = /^\s*(([0-9]+?)(\s?[A-Z]{2})?)[\s,]+(([A-Za-z]|\s)+)\s*$/

    getName(): string {
        return "Gemeente"
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
        
        const possibleMatch = ["gemeente"]

        for (const word of possibleMatch) {
            if (cleaned.includes(word)) {
                // check if the full name was really used, and not only the first or last name
                return !this.doExamplesHaveZip(examples)
            }
        }
        return false
    }

    doExamplesHaveZip(examples: string[]): boolean {
        if (examples.length == 0) {
            return false
        }
        for (const example of examples) {
            if (!this.reg.exec(example) && !this.regReverse.exec(example)) {
                return false
            }
        }
        return true
    }

    apply(cell: XLSX.CellObject | undefined, member: ImportingMember) { 
        if (!cell) {
            return
        }
        
        // Check if string value
        if (cell.t != "s" || typeof cell.v !== "string" || !cell.v) {
            throw new SimpleError({
                code: "invalid_type",
                message: "Geen tekst in deze cel"
            })
        }

        const city = cell.v
        
        if (this.category == MatcherCategory.Member) {
            if (!member.details.address) {
                member.details.address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.address.city = city
        } else if (this.category == MatcherCategory.Parent1) {
            if (member.details.parents.length == 0) {
                member.details.parents.push(Parent.create({
                    type: ParentType.Parent1
                }))
            }

            if (!member.details.parents[0].address) {
                member.details.parents[0].address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.parents[0].address.city = city
        } else if (this.category == MatcherCategory.Parent2) {
            while (member.details.parents.length < 2) {
                member.details.parents.push(Parent.create({
                    type: ParentType.Parent2
                }))
            }
            if (!member.details.parents[1].address) {
                member.details.parents[1].address = Address.createDefault(I18nController.shared?.country ?? Country.Belgium)
            }
            member.details.parents[1].address.city = city
        }
    }
}
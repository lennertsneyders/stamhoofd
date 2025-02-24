import { ArrayDecoder, AutoEncoder, field, StringDecoder } from "@simonbackx/simple-encoding";
import { v4 as uuidv4 } from "uuid";

import { PropertyFilter, PropertyFilterDecoderFromContext } from "../../filters/PropertyFilter";
import { RecordSettings } from "./RecordSettings";

export class RecordCategory extends AutoEncoder {
    @field({ decoder: StringDecoder, defaultValue: () => uuidv4() })
    id: string

    @field({ decoder: StringDecoder })
    name = ""

    @field({ decoder: StringDecoder })
    description = ""

    /**
     * A category can either have childCategories or records, but never both. Records are ignored as soon as the category has at least one child category.
     * Currently we only support 2 categories deep
     */
    @field({ decoder: new ArrayDecoder(RecordCategory) })
    childCategories: RecordCategory[] = []

    @field({ decoder: new ArrayDecoder(RecordSettings) })
    records: RecordSettings[] = []

    getAllRecords(): RecordSettings[] {
        if (this.childCategories.length > 0) {
            return this.childCategories.flatMap(c => c.getAllRecords())
        }
        return this.records
    }

    getAllFilteredRecords(filterValue: any, dataPermission: boolean): RecordSettings[] {
        if (this.childCategories.length > 0) {
            return this.filterChildCategories(filterValue, dataPermission).flatMap(c => c.getAllFilteredRecords(filterValue, dataPermission))
        }
        return this.filterRecords(dataPermission)
    }

    @field({ decoder: new PropertyFilterDecoderFromContext(), version: 126, nullable: true })
    filter: PropertyFilter<any> | null = null

    filterRecords(dataPermission: boolean) {
        if (dataPermission) {
            return this.records
        }
        return this.records.filter(r => !r.sensitive)
    }

    static filterCategories(categories: RecordCategory[], filterValue: any, dataPermission: boolean): RecordCategory[] {
        return categories.filter(category => {
            if (category.filter && !category.filter.enabledWhen.doesMatch(filterValue)) {
                return false
            }

            if (category.childCategories.length > 0) {
                return category.filterChildCategories(filterValue, dataPermission).length > 0
            }

            if (category.filterRecords(dataPermission).length == 0) {
                return false
            }

            return true
        })
    }

    filterChildCategories(filterValue: any, dataPermission: boolean): RecordCategory[] {
        return RecordCategory.filterCategories(this.childCategories, filterValue, dataPermission)
    }
}
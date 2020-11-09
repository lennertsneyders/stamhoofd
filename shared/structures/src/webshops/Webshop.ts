import { ArrayDecoder, AutoEncoder, DateDecoder, field, StringDecoder } from '@simonbackx/simple-encoding';
import { v4 as uuidv4 } from "uuid";

import { Category } from './Category';
import { Product } from './Product';
import { WebshopMetaData, WebshopPrivateMetaData } from './WebshopMetaData';

export class WebshopPreview extends AutoEncoder {
    @field({ decoder: StringDecoder, defaultValue: () => uuidv4() })
    id: string;

    @field({ decoder: WebshopMetaData })
    meta = WebshopMetaData.create({})
}

export class Webshop extends AutoEncoder {
    @field({ decoder: StringDecoder, defaultValue: () => uuidv4() })
    id: string;

    /**
     * Not writeable
     */
    @field({ decoder: StringDecoder })
    uri = ""

    @field({ decoder: StringDecoder, nullable: true })
    domain: string | null = null;

    @field({ decoder: StringDecoder, nullable: true })
    domainUri: string | null = null;

    @field({ decoder: WebshopMetaData })
    meta = WebshopMetaData.create({})

    @field({ decoder: new ArrayDecoder(Product) })
    products: Product[] = []

    @field({ decoder: new ArrayDecoder(Category) })
    categories: Category[] = []

    getUrlSuffix(): string {
        if (this.domain) {
            if (!this.domainUri) {
                return ""
            }
            return "/"+this.domainUri
        }
        if (!this.uri) {
            return ""
        }
        return "/"+this.uri
    }

    removeSuffix(url: string[]) {
        const suff = this.getUrlSuffix()
        if (suff.length == 0) {
            return url
        }
        
        if (url[0] && url[0] == suff.substr(1)) {
            return url.slice(1)
        }
        return url
    }
}

export class PrivateWebshop extends Webshop {
    @field({ decoder: WebshopPrivateMetaData })
    privateMeta = WebshopPrivateMetaData.create({})
}


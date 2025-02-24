<template>
    <div class="st-view cart-item-view">
        <STNavigationBar :title="cartItem.product.name">
            <BackButton v-if="canPop" slot="left" @click="pop" />
            <span slot="left" class="style-tag">{{ cartItem.calculateUnitPrice(cart) | price }}</span>
            <button v-if="canDismiss" slot="right" class="button icon close gray" @click="dismiss" />
        </STNavigationBar>
        <main>
            <h1>{{ cartItem.product.name }}</h1>

            <figure v-if="imageSrc" class="image-box">
                <div :style="{ paddingBottom: Math.min(image.height/image.width*100, 100)+'%'}">
                    <img :src="imageSrc" :width="image.width" :height="image.height">
                </div>
            </figure>
            <p v-if="cartItem.product.description" class="description" v-text="cartItem.product.description" />

            <STList v-if="cartItem.product.type != 'Product' && cartItem.product.location" class="info">
                <STListItem>
                    <h3 class="style-definition-label">
                        Locatie
                    </h3>
                    <p class="style-definition-text">
                        {{ cartItem.product.location.name }}
                    </p>
                    <p class="style-description-small">
                        {{ cartItem.product.location.address }}
                    </p>
                </STListItem>

                <STListItem>
                    <h3 class="style-definition-label">
                        Wanneer?
                    </h3>
                    <p class="style-definition-text">
                        {{ formatDateRange(cartItem.product.dateRange) }}
                    </p>
                </STListItem>
            </STList>

            <hr v-if="cartItem.product.description || imageSrc || cartItem.product.type != 'Product'">

            <div v-if="cartItem.product.prices.length > 1" class="container">
                <STList>
                    <STListItem v-for="price in cartItem.product.prices" :key="price.id" class="no-border right-description" :selectable="true" element-name="label">
                        <Radio slot="left" v-model="cartItem.productPrice" :value="price" :name="cartItem.product.id+'price'" />
                        <h4 class="style-title-list">
                            {{ price.name || 'Naamloos' }}
                        </h4>

                        <p v-if="price.discountPrice" class="style-description-small">
                            {{ price.discountPrice | price }} / stuk vanaf {{ price.discountAmount }} {{ price.discountAmount == 1 ? 'stuk' : 'stuks' }}
                        </p>

                        <template slot="right">
                            {{ price.price | price }}
                        </template>
                    </STListItem>
                </STList>
                <hr>
            </div>

            <OptionMenuBox v-for="optionMenu in cartItem.product.optionMenus" :key="optionMenu.id" :cart-item="cartItem" :option-menu="optionMenu" />

            <STErrorsDefault :error-box="errorBox" />

            <FieldBox v-for="field in cartItem.product.customFields" :key="field.id" :field="field" :answers="cartItem.fieldAnswers" :error-box="errorBox" />

            <h2>Aantal</h2>

            <p v-if="remainingReduced > 0" class="info-box">
                Bestel je {{ cartItem.productPrice.discountAmount }} of meer stuks, dan betaal je maar {{ discountPrice | price }} per stuk!
            </p>

            <NumberInput v-model="cartItem.amount" suffix="stuks" suffix-singular="stuk" :max="maximumRemaining" :min="1" :stepper="true" />
            <p v-if="maximumRemaining !== null && cartItem.amount + 1 >= maximumRemaining" class="st-list-description">
                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline-->
                Er {{ remainingStock == 1 ? 'is' : 'zijn' }} nog maar {{ remainingStock }} {{ remainingStock == 1 ? 'stuk' : 'stuks' }} beschikbaar<template v-if="count > 0">, waarvan er al {{ count }} in jouw winkelmandje {{ count == 1 ? 'zit' : 'zitten' }}</template>
            </p>
        </main>

        <STToolbar :sticky="oldItem ? true : false">
            <button v-if="oldItem" slot="right" class="button primary" @click="addToCart">
                <span class="icon basket" />
                <span>Opslaan</span>
            </button>
            <button v-else slot="right" class="button primary" @click="addToCart">
                <span class="icon basket" />
                <span>Toevoegen</span>
            </button>
        </STToolbar>
    </div>
</template>


<script lang="ts">
import { NavigationMixin } from '@simonbackx/vue-app-navigation';
import { BackButton,ErrorBox, NumberInput,Radio,StepperInput,STErrorsDefault,STList, STListItem,STNavigationBar, STToolbar } from '@stamhoofd/components';
import { Cart,CartItem, ProductDateRange, Webshop } from '@stamhoofd/structures';
import { Formatter } from '@stamhoofd/utility';
import { Component, Prop } from 'vue-property-decorator';
import { Mixins } from 'vue-property-decorator';

import FieldBox from './FieldBox.vue';
import OptionMenuBox from './OptionMenuBox.vue';

@Component({
    components: {
        STNavigationBar,
        STToolbar,
        STList,
        STListItem,
        Radio,
        NumberInput,
        OptionMenuBox,
        StepperInput,
        FieldBox,
        STErrorsDefault,
        BackButton
    },
    filters: {
        price: Formatter.price.bind(Formatter),
        priceChange: Formatter.priceChange.bind(Formatter)
    }
})
export default class CartItemView extends Mixins(NavigationMixin){
    @Prop({ required: true })
    cartItem: CartItem

    @Prop({ required: true })
    webshop: Webshop

    @Prop({ required: true })
    cart: Cart

    @Prop({ required: true })
    saveHandler: (newItem: CartItem, oldItem: CartItem | null) => void

    @Prop({ default: null })
    oldItem: CartItem | null

    errorBox: ErrorBox | null = null

    addToCart() {
        try {
            this.saveHandler(this.cartItem, this.oldItem)
        } catch (e) {
            this.errorBox = new ErrorBox(e)
            return
        }

        /*if (this.oldItem) {
            CheckoutManager.cart.removeItem(this.oldItem)
            new Toast(this.cartItem.product.name+" is aangepast", "success green").setHide(1000).show()
        } else {
            new Toast(this.cartItem.product.name+" is toegevoegd aan je winkelmandje", "success green").setHide(2000).show()
        }
        CheckoutManager.cart.addItem(this.cartItem)
        CheckoutManager.saveCart()*/
        this.dismiss({ force: true })
    }

    get image() {
        return this.cartItem.product.images[0]?.getResolutionForSize(500, undefined)
    }

    get imageSrc() {
        return this.image?.file?.getPublicPath()
    }

    get product() {
        return this.cartItem.product
    }

    get remainingReduced() {
        if (this.cartItem.productPrice.discountPrice === null) {
            return 0
        }
        return this.cartItem.productPrice.discountAmount - this.count
    }

    get discountPrice() {
        return this.cartItem.productPrice.discountPrice ?? 0
    }

    /**
     * Return the total amount of this same product in the cart, that is not this item (if it is editing)
     */
    get count() {
        return this.cart.items.reduce((prev, item) => {
            if (item.product.id != this.product.id) {
                return prev
            }
            return prev + item.amount
        }, 0)  - (this.oldItem?.amount ?? 0)
    }

    /**
     * Return the total reserved amount for the same product in this cart, without the current item included (if editing)
     */
    get reservedAmountFromOthers() {
        return this.cart.items.reduce((prev, item) => {
            if (item.product.id != this.product.id) {
                return prev
            }
            return prev + item.reservedAmount
        }, 0)  - (this.oldItem?.reservedAmount ?? 0)
    }

    get maximumRemaining() {
        if (this.product.remainingStock === null) {
            return null
        }

        return this.product.remainingStock  + (this.oldItem?.reservedAmount ?? 0) - this.count + this.reservedAmountFromOthers
    }

    get remainingStock() {
        return (this.product.remainingStock ?? 0) + (this.oldItem?.reservedAmount ?? 0) + this.reservedAmountFromOthers
    }

    formatDateRange(dateRange: ProductDateRange) {
        return Formatter.capitalizeFirstLetter(dateRange.toString())
    }

}
</script>

<style lang="scss">
@use "@stamhoofd/scss/base/variables.scss" as *;
@use "@stamhoofd/scss/base/text-styles.scss" as *;

.cart-item-view {
    --st-horizontal-padding: 25px;

    .image-box {
        position: relative;
        max-height: 350px;
        overflow: hidden;

        > div {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }

        img {
            position: absolute;
            height: 100%;
            border-radius: $border-radius;
            width: 100%;
            object-fit: cover;
        }
    }
    .image {
        width: 100%;
        border-radius: $border-radius;
    }

    .description {
        @extend .style-description;
        padding-top: 15px;
        white-space: pre-wrap;
    }

    .info {
        padding-top: 15px;
    }

    h1 + .description {
        // Remove duplicate padding
        padding-top: 0;
    }

    h1 + .info {
        padding-top: 0;
    }
}

</style>
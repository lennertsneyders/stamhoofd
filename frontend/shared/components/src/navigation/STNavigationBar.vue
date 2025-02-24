<template>
    <div class="st-navigation-bar" :class="{ scrolled, sticky, large, fixed, 'show-title': showTitle, 'no-title': title.length == 0 }">
        <div>
            <slot name="left" />
        </div>

        <slot name="middle">
            <h1>
                {{ title }}
            </h1>
        </slot>

        <div>
            <slot name="right" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop,Vue } from "vue-property-decorator";

@Component
export default class STNavigationBar extends Vue {
    @Prop({ default: "", type: String })
    title!: string;

    @Prop({ default: true, type: Boolean })
    sticky!: boolean;

    /**
     * Also show the title when not scrolled
     */
    @Prop({ default: false, type: Boolean })
    showTitle!: boolean;

    @Prop({ default: false, type: Boolean })
    fixed!: boolean;

    @Prop({ default: false, type: Boolean })
    large!: boolean;

    scrolled = false;
    scrollElement!: HTMLElement | null;

    getScrollElement(element: HTMLElement | null = null): HTMLElement {
        if (!element) {
            element = this.$el as HTMLElement;
        }

        const style = window.getComputedStyle(element);
        if (
            style.overflowY == "scroll" ||
            style.overflow == "scroll" ||
            style.overflow == "auto" ||
            style.overflowY == "auto"
        ) {
            return element;
        } else {
            if (!element.parentElement) {
                return document.documentElement;
            }
            return this.getScrollElement(element.parentElement);
        }
    }

    addListener() {
        if (this.scrollElement) {
            return;
        }
        this.scrollElement = this.getScrollElement();
        if (this.scrollElement === document.documentElement) {
            window.addEventListener("scroll", this.onScroll, { passive: true });
        } else {
            this.scrollElement.addEventListener("scroll", this.onScroll, { passive: true });
        }
    }

    mounted() {
        if (this.sticky) {
            this.addListener();
        }
    }

    activated() {
        // fix for element not yet in dom
        window.setTimeout(() => {
            if (this.sticky) {
                this.addListener();
            }
        }, 500);
    }

    deactivated() {
        if (!this.scrollElement) {
            return;
        }
        if (this.scrollElement === document.documentElement) {
            window.removeEventListener("scroll", this.onScroll);
        } else {
            this.scrollElement.removeEventListener("scroll", this.onScroll);
        }
        this.scrollElement = null;
    }

    onScroll() {
        const scroll = this.scrollElement!.scrollTop;
        if (scroll > 20) {
            this.scrolled = true;
        } else if (scroll < 15) {
            this.scrolled = false;
        }
    }
}
</script>

<style lang="scss">
@use "~@stamhoofd/scss/base/variables.scss" as *;
@use '~@stamhoofd/scss/layout/split-inputs.scss';
@use '~@stamhoofd/scss/base/text-styles.scss';

.st-navigation-bar {
    // Todo: replace padding with variable padding
    margin: 0 calc(-1 * var(--st-horizontal-padding, 40px));
    margin-top: calc(-1 * var(--st-vertical-padding, 20px) + var(--navigation-bar-margin, 20px) - var(--st-safe-area-top, 0px));
    padding: var(--st-safe-area-top, 0px) var(--navigation-bar-horizontal-padding, var(--st-horizontal-padding, 40px)) 0 var(--navigation-bar-horizontal-padding, var(--st-horizontal-padding, 40px));
    height: 60px;

    &.large {
        height: 80px;
        margin-top: calc(-1 * var(--st-vertical-padding, 20px) - var(--st-safe-area-top, 0px));
        margin-bottom: 0px;
        padding: var(--st-safe-area-top, 0px) 20px 0 20px;

        @media (max-width: 450px) {
            padding: var(--st-safe-area-top, 0px) 15px 0 15px;
        }
    }
    -webkit-app-region: drag;

    &.sticky {
        position: sticky;
        top: 0;
    }

    &.fixed {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        margin: 0;
    }

    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    background: var(--color-white, white);
    background: var(--color-current-background, white);
    z-index: 11;

    &.no-title {
        grid-template-columns: auto 1fr;

        & > div:first-child:empty + div {
            margin-left: -20px;
        }

        > h1 {
            display: none;
        }
    }

    > div {
        display: flex;
        flex-direction: row;
        align-items: center;

        &:first-child {
            /*min-width: 30px;

            &:empty {
                min-width: 0;
            }*/
            
            > * {
                margin: 0 10px;

                &:first-child {
                    margin-left: 0;
                }

                &:last-child {
                    margin-right: 0;
                }
            }
        }

        &:last-child {
            justify-content: flex-end;

            > * {
                margin: 0 10px;

                &:last-child {
                    margin-right: 0;
                }

                &:first-child {
                    margin-left: 0;
                }
            }
        }
    }

    &.wrap {
        height: auto;

        > div {
            &:last-child {
                flex-wrap: wrap;
                margin: -5px -10px;

                > * {
                    margin: 5px 10px;
                }
            }
        }
    }

    > h1 {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
        @extend .style-title-small;
    }

    &.show-title {
        > h1 {
            opacity: 0.6;
        }
    }


    &.scrolled {
        box-shadow: 0px 2px 3px $color-shadow;
        > h1 {
            opacity: 1;
        }
    }
    
    // Other helper styles (need to revalidate)
    .input {
        width: 220px;
        display: inline-block;
        flex-shrink: 10000000;

        @media (max-width: 500px) {
            width: 100%;
            min-width: 150px;
        }
    }

    select.input {
        width: auto;
    }
}
</style>

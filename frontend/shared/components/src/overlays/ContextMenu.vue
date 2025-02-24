<template>
    <transition appear name="show">
        <div class="context-menu-container" @click="pop">
            <div
                ref="context"
                oncontextmenu="return false;"
                class="context-menu"
                :style="{ top: top + 'px', left: left + 'px', width: preferredWidth ? (preferredWidth + 'px') : undefined }"
                @click.stop=""
            >
                <slot />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
})
export default class ContextMenu extends Vue {
    @Prop({
        default: 0,
    })
    x!: number;

    @Prop({
        default: null,
    })
    preferredWidth!: number | null;

    @Prop({
        default: 0,
    })
    y!: number;

    top = 0;
    left = 0;

    mounted() {
        // Calculate position
        const width = (this.$refs.context as HTMLElement).offsetWidth;
        const height = (this.$refs.context as HTMLElement).offsetHeight;

        const viewPadding = 15;

        const win = window,
            doc = document,
            docElem = doc.documentElement,
            body = doc.getElementsByTagName("body")[0],
            clientWidth = win.innerWidth || docElem.clientWidth || body.clientWidth,
            clientHeight = win.innerHeight || docElem.clientHeight || body.clientHeight;

        this.left = this.x - Math.max(0, width - (clientWidth - viewPadding - this.x));
        this.top = this.y - Math.max(0, height - (clientHeight - viewPadding - this.y));
        if (this.left < viewPadding) {
            this.left = viewPadding
        }

        this.$el.addEventListener("contextmenu", this.pop, { passive: true });
    }

    beforeDestroy() {
        this.$el.removeEventListener("contextmenu", this.pop);
    }

    pop() {
        this.$parent.$parent.$emit("pop");
    }

    activated() {
        document.addEventListener("keydown", this.onKey);
    }

    deactivated() {
        document.removeEventListener("keydown", this.onKey);
    }

    onKey(event) {
        if (event.defaultPrevented || event.repeat) {
            return;
        }

        const key = event.key || event.keyCode;

        if (key === "Escape" || key === "Esc" || key === 27) {
            this.pop();
            event.preventDefault();
        }
    }
}
</script>

<style lang="scss">
@use "~@stamhoofd/scss/base/variables.scss" as *;
@use '~@stamhoofd/scss/base/text-styles.scss';

.context-menu-container {
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    &.show-enter-active,
    &.show-leave-active {
        transition: opacity 0.2s;
    }
    &.show-leave-to /* .fade-leave-active below version 2.1.8 */ {
        // Instant appearing context menu! (only leave animation)
        opacity: 0;
    }
}

.context-menu {
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    background: $color-background-shade;
    border: 1px solid $color-border-shade;
    padding: 4px 0;
    border-radius: $border-radius;
    @extend .style-overlay-shadow;
    border-radius: $border-radius;
    box-sizing: border-box;
    min-width: 250px;
    max-width: 100vw;
    max-width: calc(100vw - 30px);
    overflow: hidden;

    .context-menu-item {
        @extend .style-context-menu-item;
        cursor: pointer;
        user-select: none;
        touch-action: manipulation;
        display: flex;
        flex-direction: row;
        align-items: center;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        > .middle {
            padding: 10px 20px;
        }

        > .right {
            &:empty {
                display: none;
            }
            margin-left: auto;
            flex-shrink: 0;
            padding-right: 20px;
        }

        &:hover {
            background: $color-primary;
            color: $color-white;
            > * {
                --color-primary: #{$color-white};
            }
        }

        &.clicked {
            background: transparent;
        }
    }

    .context-menu-line {
        background: $color-border;
        border: 0;
        outline: 0;
        border-radius: $border-width/2;
        height: $border-width;
        margin: 4px 0;
    }
}
</style>

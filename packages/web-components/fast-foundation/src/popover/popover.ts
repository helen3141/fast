import { attr, DOM, FASTElement, observable } from "@microsoft/fast-element";
import { Direction, keyCodeEscape } from "@microsoft/fast-web-utilities";
import { AnchoredRegion, AxisPositioningMode, AxisScalingMode } from "../anchored-region";
import { ARIAGlobalStatesAndProperties } from "../patterns";
import { applyMixins, getDirection } from "../utilities";
import { PopoverPosition } from "./popover.options";

export { PopoverPosition };

/**
 * An Popover Custom HTML Element.
 *
 * @public
 */
export class Popover extends FASTElement {
    private static DirectionAttributeName: string = "dir";

    /**
     * Whether the popover is visible or not.
     * If undefined popover is shown when anchor element is hovered
     *
     * @defaultValue - undefined
     * @public
     * HTML Attribute: visible
     */
    @attr({ mode: "boolean" })
    public visible: boolean;
    private visibleChanged(): void {
        if ((this as FASTElement).$fastController.isConnected) {
            this.updatePopoverVisibility();
            this.updateLayout();
        }
    }

    /**
     * The id of the element the popover is anchored to
     *
     * @defaultValue - undefined
     * @public
     * HTML Attribute: anchor
     */
    @attr
    public anchor: string = "";
    private anchorChanged(): void {
        if ((this as FASTElement).$fastController.isConnected) {
            this.updateLayout();
        }
    }

    /**
     * The delay in milliseconds before a popover is shown after a hover event
     *
     * @defaultValue - 300
     * @public
     * HTML Attribute: delay
     */
    @attr
    public delay: number = 300;

    /**
     * Controls the placement of the popover relative to the anchor.
     * When the position is undefined the popover is placed above or below the anchor based on available space.
     *
     * @defaultValue - undefined
     * @public
     * HTML Attribute: position
     */
    @attr
    public position: PopoverPosition;
    private positionChanged(): void {
        if ((this as FASTElement).$fastController.isConnected) {
            this.updateLayout();
        }
    }

    /**
     * the html element currently being used as anchor.
     * Setting this directly overrides the anchor attribute.
     *
     * @public
     */
    @observable
    public anchorElement: HTMLElement | null = null;
    private anchorElementChanged(oldValue: HTMLElement | null): void {
        if ((this as FASTElement).$fastController.isConnected) {
            if (oldValue !== null && oldValue !== undefined) {
                oldValue.removeEventListener("mouseover", this.handleAnchorMouseOver);
                oldValue.removeEventListener("mouseout", this.handleAnchorMouseOut);
            }

            if (this.anchorElement !== null && this.anchorElement !== undefined) {
                this.anchorElement.addEventListener(
                    "mouseover",
                    this.handleAnchorMouseOver,
                    { passive: true }
                );
                this.anchorElement.addEventListener(
                    "mouseout",
                    this.handleAnchorMouseOut,
                    { passive: true }
                );

                const anchorId: string = this.anchorElement.id;

                if (this.anchorElement.parentElement !== null) {
                    this.anchorElement.parentElement
                        .querySelectorAll(":hover")
                        .forEach(element => {
                            if (element.id === anchorId) {
                                this.startHoverTimer();
                            }
                        });
                }
            }

            if (
                this.region !== null &&
                this.region !== undefined &&
                this.popoverVisible
            ) {
                this.region.anchorElement = this.anchorElement;
            }

            this.updateLayout();
        }
    }

    /**
     * The current viewport element instance
     *
     * @internal
     */
    @observable
    public viewportElement: HTMLElement | null = null;
    private viewportElementChanged(): void {
        if (this.region !== null && this.region !== undefined) {
            this.region.viewportElement = this.viewportElement;
        }
        this.updateLayout();
    }

    /**
     * @internal
     */
    @observable
    public verticalPositioningMode: AxisPositioningMode = "dynamic";

    /**
     * @internal
     */
    @observable
    public horizontalPositioningMode: AxisPositioningMode = "dynamic";

    /**
     * @internal
     */
    @observable
    public horizontalInset: string = "true";

    /**
     * @internal
     */
    @observable
    public verticalInset: string = "false";

    /**
     * @internal
     */
    @observable
    public horizontalScaling: AxisScalingMode = "anchor";

    /**
     * @internal
     */
    @observable
    public verticalScaling: AxisScalingMode = "content";

    /**
     * @internal
     */
    @observable
    public verticalDefaultPosition: string | undefined = undefined;

    /**
     * @internal
     */
    @observable
    public horizontalDefaultPosition: string | undefined = undefined;

    /**
     * @internal
     */
    @observable
    public popoverVisible: boolean = false;

    /**
     * Track current direction to pass to the anchored region
     * updated when popover is shown
     *
     * @internal
     */
    @observable
    public currentDirection: Direction = Direction.ltr;

    /**
     * reference to the anchored region
     *
     * @internal
     */
    public region: AnchoredRegion;

    /**
     * The timer that tracks delay time before the popover is shown on hover
     */
    private delayTimer: number | null = null;

    /**
     * Indicates whether the anchor is currently being hovered
     */
    private isAnchorHovered: boolean = false;

    public connectedCallback(): void {
        super.connectedCallback();
        this.anchorElement = this.getAnchor();

        this.updateLayout();
        this.updatePopoverVisibility();
    }

    public disconnectedCallback(): void {
        this.hidePopover();
        this.clearDelayTimer();
        super.disconnectedCallback();
    }

    /**
     * invoked when the anchored region's position relative to the anchor changes
     *
     * @internal
     */
    public handlePositionChange = (ev: Event): void => {
        this.classList.toggle("top", this.region.verticalPosition === "top");
        this.classList.toggle("bottom", this.region.verticalPosition === "bottom");
        this.classList.toggle("inset-top", this.region.verticalPosition === "insetTop");
        this.classList.toggle(
            "inset-bottom",
            this.region.verticalPosition === "insetBottom"
        );

        this.classList.toggle("left", this.region.horizontalPosition === "left");
        this.classList.toggle("right", this.region.horizontalPosition === "right");
        this.classList.toggle(
            "inset-left",
            this.region.horizontalPosition === "insetLeft"
        );
        this.classList.toggle(
            "inset-right",
            this.region.horizontalPosition === "insetRight"
        );
    };

    /**
     * mouse enters anchor
     */
    private handleAnchorMouseOver = (ev: Event): void => {
        this.startHoverTimer();
    };

    /**
     * mouse leaves anchor
     */
    private handleAnchorMouseOut = (ev: Event): void => {
        if (this.isAnchorHovered) {
            this.isAnchorHovered = false;
            this.updatePopoverVisibility();
        }
        this.clearDelayTimer();
    };

    /**
     * starts the hover timer if not currently running
     */
    private startHoverTimer = (): void => {
        if (this.isAnchorHovered) {
            return;
        }

        if (this.delay > 1) {
            if (this.delayTimer === null)
                this.delayTimer = window.setTimeout((): void => {
                    this.startHover();
                }, this.delay);
            return;
        }

        this.startHover();
    };

    /**
     * starts the hover delay timer
     */
    private startHover = (): void => {
        this.isAnchorHovered = true;
        this.updatePopoverVisibility();
    };

    /**
     * clears the hover delay
     */
    private clearDelayTimer = (): void => {
        if (this.delayTimer !== null) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    };

    /**
     * updated the properties being passed to the anchored region
     */
    private updateLayout(): void {
        switch (this.position) {
            case PopoverPosition.top:
            case PopoverPosition.bottom:
                this.verticalPositioningMode = "locktodefault";
                this.horizontalPositioningMode = "dynamic";
                this.verticalDefaultPosition = this.position;
                this.horizontalDefaultPosition = undefined;
                this.horizontalInset = "true";
                this.verticalInset = "false";
                this.horizontalScaling = "anchor";
                this.verticalScaling = "content";
                break;

            case PopoverPosition.right:
            case PopoverPosition.left:
                this.verticalPositioningMode = "dynamic";
                this.horizontalPositioningMode = "locktodefault";
                this.verticalDefaultPosition = undefined;
                this.horizontalDefaultPosition = this.position;
                this.horizontalInset = "false";
                this.verticalInset = "true";
                this.horizontalScaling = "content";
                this.verticalScaling = "anchor";
                break;

            default:
                this.verticalPositioningMode = "dynamic";
                this.horizontalPositioningMode = "dynamic";
                this.verticalDefaultPosition = undefined;
                this.horizontalDefaultPosition = undefined;
                this.horizontalInset = "true";
                this.verticalInset = "false";
                this.horizontalScaling = "anchor";
                this.verticalScaling = "content";
                break;
        }
    }

    /**
     *  Gets the anchor element by id
     */
    private getAnchor = (): HTMLElement | null => {
        return document.getElementById(this.anchor);
    };

    /**
     * handles key down events to check for dismiss
     */
    private handleDocumentKeydown = (e: KeyboardEvent): void => {
        if (!e.defaultPrevented && this.popoverVisible) {
            switch (e.keyCode) {
                case keyCodeEscape:
                    this.isAnchorHovered = false;
                    this.updatePopoverVisibility();
                    this.$emit("dismiss");
                    break;
            }
        }
    };

    /**
     * determines whether to show or hide the popover based on current state
     */
    private updatePopoverVisibility = (): void => {
        if (this.visible === false) {
            this.hidePopover();
        } else if (this.visible === true) {
            this.showPopover();
        } else {
            if (this.isAnchorHovered) {
                this.showPopover();
                return;
            }
            this.hidePopover();
        }
    };

    /**
     * shows the popover
     */
    private showPopover = (): void => {
        if (this.popoverVisible) {
            return;
        }
        this.currentDirection = getDirection(this);
        this.popoverVisible = true;
        document.addEventListener("keydown", this.handleDocumentKeydown);
        DOM.queueUpdate(this.setRegionProps);
    };

    /**
     * hides the popover
     */
    private hidePopover = (): void => {
        if (!this.popoverVisible) {
            return;
        }
        if (this.region !== null && this.region !== undefined) {
            (this.region as any).removeEventListener("change", this.handlePositionChange);
            this.region.viewportElement = null;
            this.region.anchorElement = null;
        }
        document.removeEventListener("keydown", this.handleDocumentKeydown);
        this.popoverVisible = false;
    };

    /**
     * updates the popover anchored region props after it has been
     * added to the DOM
     */
    private setRegionProps = (): void => {
        if (!this.popoverVisible) {
            return;
        }
        this.viewportElement = document.body;
        this.region.viewportElement = this.viewportElement;
        this.region.anchorElement = this.anchorElement;
        (this.region as any).addEventListener("change", this.handlePositionChange);
    };
}

/**
 * Mark internal because exporting class and interface of the same name
 * confuses API documenter.
 * TODO: https://github.com/microsoft/fast/issues/3317
 * @internal
 */
/* eslint-disable-next-line */
export interface Popover extends ARIAGlobalStatesAndProperties {}
applyMixins(Popover, ARIAGlobalStatesAndProperties);

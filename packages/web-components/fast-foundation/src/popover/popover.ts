import { attr, DOM, FASTElement, observable } from "@microsoft/fast-element";
import { Direction, keyCodeEscape } from "@microsoft/fast-web-utilities";
import { AnchoredRegion, AxisPositioningMode, AxisScalingMode } from "../anchored-region";
import { ARIAGlobalStatesAndProperties } from "../patterns";
import { applyMixins, getDirection } from "../utilities";
import { PopoverPosition } from "./popover.options";

// TODO: ADD focus trap
// TODO: FIX styling
// TODO: UPDATE position logic switch
// DONE: ASK do we want to be prescriptive and have a header, footer, and close button already? Maybe an option for a close button? Or should this be more like Dialog where we don't control anything inside the popover. Answer = No.

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
     *
     * @defaultValue - false
     * @public
     * HTML Attribute: visible
     */
    @attr({ mode: "boolean" })
    public visible: boolean;
    private visibleChanged(): void {
        console.log("HIT VISIBLE CHANGED: ", this.visible);
        if ((this as FASTElement).$fastController.isConnected) {
            this.updatePopoverVisibility();
            this.updateLayout();
        }
    }

    /**
     * The id of the element the popover uses as a target to be triggered from
     *
     * @defaultValue - undefined
     * @public
     * HTML Attribute: target
     */
    @attr
    public target: string = "";
    private targetChanged(): void {
        if ((this as FASTElement).$fastController.isConnected) {
            this.updateLayout();
        }
    }

    /**
     * The delay in milliseconds before a popover is shown after a trigger event
     *
     * @defaultValue - 300
     * @public
     * HTML Attribute: delay
     */
    @attr
    public delay: number = 300;

    /**
     * Controls the placement of the popover relative to the target.
     * When the position is undefined the popover is placed above or below the target based on available space.
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
     * the html element currently being used as target.
     * Setting this directly overrides the target attribute.
     *
     * @public
     */
    @observable
    public targetElement: HTMLElement | null = null;
    private targetElementChanged(oldValue: HTMLElement | null): void {
        if ((this as FASTElement).$fastController.isConnected) {
            // if (oldValue !== null && oldValue !== undefined) {
            //     // oldValue.removeEventListener("click", this.handleTargetClick);
            // }

            // if (this.targetElement !== null && this.targetElement !== undefined) {
            //     this.targetElement.addEventListener("click", this.handleTargetClick, {
            //         passive: true,
            //     });
            // }

            if (
                this.region !== null &&
                this.region !== undefined &&
                this.popoverVisible
            ) {
                this.region.anchorElement = this.targetElement;
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

    public connectedCallback(): void {
        super.connectedCallback();
        if (!this.visible) {
            this.visible = false;
        }

        this.targetElement = this.getTarget();

        this.updateLayout();
        this.updatePopoverVisibility();
    }

    public disconnectedCallback(): void {
        this.hidePopover();
        super.disconnectedCallback();
    }

    /**
     * invoked when the anchored region's position relative to the anchor changes
     *
     * @internal
     */
    public handlePositionChange = (e: Event): void => {
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
     * click on the target
     */
    // private handleTargetClick = (e: Event): void => {
    //     console.log("hit target click: ", this.visible, this.popoverVisible)
    //     if(this.visible && !this.popoverVisible){
    //         this.popoverVisible = false;
    //     }
    //     if (this.popoverVisible) {
    //         this.hidePopover();
    //     } else {
    //         this.showPopover();
    //     }
    // };

    /**
     * handle click on the body for soft-dismiss
     */
    private handleDocumentClick = (e: Event): void => {
        console.log("doc click: ", e.target, e.currentTarget);
        console.log(this.visible, this.popoverVisible);
        if (
            this.popoverVisible &&
            e.target !== this &&
            !this.contains(e.target as Node) &&
            e.target !== this.targetElement
        ) {
            console.log("doc click passed: ", e.target, e.currentTarget);
            // this.hidePopover();
            this.visible = false;
            this.popoverVisible = false;
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
    private getTarget = (): HTMLElement | null => {
        return document.getElementById(this.target);
    };

    /**
     * handles key down events to check for dismiss
     */
    private handleDocumentKeydown = (e: KeyboardEvent): void => {
        if (!e.defaultPrevented && this.popoverVisible) {
            switch (e.keyCode) {
                case keyCodeEscape:
                    this.popoverVisible = false;
                    this.visible = false;
                    // this.updatePopoverVisibility();
                    this.$emit("dismiss");
                    break;
            }
        }
    };

    /**
     * determines whether to show or hide the popover based on current state
     */
    private updatePopoverVisibility = (): void => {
        console.log("HIT Update POPOVER VIS: ", this.visible);
        if (this.visible === false) {
            this.hidePopover();
        } else if (this.visible === true) {
            this.showPopover();
        } else {
            if (this.popoverVisible) {
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
        console.log("HIT SHOW: ", this.visible, this.popoverVisible);
        if (this.popoverVisible) {
            return;
        }
        this.currentDirection = getDirection(this);
        document.addEventListener("keydown", this.handleDocumentKeydown);
        document.addEventListener("click", this.handleDocumentClick);
        this.popoverVisible = true;
        DOM.queueUpdate(this.setRegionProps);
    };

    /**
     * hides the popover
     */
    private hidePopover = (): void => {
        console.log("HIT HIDE: ", this.visible, this.popoverVisible);
        if (!this.popoverVisible) {
            return;
        }
        if (this.region !== null && this.region !== undefined) {
            (this.region as any).removeEventListener("change", this.handlePositionChange);
            this.region.viewportElement = null;
            this.region.anchorElement = null;
        }
        document.removeEventListener("keydown", this.handleDocumentKeydown);
        document.removeEventListener("click", this.handleDocumentClick);
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
        this.region.anchorElement = this.targetElement;
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

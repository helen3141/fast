import { html, ref, when } from "@microsoft/fast-element";
import { Popover } from "./popover";

/**
 * The template for the {@link @microsoft/fast-foundation#(Popover:class)} component.
 * @public
 */
export const PopoverTemplate = html<Popover>`
    ${when(
        x => x.popoverVisible,
        html<Popover>`
            <fast-anchored-region
                vertical-positioning-mode="${x => x.verticalPositioningMode}"
                vertical-default-position="${x => x.verticalDefaultPosition}"
                vertical-inset="${x => x.verticalInset}"
                vertical-scaling="${x => x.verticalScaling}"
                horizontal-positioning-mode="${x => x.horizontalPositioningMode}"
                horizontal-default-position="${x => x.horizontalDefaultPosition}"
                horizontal-scaling="${x => x.horizontalScaling}"
                horizontal-inset="${x => x.horizontalInset}"
                dir="${x => x.currentDirection}"
                ${ref("region")}
            >
                <div
                    class="popover"
                    part="popover"
                    role="dialog"
                    ${ref("popover")}
                    tabindex="0"
                >
                    <slot></slot>
                </div>
            </fast-anchored-region>
        `
    )}
`;

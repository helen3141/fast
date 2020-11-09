import { expect } from "chai";
import { customElement, DOM, html } from "@microsoft/fast-element";
import { fixture } from "../fixture";
import { Popover, PopoverTemplate as template } from "./index";
import { PopoverPosition } from "./popover";
import { delay } from "lodash-es";

@customElement({
    name: "fast-popover",
    template,
})
class FASTPopover extends Popover {}

async function setup() {
    const { element, connect, disconnect } = await fixture(html<HTMLDivElement>`
        <div>
            <button id="anchor">anchor</button>
            <fast-popover anchor="anchor" id="popover">
                helpful text
            </fast-popover>
        </div>
    `);
    return { element, connect, disconnect };
}

describe("Popover", () => {
    it("should not render the toolip by default", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;
        popover.delay = 0;

        await connect();
        await DOM.nextUpdate();

        expect(popover.popoverVisible).to.equal(false);
        expect(popover.shadowRoot?.querySelector("fast-anchored-region")).to.equal(null);

        await disconnect();
    });

    it("should render the toolip when visible is true", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.visible = true;
        popover.delay = 0;

        await connect();
        await DOM.nextUpdate();

        expect(popover.popoverVisible).to.equal(true);
        expect(popover.shadowRoot?.querySelector("fast-anchored-region")).not.to.equal(
            null
        );

        await disconnect();
    });

    it("should not render the toolip when visible is false", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.visible = false;
        popover.delay = 0;

        await connect();
        await DOM.nextUpdate();

        expect(popover.popoverVisible).to.equal(false);
        expect(popover.shadowRoot?.querySelector("fast-anchored-region")).to.equal(null);

        await disconnect();
    });

    it("should set positioning mode to dynamic by default", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        await connect();

        expect(popover.verticalPositioningMode).to.equal("dynamic");
        expect(popover.horizontalPositioningMode).to.equal("dynamic");

        await disconnect();
    });

    it("should not set a default position by default", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        await connect();

        expect(popover.verticalDefaultPosition).to.equal(undefined);
        expect(popover.horizontalDefaultPosition).to.equal(undefined);

        await disconnect();
    });

    it("should set horizontal scaling to match anchor and vertical scaling to match content by default", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        await connect();

        expect(popover.verticalScaling).to.equal("content");
        expect(popover.horizontalScaling).to.equal("anchor");

        await disconnect();
    });

    // top position settings

    it("should set vertical positioning mode to locked and horizontal to dynamic when position is set to top", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.top;

        await connect();

        expect(popover.verticalPositioningMode).to.equal("locktodefault");
        expect(popover.horizontalPositioningMode).to.equal("dynamic");

        await disconnect();
    });

    it("should set default vertical position to top when position is set to top", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.top;

        await connect();

        expect(popover.verticalDefaultPosition).to.equal("top");
        expect(popover.horizontalDefaultPosition).to.equal(undefined);

        await disconnect();
    });

    it("should set horizontal scaling to match anchor and vertical scaling to match content when position is set to top", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.top;

        await connect();

        expect(popover.verticalScaling).to.equal("content");
        expect(popover.horizontalScaling).to.equal("anchor");

        await disconnect();
    });

    // bottom position settings

    it("should set vertical positioning mode to locked and horizontal to dynamic when position is set to bottom", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.bottom;

        await connect();

        expect(popover.verticalPositioningMode).to.equal("locktodefault");
        expect(popover.horizontalPositioningMode).to.equal("dynamic");

        await disconnect();
    });

    it("should set default vertical position to top when position is set to top", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.bottom;

        await connect();

        expect(popover.verticalDefaultPosition).to.equal("bottom");
        expect(popover.horizontalDefaultPosition).to.equal(undefined);

        await disconnect();
    });

    it("should set horizontal scaling to match anchor and vertical scaling to match content when position is set to bottom", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.bottom;

        await connect();

        expect(popover.verticalScaling).to.equal("content");
        expect(popover.horizontalScaling).to.equal("anchor");

        await disconnect();
    });

    // left position settings

    it("should set horizontal positioning mode to locked and vertical to dynamic when position is set to left", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.left;

        await connect();

        expect(popover.verticalPositioningMode).to.equal("dynamic");
        expect(popover.horizontalPositioningMode).to.equal("locktodefault");

        await disconnect();
    });

    it("should set default horizontal position to left when position is set to left", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.left;

        await connect();

        expect(popover.verticalDefaultPosition).to.equal(undefined);
        expect(popover.horizontalDefaultPosition).to.equal("left");

        await disconnect();
    });

    it("should set vertical scaling to match anchor and horizontal scaling to match content when position is set to bottom", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.left;

        await connect();

        expect(popover.verticalScaling).to.equal("anchor");
        expect(popover.horizontalScaling).to.equal("content");

        await disconnect();
    });

    // right position settings

    it("should set horizontal positioning mode to locked and vertical to dynamic when position is set to right", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.right;

        await connect();

        expect(popover.verticalPositioningMode).to.equal("dynamic");
        expect(popover.horizontalPositioningMode).to.equal("locktodefault");

        await disconnect();
    });

    it("should set default horizontal position to right when position is set to right", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.right;

        await connect();

        expect(popover.verticalDefaultPosition).to.equal(undefined);
        expect(popover.horizontalDefaultPosition).to.equal("right");

        await disconnect();
    });

    it("should set vertical scaling to match anchor and horizontal scaling to match content when position is set to rig", async () => {
        const { element, connect, disconnect } = await setup();
        const popover: FASTPopover = element.querySelector("fast-popover") as FASTPopover;

        popover.position = PopoverPosition.right;

        await connect();

        expect(popover.verticalScaling).to.equal("anchor");
        expect(popover.horizontalScaling).to.equal("content");

        await disconnect();
    });
});

import { WebComponentDefinition } from "@microsoft/fast-tooling/dist/data-utilities/web-component";
import { DataType } from "@microsoft/fast-tooling";
import { PopoverPosition } from "@microsoft/fast-foundation/dist/esm/popover/popover.options";

export const fastPopoverDefinition: WebComponentDefinition = {
    version: 1,
    tags: [
        {
            name: "fast-popover",
            description: "The FAST popover element",
            attributes: [
                {
                    name: "visible",
                    description: "The visible attribute",
                    type: DataType.boolean,
                    default: undefined,
                    required: false,
                },
                {
                    name: "anchor",
                    description: "The anchor attribute",
                    type: DataType.string,
                    default: undefined,
                    required: false,
                },
                {
                    name: "delay",
                    description: "The delay attribute",
                    type: DataType.number,
                    default: 300,
                    required: false,
                },
                {
                    name: "position",
                    description: "The position attribute",
                    values: [
                        { name: PopoverPosition.top },
                        { name: PopoverPosition.right },
                        { name: PopoverPosition.bottom },
                        { name: PopoverPosition.left },
                        { name: PopoverPosition.start },
                        { name: PopoverPosition.end },
                    ],
                    type: DataType.string,
                    default: undefined,
                    required: false,
                },
            ],
            slots: [
                {
                    name: "",
                    description: "The default slot",
                },
            ],
        },
    ],
};

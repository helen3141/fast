---
id: popover
title: fast-popover
sidebar_label: popover
custom_edit_url: https://github.com/microsoft/fast-dna/edit/master/packages/web-components/fast-foundation/src/popover/README.md
---

The `fast-popover` component is used provide extra information about another element when it is hovered.

## Usage

```html live
<fast-design-system-provider use-defaults>
    <fast-button id="mybutton">
       Hover me for more info
    </fast-button>
    <fast-popover anchor="mybutton" position="right">
      helpful text
    </fast-popover>
</fast-design-system-provider>
```
---

## Applying custom styles

```ts
import { customElement } from "@microsoft/fast-element";
import { Popover, PopoverTemplate as template } from "@microsoft/fast-foundation";
import { PopoverStyles as styles } from "./popover.styles";

@customElement({
    name: "fast-popover",
    template,
    styles,
})
export class FASTPopover extends Popover {}
```
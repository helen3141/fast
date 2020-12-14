---
id: high-contrast-document
title: High Contrast in FAST
sidebar_label: High Contrast
custom_edit_url: https://github.com/microsoft/fast/edit/master/sites/website/src/docs/design-systems/high-contrast.md
---

### Styling components using forced-colors.
High contrast mode uses the CSS media feature, `forced-colors`. When `forced-colors` is set to active, the user agent will apply a limited color palette to the component.

**Example:**
```css
@media (forced-colors: active) {
    :host {
        background: ButtonFace;
    }
}
```

FAST has a utility function that is use to construct `forced-colors` in the stylesheet, called [forcedColorsStylesheetBehavior()](https://github.com/microsoft/fast/blob/master/packages/web-components/fast-foundation/src/utilities/match-media-stylesheet-behavior.ts). This is added in the `withBehavior()` function inside the `css` style.

**Example**
```css
export const ComponentStyles = css`
    /* ... */
 `.withBehaviors(
    forcedColorsStylesheetBehavior(
        css`
            :host {
                background: ButtonFace;
            }
        `
    )
);
```

### System Color Keyword
In `forced-colors` mode, the colors on the component are reduced to a limited color pallete chosen by the user. The system color keyword exposes these user chosen colors.

Below are the system color keywords we use in FAST. The keywords are used as color values on style properties.


| Keyword         | Description                                                                       |
|-----------------|-----------------------------------------------------------------------------------|
| `Canvas`          | Background of application content or documents.                                   |
| `CanvasText`      | Text in application content or documents.                                         |
| `LinkText`        | Text in non-active, non-visited links. For light backgrounds, traditionally blue. |
| `VisitedText`     | Text in visited links. For light backgrounds, traditionally purple.               |
| `ActiveText`      | Text in active links. For light backgrounds, traditionally red.                   |
| `ButtonFace`      | The face background color for push buttons.                                       |
| `ButtonText`      | Text on push buttons.                                                             |
| `Field`           | Background of input fields.                                                       |
| `FieldText`       | Text in input fields.                                                             |
| `Highlight`       | Background of selected items/text.                                                |
| `HighlightText`   | Text of selected items/text.                                                      |
| `GrayText`        | Disabled text. (Often, but not necessarily, gray.)                                |


FAST uses the [SystemColor](https://github.com/microsoft/fast/blob/master/packages/utilities/fast-web-utilities/src/system-colors.ts) enum when setting the color value keyword in the stylesheet.

**Example**
```css
export const ComponentStyles = css`
    /* ... */
 `.withBehaviors(
    forcedColorsStylesheetBehavior(
        css`
            :host {
                background: ${SystemColors.ButtonFace};
            }
        `
    )
);
```

### Forced colors and Windows High Contrast themes
`forced-colors` works with Windows high contrast, located in Ease of Access within Settings. There are two default themes to test high contrast, `High Contrast Black` and `High Contrast White`.

![High contrast black theme](https://res.cloudinary.com/dm4izfqmy/image/upload/v1607550781/highContrast_examples/hc-document/hc-black_kkp16d.png)
![High contrast white theme](https://res.cloudinary.com/dm4izfqmy/image/upload/v1607550781/highContrast_examples/hc-document/hc-white_fnktij.png)


Here is a 1:1 map between the `forced-colors` keywords and Windows high contrast resource names.

| forced-colors               | Windows         |
|-----------------------------|-----------------|
| `CanvasText`                | `Text`          |
| `LinkText`                  | `Hyperlinks`    |
| `GrayText`                  | `Disabled Text` |
| `HighlightText` `Highlight` | `Selected Text` |
| `ButtonText` `ButtonFace`   | `Button Text`   |
| `Canvas`                    | `Background`    |

### Quick demo

Here is a simple example adding high contrast to style an accent button. It has selectors for rest, active, hover, focus and disabled.

![Accent button](https://res.cloudinary.com/dm4izfqmy/image/upload/v1607550781/highContrast_examples/hc-document/acccent_vmbajs.png)

```css
export const AccentButtonStyles = css`
    :host([appearance="accent"]) {
        background: ${accentFillRestBehavior.var};
        color: ${accentForegroundCutRestBehavior.var};
    }
    :host([appearance="accent"]:hover) {
        background: ${accentFillHoverBehavior.var};
    }
    :host([appearance="accent"]:active) .control:active {
        background: ${accentFillActiveBehavior.var};
    }
    :host([appearance="accent"]) .control:${focusVisible} {
        box-shadow: 0 0 0 calc(var(--focus-outline-width) * 1px) inset ${neutralFocusInnerAccentBehavior.var};
    }
    :host([appearance="accent"][disabled]) {
        opacity: var(--disabled-opacity);
        background: ${accentFillRestBehavior.var};
    }
`
```

When high contrast is enabled, the system will try to apply the correct color. In the case of this accent button, the system is missing a few things. We do not have a background, rest and hover state is the same, focus is not following the button focus design, and the disabled state is too dim.

![Accent button no forced colors](https://res.cloudinary.com/dm4izfqmy/image/upload/v1607550781/highContrast_examples/hc-document/acccent-no-forced-colors_h0peqd.png)

To fix this, we will add `forcedColorsStylesheetBehavior` to `withBehaviors()`, take similar selectors, and add the system color keyword..

```css
export const AccentButtonStyles = css`
    /* ... */
`.withBehaviors(
    forcedColorsStylesheetBehavior(
        css`
            :host([appearance="accent"]) .control {
                forced-color-adjust: none;
                background: ${SystemColors.Highlight};
                color: ${SystemColors.HighlightText};
            }
            :host([appearance="accent"]) .control:hover,
            :host([appearance="accent"]:active) .control:active {
                background: ${SystemColors.HighlightText};
                border-color: ${SystemColors.Highlight};
                color: ${SystemColors.Highlight};
            }
            :host([appearance="accent"]) .control:${focusVisible} {
                border-color: ${SystemColors.ButtonText};
                box-shadow: 0 0 0 2px ${SystemColors.HighlightText} inset;
            }
            :host([appearance="accent"][disabled]),
            :host([appearance="accent"][disabled]) .control,
            :host([appearance="accent"][disabled]) .control:hover {
                background: ${SystemColors.ButtonFace};
                border-color: ${SystemColors.GrayText};
                color: ${SystemColors.GrayText};
                opacity: 1;
            }
        `
    )
);
```

After adding `forced-colors` and setting the keywords, accent button now has a background in the rest state, and in this case we are using the `Highlight` color. The hover state is reversed from the rest state, focus gets a double border treatment and disabled has opacity set to 1 and using the disabled color, `GrayText`.

![Accent button forced colors](https://res.cloudinary.com/dm4izfqmy/image/upload/v1607550781/highContrast_examples/hc-document/acccent-with-forced-colors_v76kif.png)

## Further resources


**Color contrast comparison chart**

To help determine whether a pair of high contrast colors will meet a color luminosity contrast ratio of at least 10:1
This table uses the high contrast theme color resource names you see in Windows Ease of Access.

How to read this table:
- <mark>YES</mark> - indicates that it is safe to assume this pair of colors will meet high contrast requirements, even in custom themes
- `YES*` - indicates that this specific pair of colors meets the high contrast requirements in both “HC White” and “HC Black” themes.
- NO - indicates that you should never use this pair of colors as they do not meet high contrast requirements in `High Contrast Black` and `High Contrast White` themes.

|                                 | Text             | Hyperlink        | Disabled Text    | Selected Text (Foreground) | Selected Text (Background) | Button Text (Foreground) | Button Text (Background) | Background       |
|---------------------------------|------------------|------------------|------------------|----------------------------|----------------------------|--------------------------|--------------------------|------------------|
| **Text**                        | NO               | NO               | NO               | NO                         | NO                         | NO                       | <mark>YES</mark>         | <mark>YES</mark> |
| **Hyperlink**                   | NO               | NO               | NO               | `YES*`                     | NO                         | NO                       | `YES*`                   | <mark>YES</mark> |
| **Disabled Text**               | NO               | NO               | NO               | `YES*`                     | NO                         | NO                       | <mark>YES</mark>         | <mark>YES</mark> |
| **Selected Text (Foreground)**  | NO               | `YES*`           | `YES*  `         | NO                         | <mark>YES</mark>           | `YES*`                   | NO                       | NO               |
| **Selected Text (Background)**  | NO               | NO               | NO               | <mark>YES</mark>           | NO                         | NO                       | `YES*`                   | `YES*`           |
| **Button Text (Foreground)**    | NO               | NO               | NO               | `YES*`                     | NO                         | NO                       | <mark>YES</mark>         | <mark>YES</mark> |
| **Button Text (Background)**    | <mark>YES</mark> | `YES*`           | <mark>YES</mark> | NO                         | `YES*`                     | <mark>YES</mark>         | NO                       | NO               |
| **Background**                  | <mark>YES</mark> | <mark>YES</mark> | <mark>YES</mark> | NO                         | `YES*`                     | <mark>YES</mark>         | NO                       | NO               |



**Microsoft Edge blog**

Microsoft Edge blog has an excellent in-depth information on styling for Windows high contrast using forced-colors.
[Styling for Windows high contrast with new standards for forced colors](https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/)
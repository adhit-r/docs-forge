---
name: Docs Forge
description: A technical field manual for a portable documentation workflow
colors:
  field-ink: "#121712"
  quiet-ink: "#3f4c42"
  graph-paper: "#e8efe5"
  sage-sheet: "#c9d9bf"
  clean-field: "#f8fbf4"
  fired-clay: "#a34524"
  deep-clay: "#68240f"
  working-sage: "#4c7355"
  focus-gold: "#a9881e"
typography:
  display:
    fontFamily: "Charter, Bitstream Charter, Sitka Text, Cambria, serif"
    fontSize: "clamp(4rem, 11vw, 8.8rem)"
    fontWeight: 700
    lineHeight: 0.82
  headline:
    fontFamily: "Charter, Bitstream Charter, Sitka Text, Cambria, serif"
    fontSize: "clamp(2.1rem, 5vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 0.92
  body:
    fontFamily: "Charter, Bitstream Charter, Sitka Text, Cambria, serif"
    fontSize: "clamp(1.08rem, 1.75vw, 1.35rem)"
    fontWeight: 400
    lineHeight: 1.48
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 780
    lineHeight: 1.2
rounded:
  square: "0"
spacing:
  compact: "12px"
  control: "18px"
  section: "clamp(64px, 9vw, 118px)"
components:
  button-primary:
    backgroundColor: "{colors.field-ink}"
    textColor: "{colors.clean-field}"
    rounded: "{rounded.square}"
    padding: "0 18px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.clean-field}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.square}"
    padding: "0 18px"
    height: "46px"
---

# Design System: Docs Forge

## Overview

**Creative North Star: "The Repository Field Manual"**

Docs Forge uses the visual language of a durable technical handbook laid over graph paper. Serif editorial weight gives the explanations authority, while sans-serif labels and monospace command surfaces identify actions and machine-readable details. The system is direct and structural, not glossy.

The design rejects generic AI-tool marketing, purple gradients, glassmorphism, inflated automation claims, rounded-icon card grids, and dark developer-tool styling used as a shortcut for credibility.

**Key Characteristics:**

- Square, bordered controls with visible construction.
- Sage paper surfaces, near-black ink, and restrained clay accents.
- Large type for orientation, compact labels for operation.
- Depth used as a structural offset, not ambient decoration.

## Colors

The palette resembles printed ink, recycled drafting paper, fired clay, and workshop labels.

### Primary

- **Field Ink:** Primary text, borders, and high-confidence actions.
- **Fired Clay:** Sparse emphasis for prompts and action cues.

### Secondary

- **Working Sage:** Process labels and supportive state.
- **Focus Gold:** Keyboard focus and attention without alarm.

### Neutral

- **Graph Paper:** Primary page background.
- **Sage Sheet:** Structural bands and secondary surfaces.
- **Clean Field:** Forms, panels, and reversed text.
- **Quiet Ink:** Supporting copy.

**The Printed Limit Rule.** Accent colors mark meaning. They never flood the interface or become decorative gradients.

## Typography

**Display Font:** Charter (with Bitstream Charter, Sitka Text, Cambria, serif fallbacks)
**Body Font:** Charter (with the same fallbacks)
**Label/Mono Font:** System sans for labels; system monospace for commands

**Character:** The serif reads like a maintained manual. Operational labels switch to sans or monospace so instructions remain visibly distinct from explanation.

### Hierarchy

- **Display** (700, fluid 4rem to 8.8rem, 0.82): Homepage identity only.
- **Headline** (700, fluid 2.1rem to 4.75rem, 0.92): Section orientation.
- **Title** (700, fluid 1.32rem to 1.8rem, 1): Component and article headings.
- **Body** (400, fluid 1.08rem to 1.35rem, 1.48): Explanations, capped near 70 characters where practical.
- **Label** (780, 0.88rem): Controls and compact operational labels.

**The Voice Switch Rule.** Serif explains. Sans labels actions. Monospace shows commands and machine output.

## Elevation

The system is flat by default. A hard offset shadow on the terminal-style product panel creates structural depth; borders and tonal surfaces handle all other separation.

### Shadow Vocabulary

- **Panel offset** (`14px 14px 0 #1e2a21`): Reserved for a single signature workflow panel.

**The One Lift Rule.** Only one primary object per viewport may use the hard offset shadow.

## Components

### Buttons

- **Shape:** Square and mechanical (0 radius).
- **Primary:** Field Ink background, Clean Field text, 2px border, minimum 46px height.
- **Hover / Focus:** Underline links on hover; use a 3px Focus Gold outline with 4px offset for keyboard focus.
- **Secondary:** Clean Field background with Field Ink text and border.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Clean Field or a translucent Clean Field mix.
- **Shadow Strategy:** Flat, except for the signature product panel.
- **Border:** 1px or 2px Field Ink depending on hierarchy.
- **Internal Padding:** Fluid 20px to 34px.

### Inputs / Fields

- **Style:** Clean Field background, 2px Field Ink border, square corners, and labels above controls.
- **Focus:** Focus Gold outline plus a Field Ink border.
- **Error / Disabled:** Plain-language status next to the relevant field; never rely on color alone.

### Navigation

Sans-serif, compact, and structurally separated by a 1px rule. Privacy controls remain reachable in the footer at every viewport.

## Do's and Don'ts

### Do:

- **Do** show commands and workflow state as inspectable technical material.
- **Do** preserve Field Ink borders and square control geometry.
- **Do** keep optional tracking and communications choices explicit and unticked.
- **Do** preserve keyboard focus and mobile access to privacy controls.

### Don't:

- **Don't** use generic AI-tool marketing.
- **Don't** use purple gradients.
- **Don't** use glassmorphism.
- **Don't** make inflated automation claims.
- **Don't** use rounded-icon card grids.
- **Don't** use dark developer-tool styling as a shortcut for credibility.
- **Don't** use a colored border-left or border-right stripe as decoration.

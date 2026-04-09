<h1 align="center">
    Palette
</h1>
<p align="center">
    An intuitive, uncluttered web-based drawing tool for quick doodles, conceptual diagrams, and markups.
</p>
<p align="center">
    <img src="https://github.com/JGefroh/palette-vue/blob/main/src/assets/logo.png?raw=true" height="300" />
</p>


# Intro

Palette is designed for creating quick doodles, markups, wireframes, and diagrams with precision and ease.

[Live Site](https://palette.jgefroh.com)

## Key Features
* Simple drawing — Brush, lines, rectangles, circles w/ varied line styles
* Quality of Life - Consistent keyboard shortcuts, automatic arrows, auto-saving with local persistence
* Color control — Custom colors, included themes, eyedrop sampling, fill, and automatic image color extraction
* Object manipulation — Full selection, rotation, and resizing, with copy, cut, and paste
* Text support - font-size, color, style, and alignment support with as-expected keyboard controls
* Multi-image support - create new tabs for new images, go back to old ones
* Easy import — Native drag-and-drop for external image import
* Full undo/redo — Complete operation history support


## Engineering Principles
* Any mess should be in a drawer, not all over the table.
* Zero defects - the app is too focused to accept bugs.
* The LLM cannot engineer, but it can code acceptably what you precisely tell it to - do not confuse the two.

## Design Principles
* Don't struggle with the tool - everything should just work as expected.
* Quality of Life is paramount.
* It should be simple and fast to do anything.
* Sacrifice precision for simplicity.

## Product Principles
* There must be no server back-end unless we are ready to operate this in perpetuity with service guarantees.
* Tools like Palette are cheap to build - the tool is not the value.
* The ICP is Joseph - someone who has 30 seconds to get their thoughts out visually before switching to a different task.


## Screenshots
![palette](https://github.com/user-attachments/assets/9f20fab8-e2d1-4ee9-92f4-5080685cf617)
![screenshot](https://github.com/user-attachments/assets/4939af1d-4ec6-43eb-b69b-a4d0f4cd2668)
![screenshot](https://github.com/user-attachments/assets/08399147-f132-4123-ba07-25e7971aee7f)



# Instructions

## Shortcuts

| Shortcut | Action |
|----------|--------|
| **Global** | |
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |
| Cmd+S | Download |
| Cmd+A | Select All |
| Q | Decrease Size |
| W | Increase Size |
| **Tools** | |
| B | Brush |
| R | Rectangle |
| C | Circle |
| L | Line |
| T | Text |
| F | Fill |
| S | Select |
| E | Eyedropper |
| **Selection** | |
| Cmd+C | Copy |
| Cmd+V | Paste |
| Cmd+X | Cut |
| Backspace | Delete Selection |
| **Colors** | |
| 0–9 | Select Color (Slot 0-9) |
| **Tabs** | |
| Tab | Next Tab |
| Shift+Tab | Previous Tab |
| **Brush** | |
| B | Switch Style (Solid, Dashed, Dotted)
| Cmd+B | Toggle Arrow |
| **Line** | |
| L | Switch Style (Solid, Dashed, Dotted)
| Cmd+L | Toggle Arrow |
| Shift (Hold) | Enable Snap to Axis |
| **Rectangle** | |
| R | Toggle Fill / Outline |
| Shift (Hold) | Constrain to Square |
| **Circle** | |
| C | Toggle Fill / Outline |
| Shift (Hold) | Constrain to Square |
| **Text** | |
| Enter | New line |
| Cmd+Enter | Submit |
| Cmd+B | Toggle Bold |
| Cmd+I | Toggle Italic |
| Cmd+U | Toggle Underline |
| Cmd+C | Copy selection |
| Cmd+V | Paste clipboard |
| Cmd+X | Cut selection |


# Technical


## Installation and running
```
npm install
npm run dev
open http://localhost:5173/
```



## History
This is a port of my original AngularJS repository [Palette](https://github.com/jgefroh/palette) into Vue 3 I wrote as a weekend project in 2016. It's been developed, with implementation support from Claude LLM, and a lot of non-AI elbow grease, engineering, hand-tweaking, design, and product sense from yours truly.

<h1 align="center">
    Palette
</h1>
<p align="center">
    An intuitive, uncluttered web-based drawing tool for quick doodles, conceptual diagrams, and markups.
    <br/><br/>
    <a href="https://palette.jgefroh.com"/>Live Site</a>
</p>
<p align="center">
    <img src="https://github.com/JGefroh/palette-vue/blob/main/src/assets/logo.png?raw=true" height="300" />
</p>


# Intro

Palette is designed for creating quick doodles, markups, wireframes, and diagrams with precision and ease.

<br/>

<p align="center">
    <img src="https://github.com/user-attachments/assets/9f20fab8-e2d1-4ee9-92f4-5080685cf617" />
</p>

## Key Features
* Simple drawing — Brush, lines, rectangles, circles w/ varied line styles
* Quality of Life - Consistent keyboard shortcuts, automatic arrows, auto-saving with local persistence
* Color control — Custom colors, included themes, eyedrop sampling, fill, and automatic image color extraction
* Object manipulation — Full selection, rotation, and resizing, with copy, cut, and paste
* Text support - font-size, color, style, and alignment support with as-expected keyboard controls
* Multi-image support - create new tabs for new images, go back to old ones
* Easy import — Native drag-and-drop for external image import
* Full undo/redo — Complete operation history support


## Screenshots

| <img width="2044" height="1090" alt="Screenshot 2026-04-11 at 9 57 07 AM" src="https://github.com/user-attachments/assets/9dc3e78c-dc42-4ca4-ade2-fcbed50ef1ed" /> |
|:--:|
| _Rapidly communicate concepts via diagrams_ |

| <img width="2039" height="1053" alt="Screenshot 2026-04-11 at 9 50 59 AM" src="https://github.com/user-attachments/assets/078a61d4-99fd-4d91-be2d-67139a6581c6" /> |
|:--:|
| _Draw doodles to your heart's content_ |

| <img width="2042" height="1091" alt="Screenshot 2026-04-11 at 9 59 32 AM" src="https://github.com/user-attachments/assets/bcc12ecd-f061-442f-95ff-7ec4702fe947" /> |
|:--:|
| _Quickly scribble comments on screenshots and images_ |



# Instructions
<img width="687" height="553" alt="Screenshot 2026-04-11 at 10 05 04 AM" src="https://github.com/user-attachments/assets/eb303125-6c72-42f0-b4c7-21155ec5885e" />



# Technical


## Installation and running
```
npm install
npm run dev
open http://localhost:5173/
```

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


## History
This is a port of my original AngularJS repository [Palette](https://github.com/jgefroh/palette) into Vue 3 I wrote as a weekend project in 2016. It's been developed, with implementation support from Claude LLM, and a lot of non-AI elbow grease, engineering, hand-tweaking, design, and product sense from yours truly.

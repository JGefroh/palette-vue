<h1 align="center">
    Palette
</h1>
<p align="center">
    An intuitive, uncluttered web-based drawing tool for quick doodles, markups, and visual thinking.
    <br/><br/>
    <a href="https://palette.jgefroh.com"/>Live Site</a>
</p>
<p align="center">
    <img src="https://github.com/JGefroh/palette-vue/blob/main/src/assets/logo.png?raw=true" height="300" />
</p>


# Intro

Get your visual thoughts out fast - no login, no install, no friction. Works anywhere a browser does: especially useful on Apple Mac where you don't have Paint.

Get a visual thought out of your head before you're forced to switch context!

<br/>

<p align="center">
    <img src="https://github.com/user-attachments/assets/9f20fab8-e2d1-4ee9-92f4-5080685cf617" />
</p>

## Key Features
* **Sketch without friction** — No login, no install, no account. Open https://palette.jgefroh.com and draw immediately
* **No struggle drawing** - Don't worry about layers, objects, or grouping - just draw
* **30-second thinking** — Keyboard shortcuts for everything - get your idea out before context-switching
* **Markup anything** — Annotate screenshots and images without leaving the browser - just drag, drop, and draw
* **Everything stays local** — No cloud, no tracking, no data sent anywhere. Works offline after first load


## Screenshots

| <img width="2044" height="1090" alt="Screenshot 2026-04-11 at 9 57 07 AM" src="https://github.com/user-attachments/assets/9dc3e78c-dc42-4ca4-ade2-fcbed50ef1ed" /> |
|:--:|
| _Rapidly communicate concepts via sketches_ |

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

## Fun metrics
Up to v0.1.0 release:
* Haiku 4.5 | In: 287.9k · Out: 5.4m
* Work time estimate: ~64+ hours
    * 14 calendar days start to finish (not counting initial AngularJS version)
    * 4 weekend days, 4 hours / day (~16 hours)
    * 12 weekday days × 4 hours (~48 hours)

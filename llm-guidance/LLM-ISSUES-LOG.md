# LLM ISSUES LOG

This is a log of issues where I had to re-prompt or correct issues made by the LLM.

When corrected by the user, Claude should add an entry to this file.

Category|Problem| Severity |Resolution
|-------|------|-------|-------
Style| Ignored lower-kebab-case naming for cursorManager.js | Low | LLM after 1 corrective prompt.
Style| Did not rename cursorManager.js to cursor-manager.js when instructed to match conventions | Low | LLM after 1 corrective prompt.
Architecture| Had PaperCanvas handle coordinate computation instead of letting CursorManager do it | Medium | LLM after 1 corrective prompt.
Cleanup| Created redundant palette.js barrel file that added no value | Low | User questioned necessity; LLM removed it
Cleanup| Created redundant palette.css file that duplicated global styles | Low | User questioned necessity; LLM removed it
Architecture| Planned to have PaletteApp own state management when CanvasStateManager should handle canvas updates itself | Medium | User corrected delegation pattern; LLM moved update logic into CanvasStateManager
Style| Used non-standard event names (@initialize, @stroke-start) instead of @on-initialize, @on-stroke-start | Low | User corrected Vue event naming convention
Style| Used verbose null checks instead of optional chaining (?.) | Low | User corrected; LLM simplified to use ?.
Style| Named event handlers by trigger instead of action (e.g., onStrokeStart vs saveState) | Low | User corrected; LLM renamed handlers to describe what they do
Process| Created unnecessary feedback_event_naming.md file instead of adding content to existing LLM-GUIDANCE.md | Low | User corrected; LLM deleted file and added guidance to existing document
Architecture| Checked for method existence with ?. instead of trusting tool API guarantees; tried to call drawCursorPreview directly | Medium | User corrected that tool API guarantees preProcess/process/postProcess; check should be on tool, not method
Architecture| Cursor overlay dot only updated when mouse down; attempted fix by adding state to Pencil tool instead of recognizing cursor as independent concern | High | User corrected 6 times: cursor must be completely separate from drawing logic and tool state, with independent mousemove listener
Architecture| Added save/load logic to PaletteApp instead of CanvasStateManager | Medium | User corrected that persistence belongs in state manager; LLM moved logic
Feature Completeness| Added save functionality but didn't implement auto-load on app startup | Low | User pointed out missing obvious next step; LLM called load() in setupStateManager
Reactivity| Attempted to use integer counter as reactive trigger for computed property; didn't return value in computed | High | User corrected 2 times: computed must return a value, and integer counters are wrong approach for reactivity
UX| Added unsaved indicator using a span element that changed button size | Low | User corrected; LLM changed to box-shadow underline that doesn't affect layout
Reactivity| Used computed property that couldn't react to canvas mutations; implemented integer counter approach | High | User corrected: use watch on boolean with explicit updates in methods that mutate state
Bug| Caused regression in Pencil tool during refactoring; single clicks (no drag) didn't draw | Medium | User reported; LLM added strokeStartCoordinates tracking to restore point-click functionality
Bug| Caused regression in color handling; failed to initialize drawingCtx.fillStyle, leaving points colorless while lines had color | Medium | User reported; LLM added fillStyle initialization to drawingCtx and watchers
Bug| Created shape tool without passing getLineWidth dependency; shape overlay preview ignored brush size setting | Medium | User reported; LLM added getLineWidth to ShapeTool constructor and set lineWidth before drawing on both contexts
Architecture| Designed shape tool integration with redundant state: activeTool prop (String), selectedTool data (String), and this.tool instance all representing the same thing | High | User questioned the duplication; LLM refactored to use selectedToolIndex + computed activeTool
Architecture| Had PaperCanvas create and manage tool instances when canvas should have zero knowledge of tools | High | User asked "Why does Canvas know about tools at all?"; LLM moved tool creation to PaletteApp, now canvas receives only the current tool instance via prop
Bug| Circle tool had incorrect geometry; anchor point at center instead of corner, then bounding box center shifted during drag, then Math.min caused jank | High | User corrected 3 times: center should be midpoint of start/end, radius should be distance from center to end point (stable through drag)
UX| Created Circle tool with fundamentally different anchor point behavior than Rectangle tool without noting the inconsistency; user expects all shape tools to behave alike | Medium | User pointed out design consistency failure: shape tools should have uniform interaction model
Bug| Cursor circle drawn with both fill() and stroke(), making it appear ~2x larger than actual brush stroke at large sizes | Medium | User reported; LLM removed stroke() call from both updateCursor() and drawCursorPreview()
Architecture| Attempted to hard-code tool icon logic in template with v-if statements instead of attaching icon metadata to tool objects | Medium | User corrected; LLM created toolList with metadata objects containing name and icon
Process| User requested icons for rectangle and circle; LLM added pencil icon too, bundling an unasked refactor into feature request | Low | User corrected scope creep; LLM reverted pencil icon to null and kept only rectangle/circle icons
Process| Text tool plan consumed ~10% of session tokens and was poor engineering — proposed mixing concerns (panel state in PaperCanvas slot, suppressCursor prop, coordinate conversion) instead of the straightforward solution: vanilla JS prompt() in tool's start() method | High | User rejected plan and broke task into simple steps; correct solution was trivial
Style| Named method onDrop after the event instead of what it does | Low | User corrected: name methods by their action, not their trigger — fitDroppedImage not onDrop
Architecture| Used activeTabIndex (array position) to track the active tab instead of activeTabId (identity key on the object itself) | Medium | User corrected: identity should be stored as a key on the object, not derived from array position which is fragile
Architecture| Tried to add clearCanvas() to CanvasStateManager when CanvasClearer already handles canvas clearing | Low | User rejected: don't add capabilities that already exist elsewhere; read the codebase before adding new methods
Bug| switchTab didn't clear the canvas before loading — if a tab had no saved data, the previous tab's drawing bled through | Medium | User reported bug; fix was to always clearRect before load() in switchTab
Architecture| addTab duplicated the clearRect call that switchTab already owns after the fix, instead of just calling switchTab | Low | User corrected; addTab should delegate to switchTab rather than repeat the clearing logic itself
Bug| deleteTab didn't handle the case of deleting the only tab — returned early instead of creating a replacement Canvas 1 | Low | User pointed out missing edge case; fix was to push a new default tab before switching
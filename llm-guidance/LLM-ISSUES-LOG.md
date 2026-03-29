# LLM ISSUES LOG

This is a log of issues where I had to re-prompt or correct issues made by the LLM.

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
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
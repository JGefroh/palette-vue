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
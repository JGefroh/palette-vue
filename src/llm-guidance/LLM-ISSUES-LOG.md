# LLM ISSUES LOG

This is a log of issues where I had to re-prompt or correct issues made by the LLM.

Category|Problem| Severity |Resolution
|-------|------|-------|-------
Style| Ignored lower-kebab-case naming for cursorManager.js | Low | LLM after 1 corrective prompt.
Style| Did not rename cursorManager.js to cursor-manager.js when instructed to match conventions | Low | LLM after 1 corrective prompt.
Architecture| Had PaperCanvas handle coordinate computation instead of letting CursorManager do it | Medium | LLM after 1 corrective prompt.
Cleanup| Created redundant palette.js barrel file that added no value | Low | User questioned necessity; LLM removed it
Cleanup| Created redundant palette.css file that duplicated global styles | Low | User questioned necessity; LLM removed it
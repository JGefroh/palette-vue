# LLM Guidance

This document is intended for LLMs to follow to avoid re-prompting annoyances.


## Event handling
Event handler methods used in a Vue template must be called by the thing they do, NOT the event.

Bad:
```
<button @click="onClick()">Button</button>
```

Good: 
```
<button @click="sendEmail()">Button</button>
```


## Patterns and structure

Logic that does not need to be inside a Vue component should be in a standalone plain javascript class that is called by the Vue component. Vue should only be used in scenarions handling:

* Interaction wiring
* Vue-specific functionality

We are not creating a Vue app. We are creating an app that happens to use Vue for the front-end.


## Structure

Folder structure should be module-based, not sock-drawer based. Modules may have subfolders that become sock-drawers if there's 10+ more files in that folder.
Modules that could potentially be used in a completely different app without modification (eg. generic components, utilities) should be in a /shared folder. There must be no domain-specific modules in that folder.

## Naming
All files should be lowercase and kebab-case except for .MD files.

## Errors and corrections
If I have to correct you, update LLM-ISSUES-LOG.md with information about the correction. 
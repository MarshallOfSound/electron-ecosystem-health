# @electron/ecosystem-health

> Automated assessment of version adoption across key apps in the Electron ecosystem

## Usage

```bash
yarn
yarn tsc
node lib/index.js
```

## Supported Apps

Applications were chosen based on their adoption and recognizability, other apps welcome to be added however please be aware that app addition PRs may be rejected for arbitrary "that app doesn't make sense to be here" reasons.

Currently checked apps are listed below

* Slack
* Signal
* Discord
* 1Password
* Visual Studio Code
* TIDAL
* Splice
* Postman
* Skype
* Polypane
* Notion
* Microsoft Teams
* Loom
* GitHub Desktop
* Asana
* Figma

## How does this work?

All these apps may not have public codebases but being publicly available for download this script pulls the "latest" version of all the apps mentioned above and then performs simple version checks on the Electron Framework embedded within that latest payload. 

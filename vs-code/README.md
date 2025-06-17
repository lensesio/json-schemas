# Lenses IAM Autocomplete VS Code Extension

This extension provides autocompletion for IAM roles in YAML files, powered by your Lenses backend API.

## Features
- Autocompletes IAM role names when editing YAML files.
- Fetches roles dynamically from `http://localhost:4200/v1/roles`.
- Suggestions appear when editing lines containing `role:` or `roles:`.

## Usage
1. Start your Lenses backend so that `http://localhost:4200/v1/roles` is available.
2. Open a YAML file in VS Code.
3. On a line with `role:` or `roles:`, trigger completion (Ctrl+Space or start typing after the colon).
4. Select from the list of available roles.

## Development
1. `cd vs-code`
2. `npm install`
3. `npm run compile`
4. Open this folder in VS Code and press `F5` to launch an Extension Development Host.

## Notes
- The extension uses `node-fetch` to make HTTP requests. Ensure your backend is accessible from your development environment.
- Only triggers on lines with `role:` or `roles:` for minimal noise.

---

MIT License 
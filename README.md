# QuickAITrans

Helper script to quickly translate projects using i18n json files.

## Installation

```
npm install @chax-at/quickaitrans
```

## Run

```
npx quickaitrans <configfile>
```

If no config file ist given `.quickaitrans.json` will be used

## Configuration

Create a configuration file `.quickaitrans.json` in the format:
```json
{
  "translationFilePathTemplate": "locales/{lang}/translation.json",
  "baseLocale": "en",
  "targetLocales": ["de","it"],
  "appInfo": "Optional info about your app to help with the automatic translation"
}
```

Create a `.env` file with your LLM deployment data:
```
AI_API_KEY=
AI_DEPLOYMENT=
AI_HOST=
AI_API_VERSION=
```

## Features

- Preserves the key order of the base file for all target translations
- Sends missing translation keys to the given LLM for translation
- Automatically splits the missing translations if they do not fit into the context window

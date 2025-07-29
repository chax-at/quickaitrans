# QuickAITrans

Helper script to quickly translate projects using i18n json files.

## Configuration

Create a configuration file `.quickaitrans.json` in the format:
```json
{
  "translationFilePathTemplate": "locales/{lang}/translation.json",
  "baseLocale": "en",
  "targetLocales": ["de","it"],
  "appInfo": "Optional info about your app to help with the autmatic translation"
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
- Automatically splits the missing translations so if they do no fit into the context window

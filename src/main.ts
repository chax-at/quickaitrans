import fs from 'node:fs/promises';
import path from 'node:path';
import type z from 'zod';
import { array, object, string } from 'zod';
import { translate, type TranslationMap, type TranslationRecord } from './i18n.js';
import {
  parseJsonWithOrder,
  translationMapToRecord
} from './parseJsonWithOrder.js';
import {
  diffTranslationMaps,
  insertValuesFromBToA,
  mergeTranslationMaps,
  translationRecordToMap
} from './translationMapHelpers.js';
import { translationMapToJson } from './translationMapToJson.js';

const configFileSchema = object({
  translationFilePathTemplate: string().min(1),
  baseLocale: string().min(1),
  targetLocales: array(string().min(1)),
  appInfo: string().optional()
});
export type ConfigFile = z.infer<typeof configFileSchema>;

async function main() {
  const configFilePath = process.argv[2] ?? '.quickaitrans.json';
  const configFileContent = await fs.readFile(configFilePath, 'utf-8');
  const configJSON = JSON.parse(configFileContent);

  const config = configFileSchema.parse(configJSON);

  const translationFilePathTemplate = config.translationFilePathTemplate;
  const baseLocale = config.baseLocale;
  const targetLocales = config.targetLocales;

  const sourceLanguageFilePath = translationFilePathTemplate.replace(
    '{lang}',
    baseLocale
  );

  const sourceFileContent = await fs.readFile(sourceLanguageFilePath, 'utf-8');
  const sourceRecords = parseJsonWithOrder(sourceFileContent);

  for (const targetLocale of targetLocales) {
    const targetLanguageFilePath = translationFilePathTemplate.replace(
      '{lang}',
      targetLocale
    );
    let targetRecords: TranslationMap = new Map();
    try {
      const targetFileContent = await fs.readFile(
        targetLanguageFilePath,
        'utf-8'
      );
      targetRecords = parseJsonWithOrder(targetFileContent.toString());
    } catch {
      console.warn(
        `Target language file ${targetLanguageFilePath} not found. Creating a new one.`
      );
      try {
        await fs.mkdir(path.dirname(targetLanguageFilePath), {
          recursive: true
        });
      } catch (e) {
        console.error('Could not create output directory', e);
      }
    }

    const diff = diffTranslationMaps(sourceRecords, targetRecords);
    let translated: TranslationRecord = {};
    if (diff.size > 0) {
      translated = await translate({
        sourceLanguage: baseLocale,
        destinationLanguage: targetLocale,
        source: translationMapToRecord(diff),
        appInfo: config.appInfo,
      });

      console.log(
        `Translated records from ${baseLocale} to ${targetLocale}:`,
      );
      console.dir(translated, { depth: 10, colors: true });
    } else {
      console.log(
        `No differences found between ${baseLocale} and ${targetLocale}.`
      );
    }

    let newTranslation = mergeTranslationMaps(
      targetRecords,
      translationRecordToMap(translated)
    );
    newTranslation = insertValuesFromBToA(sourceRecords, newTranslation);

    await fs.writeFile(
      targetLanguageFilePath,
      `${translationMapToJson(newTranslation, 2, 0)}\n`
    );
  }
}

void main();

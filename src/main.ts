import fs from 'node:fs/promises';
import path from 'node:path';
import {
  diffTranslations,
  filterTranslationByB,
  mergeTranslations,
  sortTranslationKeys
} from './diff';
import { translate, type TranslationRecord } from './i18n';
import { array, boolean, object, string } from 'zod';
import type z from 'zod';

const configFileSchema = object({
  translationFilePathTemplate: string().min(1),
  baseLocale: string().min(1),
  targetLocales: array(string().min(1)),
  sortTarget: boolean().default(true),
  cleanTarget: boolean().default(true)
});
export type ConfigFile = z.infer<typeof configFileSchema>;

async function main() {
  const configFilePath = process.argv[2] ?? '.quickaitrans.json';
  const configFileContent = await fs.readFile(configFilePath, 'utf-8');
  const config = configFileSchema.parse(JSON.parse(configFileContent));

  const translationFilePathTemplate = config.translationFilePathTemplate;
  const baseLocale = config.baseLocale;
  const targetLocales = config.targetLocales;
  const sortTarget = config.sortTarget;
  const cleanTarget = config.cleanTarget;

  const sourceLanguageFilePath = translationFilePathTemplate.replace(
    '{lang}',
    baseLocale
  );

  const sourceFileContent = await fs.readFile(sourceLanguageFilePath, 'utf-8');
  const sourceRecords = JSON.parse(
    sourceFileContent,
    (key, value) => {
      console.log(key, typeof key);
      return value;
    }
  ) as TranslationRecord;

  return;

  for (const targetLocale of targetLocales) {
    const targetLanguageFilePath = translationFilePathTemplate.replace(
      '{lang}',
      targetLocale
    );
    let targetRecords: TranslationRecord = {};
    try {
      const targetFileContent = await fs.readFile(
        targetLanguageFilePath,
        'utf-8'
      );
      targetRecords = JSON.parse(
        targetFileContent.toString()
      ) as TranslationRecord;
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

    console.log('===========', sourceRecords);
    const diff = diffTranslations(sourceRecords, targetRecords);
    let translated: TranslationRecord = {};
    if (Object.keys(diff).length > 0) {
      translated = await translate({
        sourceLanguage: baseLocale,
        destinationLanguage: targetLocale,
        source: diff
      });

      console.log(
        `Translated records from ${baseLocale} to ${targetLocale}:`,
        translated
      );
    } else {
      console.log(
        `No differences found between ${baseLocale} and ${targetLocale}.`
      );
    }

    let newTranslation = mergeTranslations(targetRecords, translated);

    if (!cleanTarget) {
      const unusedTranslations = diffTranslations(
        newTranslation,
        sourceRecords
      );
      if (Object.keys(unusedTranslations).length > 0) {
        console.log(
          `Unused translations in ${targetLocale}:`,
          unusedTranslations
        );
      }
    }

    if (sortTarget) {
      console.log(`Sorting translations for ${targetLocale}`);
      newTranslation = sortTranslationKeys(newTranslation);
    }
    if (cleanTarget) {
      console.log(`Filtering translations for ${targetLocale}`);
      newTranslation = filterTranslationByB(newTranslation, sourceRecords);
    }

    await fs.writeFile(
      targetLanguageFilePath,
      JSON.stringify(newTranslation, null, 2)
    );
  }
}

void main();

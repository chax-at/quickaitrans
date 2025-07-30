import clarinet from 'clarinet';
import type { TranslationMap, TranslationRecord } from './i18n.js';

export function parseJsonWithOrder(json: string): TranslationMap {
  const parser = clarinet.parser();
  const stack: Array<TranslationMap> = [];
  let currentKey: string | null = null;
  let root: TranslationMap | undefined = undefined;

  parser.onopenobject = function (key: string) {
    const map = new Map<string, TranslationMap | string>();
    if (stack.length > 0) {
      if (currentKey !== null) {
        stack[stack.length - 1].set(currentKey, map);
      }
    } else {
      root = map;
    }
    stack.push(map);
    currentKey = key;
  };

  parser.onkey = function (key: string) {
    currentKey = key;
  };

  parser.onvalue = function (value: any) {
    if (typeof value === 'string' && currentKey !== null) {
      stack[stack.length - 1].set(currentKey, value);
    } else {
      throw new Error(
        `Invalid value for key '${currentKey}': Only strings or nested maps are allowed.`,
      );
    }
  };

  parser.oncloseobject = function () {
    stack.pop();
    currentKey = null;
  };

  // Throw error if arrays are encountered
  parser.onopenarray = function () {
    throw new Error('Arrays are not allowed in TranslationMap JSON structure.');
  };
  parser.onclosearray = function () {
    currentKey = null;
  };

  parser.write(json);
  return root ?? new Map();
}

/**
 * Converts a TranslationMap to a TranslationRecord.
 * @param map The TranslationMap to convert.
 * @returns The corresponding TranslationRecord.
 */
export function translationMapToRecord(map: TranslationMap): TranslationRecord {
  const obj: TranslationRecord = {};
  for (const [key, value] of map.entries()) {
    if (value instanceof Map) {
      obj[key] = translationMapToRecord(value);
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

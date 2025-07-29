import type { TranslationMap, TranslationRecord } from './i18n';

export function diffTranslationMaps(
  A: TranslationMap,
  B: TranslationMap
): TranslationMap {
  const result = new Map<string, TranslationMap | string>();
  for (const [key, aVal] of A.entries()) {
    if (!B.has(key)) {
      result.set(key, aVal);
    } else {
      const bVal = B.get(key);
      if (aVal instanceof Map && bVal instanceof Map) {
        const nestedDiff = diffTranslationMaps(aVal, bVal);
        if (nestedDiff.size > 0) {
          result.set(key, nestedDiff);
        }
      } else if (typeof aVal !== typeof bVal) {
        result.set(key, aVal);
      }
      // If both are strings, do nothing (exists in B)
    }
  }
  return result;
}

export function mergeTranslationMaps(
  A: TranslationMap,
  B: TranslationMap
): TranslationMap {
  const result = new Map<string, TranslationMap | string>(A);
  for (const [key, bVal] of B.entries()) {
    const aVal = result.get(key);
    if (bVal instanceof Map && aVal instanceof Map) {
      result.set(key, mergeTranslationMaps(aVal, bVal));
    } else {
      result.set(key, bVal);
    }
  }
  return result;
}

export function insertValuesFromBToA(
  A: TranslationMap,
  B: TranslationMap
): TranslationMap {
  const result = new Map<string, TranslationMap | string>();
  for (const [key, aVal] of A.entries()) {
    if (B.has(key)) {
      const bVal = B.get(key);
      if (aVal instanceof Map && bVal instanceof Map) {
        const nested = insertValuesFromBToA(aVal, bVal);
        if (nested.size > 0) {
          result.set(key, nested);
        }
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        result.set(key, bVal);
      }
      // If types mismatch, skip
    }
    // If key not in B, skip
  }
  return result;
}

export function sortTranslationMapKeys(map: TranslationMap): TranslationMap {
  const sorted = new Map<string, TranslationMap | string>();
  const keys = Array.from(map.keys()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  for (const key of keys) {
    const val = map.get(key);
    if (val instanceof Map) {
      sorted.set(key, sortTranslationMapKeys(val));
    } else {
      sorted.set(key, val!);
    }
  }
  return sorted;
}

export function translationMapToRecord(map: TranslationMap): TranslationRecord {
  const obj: TranslationRecord = {};
  for (const [key, val] of map.entries()) {
    if (val instanceof Map) {
      obj[key] = translationMapToRecord(val);
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

export function translationRecordToMap(obj: TranslationRecord): TranslationMap {
  const map = new Map<string, TranslationMap | string>();
  for (const key in obj) {
    const val = obj[key];
    if (val && typeof val === 'object' && !(val instanceof Map)) {
      map.set(key, translationRecordToMap(val));
    } else {
      map.set(key, val);
    }
  }
  return map;
}

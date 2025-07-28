import type { TranslationRecord } from "./i18n";

export function diffTranslations(A: TranslationRecord, B: TranslationRecord): TranslationRecord {
  const result: TranslationRecord = {};
  for (const key in A) {
    if (!(key in B)) {
      result[key] = A[key];
    } else {
      const aVal = A[key];
      const bVal = B[key];
      if (typeof aVal === 'object' && aVal !== null && typeof bVal === 'object' && bVal !== null) {
        const nestedDiff = diffTranslations(aVal, bVal);
        if (Object.keys(nestedDiff).length > 0) {
          result[key] = nestedDiff;
        }
      }
      // If both are strings, do nothing (exists in B)
    }
  }
  return result;
}

export function mergeTranslations(A: TranslationRecord, B: TranslationRecord): TranslationRecord {
  const result: TranslationRecord = { ...A };
  for (const key in B) {
    const bVal = B[key];
    const aVal = result[key];
    if (typeof bVal === 'object' && bVal !== null && typeof aVal === 'object' && aVal !== null) {
      result[key] = mergeTranslations(aVal, bVal);
    } else {
      result[key] = bVal;
    }
  }
  return result;
}

export function filterTranslationByB(A: TranslationRecord, B: TranslationRecord): TranslationRecord {
  const result: TranslationRecord = {};
  for (const key in A) {
    if (key in B) {
      const aVal = A[key];
      const bVal = B[key];
      if (typeof aVal === 'object' && aVal !== null && typeof bVal === 'object' && bVal !== null) {
        const nested = filterTranslationByB(aVal, bVal);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        result[key] = aVal;
      }
      // If types mismatch, skip
    }
    // If key not in B, skip
  }
  return result;
}

export function sortTranslationKeys(obj: TranslationRecord): TranslationRecord {
  const sorted: TranslationRecord = {};
  const keys = Object.keys(obj).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      sorted[key] = sortTranslationKeys(val);
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}


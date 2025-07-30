import type { TranslationMap } from './i18n.js';

export function translationMapToJson(
  map: TranslationMap,
  indent: number = 2,
  level: number = 0,
): string {
  const entries = Array.from(map.entries());
  const pad = (n: number) => ' '.repeat(n);
  let result = '{\n';
  entries.forEach(([key, value], idx) => {
    result += pad((level + 1) * indent) + JSON.stringify(key) + ': ';
    if (value instanceof Map) {
      result += translationMapToJson(
        value as TranslationMap,
        indent,
        level + 1,
      );
    } else {
      result += JSON.stringify(value);
    }
    if (idx < entries.length - 1) result += ',';
    result += '\n';
  });
  result += pad(level * indent) + '}';
  return result;
}

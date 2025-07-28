import { diffTranslations, mergeTranslations } from './diff';
import { describe, it, expect } from 'vitest';
import type { TranslationRecord } from './i18n';

describe('diffTranslations', () => {
  it('returns all keys in A not in B', () => {
    const A: TranslationRecord = { a: '1', b: '2' };
    const B: TranslationRecord = { a: '1' };
    expect(diffTranslations(A, B)).toEqual({ b: '2' });
  });

  it('does not return keys where string value differs', () => {
    const A: TranslationRecord = { a: '1', b: '2' };
    const B: TranslationRecord = { a: '1', b: '3' };
    expect(diffTranslations(A, B)).toEqual({});
  });

  it('handles nested objects', () => {
    const A: TranslationRecord = { a: { x: '1', y: '2' }, b: '2' };
    const B: TranslationRecord = { a: { x: '1' } };
    expect(diffTranslations(A, B)).toEqual({ a: { y: '2' }, b: '2' });
  });

  it('does not return nested differing values', () => {
    const A: TranslationRecord = { a: { x: '1', y: '2' }, b: '2' };
    const B: TranslationRecord = { a: { x: '1', y: '3' }, b: '2' };
    expect(diffTranslations(A, B)).toEqual({});
  });

  it('returns empty object if no differences', () => {
    const A: TranslationRecord = { a: '1', b: { x: '2' } };
    const B: TranslationRecord = { a: '1', b: { x: '2' } };
    expect(diffTranslations(A, B)).toEqual({});
  });
});

describe('mergeTranslations', () => {
  it('inserts all values from B into A', () => {
    const A: TranslationRecord = { a: '1', b: '2' };
    const B: TranslationRecord = { c: '3' };
    expect(mergeTranslations(A, B)).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('replaces values from B in A', () => {
    const A: TranslationRecord = { a: '1', b: '2' };
    const B: TranslationRecord = { b: '3' };
    expect(mergeTranslations(A, B)).toEqual({ a: '1', b: '3' });
  });

  it('handles nested objects', () => {
    const A: TranslationRecord = { a: { x: '1', y: '2' }, b: '2' };
    const B: TranslationRecord = { a: { y: '3', z: '4' } };
    expect(mergeTranslations(A, B)).toEqual({ a: { x: '1', y: '3', z: '4' }, b: '2' });
  });

  it('replaces nested objects', () => {
    const A: TranslationRecord = { a: { x: '1' }, b: '2' };
    const B: TranslationRecord = { a: '3' };
    expect(mergeTranslations(A, B)).toEqual({ a: '3', b: '2' });
  });

  it('handles empty B', () => {
    const A: TranslationRecord = { a: '1', b: '2' };
    const B: TranslationRecord = {};
    expect(mergeTranslations(A, B)).toEqual({ a: '1', b: '2' });
  });

  it('handles empty A', () => {
    const A: TranslationRecord = {};
    const B: TranslationRecord = { a: '1', b: '2' };
    expect(mergeTranslations(A, B)).toEqual({ a: '1', b: '2' });
  });
});

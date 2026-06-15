import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('une clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('resuelve conflictos de Tailwind quedándose con el último', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

import { existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { PRESS_LOGOS_DARK, PRESS_LOGOS_LIGHT } from '../press';

describe('press strip', () => {
  it.each([PRESS_LOGOS_LIGHT, PRESS_LOGOS_DARK])('logo file %s exists in public/', (src) => {
    expect(existsSync(path.join(process.cwd(), 'public', src))).toBe(true);
  });
});

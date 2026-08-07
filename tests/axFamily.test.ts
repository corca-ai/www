import assert from 'node:assert/strict';
import test from 'node:test';
import { isAxFamilyPath } from '../src/ax/axFamily.ts';

for (const pathname of [
  '/ax',
  '/ax/ceal',
  '/en/ax',
  '/en/ax/ceal',
  '/ja/ax',
  '/zh/ax/ax-knownow',
]) {
  test(`recognizes public AX family route ${pathname}`, () => {
    assert.equal(isAxFamilyPath(pathname), true);
  });
}

for (const pathname of ['/ax-backup', '/en/ax-backup', '/blog/ax', '/products/ax', '/']) {
  test(`excludes non-AX route ${pathname}`, () => {
    assert.equal(isAxFamilyPath(pathname), false);
  });
}

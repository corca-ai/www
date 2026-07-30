import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveLeadPayloadContext } from '../src/lead/pageContext.ts';

for (const [locale, pathname] of [
  ['ko', '/ax'],
  ['en', '/en/ax'],
  ['ja', '/ja/ax'],
  ['zh', '/zh/ax'],
] as const) {
  test(`uses one AX page ID for ${locale}`, () => {
    assert.deepEqual(
      resolveLeadPayloadContext(
        {
          contentType: 'ax-solution',
          locale,
          pageBasePath: '/ax',
          leadPage: 'ax',
        } as DOMStringMap,
        pathname,
      ),
      {
        base_path: '/ax',
        content_type: 'ax-solution',
        locale,
        page_id: 'ax',
        page_path: pathname,
      },
    );
  });
}

test('falls back to unknown without blocking the actual localized path', () => {
  assert.deepEqual(
    resolveLeadPayloadContext({ locale: 'en' } as DOMStringMap, '/en/ax/ax-knownow'),
    {
      base_path: '/ax/ax-knownow',
      content_type: 'unknown',
      locale: 'en',
      page_id: 'unknown',
      page_path: '/en/ax/ax-knownow',
    },
  );
});

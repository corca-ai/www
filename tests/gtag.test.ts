import assert from 'node:assert/strict';
import test from 'node:test';
import { emitGtagEvent } from '../src/analytics/gtag.ts';

test('uses the direct GA gtag event command without a GTM dataLayer event object', () => {
  const calls: unknown[][] = [];

  emitGtagEvent((...args) => calls.push(args), 'generate_lead', {
    form_id: 'ax_consultation',
    locale: 'ko',
  });

  assert.deepEqual(calls, [
    ['event', 'generate_lead', { form_id: 'ax_consultation', locale: 'ko' }],
  ]);
});

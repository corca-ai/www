import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AX_ACQUISITION_STORAGE_KEY,
  captureAxAcquisition,
  readOrCaptureAxAcquisition,
} from '../src/analytics/axAcquisition.ts';

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test('captures Google as the first external referrer without classifying the channel', () => {
  const acquisition = captureAxAcquisition(
    'https://www.corca.ai/ax',
    'https://www.google.com/search?q=site%3Acorca.ai',
  );

  assert.deepEqual(acquisition, {
    initial_referrer_host: 'www.google.com',
    landing_path: '/ax',
    utm: {},
  });
});

test('captures lnkd.in and first-landing UTM values', () => {
  const acquisition = captureAxAcquisition(
    'https://www.corca.ai/en/ax?utm_source=linkedin&utm_medium=social&utm_campaign=ax',
    'https://lnkd.in/example',
  );

  assert.deepEqual(acquisition, {
    initial_referrer_host: 'lnkd.in',
    landing_path: '/en/ax',
    utm: { campaign: 'ax', medium: 'social', source: 'linkedin' },
  });
});

test('ignores same-origin referrers', () => {
  const acquisition = captureAxAcquisition('https://www.corca.ai/ax', 'https://www.corca.ai/about');

  assert.equal(acquisition.initial_referrer_host, '');
});

test('keeps the first Corca landing throughout the tab session', () => {
  const storage = new MemoryStorage();
  const first = readOrCaptureAxAcquisition(
    storage,
    'https://www.corca.ai/?utm_source=newsletter',
    'https://www.linkedin.com/feed/',
  );
  const later = readOrCaptureAxAcquisition(
    storage,
    'https://www.corca.ai/ax',
    'https://www.corca.ai/',
  );

  assert.deepEqual(later, first);
  assert.equal(later.landing_path, '/');
  assert.equal(later.initial_referrer_host, 'www.linkedin.com');
  assert.equal(later.utm.source, 'newsletter');
  assert.ok(storage.getItem(AX_ACQUISITION_STORAGE_KEY));
});

test('falls back to the current capture when stored state is malformed', () => {
  const storage = new MemoryStorage();
  storage.setItem(AX_ACQUISITION_STORAGE_KEY, '{"landing_path":42}');

  const acquisition = readOrCaptureAxAcquisition(storage, 'https://www.corca.ai/ja/ax', '');

  assert.deepEqual(acquisition, {
    initial_referrer_host: '',
    landing_path: '/ja/ax',
    utm: {},
  });
});

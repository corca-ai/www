export const AX_ACQUISITION_STORAGE_KEY = 'corca:ax-acquisition:v1';

const axUtmKeys = ['source', 'medium', 'campaign', 'term', 'content'] as const;

type AxUtmKey = (typeof axUtmKeys)[number];
type AxUtm = Partial<Record<AxUtmKey, string>>;

export interface AxAcquisition {
  initial_referrer_host: string;
  landing_path: string;
  utm: AxUtm;
}

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function captureAxAcquisition(currentUrl: string, referrer: string): AxAcquisition {
  const current = new URL(currentUrl);
  let initialReferrerHost = '';

  if (referrer) {
    try {
      const previous = new URL(referrer);
      if (
        (previous.protocol === 'http:' || previous.protocol === 'https:') &&
        previous.origin !== current.origin
      ) {
        initialReferrerHost = previous.hostname.toLowerCase();
      }
    } catch {
      // An invalid or privacy-stripped referrer is treated as direct traffic.
    }
  }

  const utm = Object.fromEntries(
    axUtmKeys
      .map((key) => [key, current.searchParams.get(`utm_${key}`)?.trim()] as const)
      .filter((entry): entry is readonly [AxUtmKey, string] => Boolean(entry[1])),
  );

  return {
    initial_referrer_host: initialReferrerHost,
    landing_path: current.pathname || '/',
    utm,
  };
}

export function readOrCaptureAxAcquisition(
  storage: SessionStorageLike | undefined,
  currentUrl: string,
  referrer: string,
): AxAcquisition {
  if (storage) {
    try {
      const stored = parseStoredAcquisition(storage.getItem(AX_ACQUISITION_STORAGE_KEY));
      if (stored) return stored;
    } catch {
      // Continue with an in-memory capture when session storage is unavailable.
    }
  }

  const acquisition = captureAxAcquisition(currentUrl, referrer);
  if (storage) {
    try {
      storage.setItem(AX_ACQUISITION_STORAGE_KEY, JSON.stringify(acquisition));
    } catch {
      // The current-page capture still supports submission when storage is blocked.
    }
  }
  return acquisition;
}

function parseStoredAcquisition(value: string | null): AxAcquisition | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AxAcquisition>;
    if (
      typeof parsed.initial_referrer_host !== 'string' ||
      typeof parsed.landing_path !== 'string' ||
      !parsed.utm ||
      typeof parsed.utm !== 'object' ||
      Array.isArray(parsed.utm)
    ) {
      return null;
    }

    const utm: AxUtm = {};
    for (const key of axUtmKeys) {
      const entry = parsed.utm[key];
      if (typeof entry === 'string' && entry) utm[key] = entry;
    }

    return {
      initial_referrer_host: parsed.initial_referrer_host,
      landing_path: parsed.landing_path,
      utm,
    };
  } catch {
    return null;
  }
}

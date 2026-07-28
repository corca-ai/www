export type Gtag = (...args: unknown[]) => void;

export function emitGtagEvent(
  gtag: Gtag | undefined,
  event: string,
  parameters: Record<string, unknown> = {},
) {
  gtag?.('event', event, parameters);
}

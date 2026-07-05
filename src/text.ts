/**
 * Turn authored `\n` line breaks into `<br>` for use with Astro's `set:html`.
 * Input is always our own translation strings, so the markup is trusted.
 */
export const br = (s: string): string => s.replace(/\n/g, '<br />');

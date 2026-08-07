const localizedAxPath = /^\/(?:(?:en|ja|zh)\/)?ax(?:\/|$)/u;

/**
 * Returns true only for public AX routes. The legacy `/ax-backup` page uses
 * `basePath="/ax"` for canonical metadata, so route ownership must be decided
 * from the rendered pathname rather than `basePath` alone.
 */
export function isAxFamilyPath(pathname: string) {
  return localizedAxPath.test(pathname);
}

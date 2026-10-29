//  hidden.mjs - package paths that never appear on a public docs surface (catalog, pages, nav, search, llms.txt, sitemap).
//  The sync scripts drop these before data/*.json is written, so no generator downstream can list them.
export const HIDDEN_PATH_PREFIXES = ["Core/LocalAI"];
export const isHiddenPath = (path) => HIDDEN_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

//  Legacy (V3) page paths under these prefixes are not ported, listed or mapped (the V3 Local AI beta was withdrawn).
export const HIDDEN_LEGACY_PREFIXES = ["/local-intelligence"];
export const isHiddenLegacy = (path) => HIDDEN_LEGACY_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

/** Local transport enumerates its callback keys, converting a null viewer ID to "null". */
export function normalizeViewerID(playerID: string | null | undefined): string | undefined {
  return !playerID || playerID === 'null' || playerID === 'undefined' ? undefined : playerID;
}

export const CARD_TYPE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const FILE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:png|jpe?g|webp)$/i;
export const MAX_SLOTS = 128;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MANIFEST_PATH = 'src/client/data/card-artwork-map.json';
export const CARD_PREFIX = 'public/assets/cards/';

export function validType(name) { return typeof name === 'string' && CARD_TYPE_PATTERN.test(name); }
export function validFilename(name) {
  return typeof name === 'string' && FILE_PATTERN.test(name) &&
    !name.includes('..') && name.length <= 110;
}
export function validSlotCount(n) { return Number.isInteger(n) && n >= 1 && n <= MAX_SLOTS; }

export function distributeEvenly(files, count, rng = Math.random) {
  if (!validSlotCount(count) || !files.length) throw new Error('Cần ít nhất một ảnh và số ô hợp lệ.');
  const slots = Array.from({ length: count }, (_, i) => files[i % files.length]);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

export function distributeByCounts(counts, expected) {
  if (!validSlotCount(expected)) throw new Error('Số ô phải từ 1 đến 128.');
  const slots = [];
  for (const [filename, count] of Object.entries(counts)) {
    if (!validFilename(filename) || !Number.isInteger(count) || count < 0 || count > expected)
      throw new Error('Tên file hoặc tần suất không hợp lệ.');
    for (let i = 0; i < count; i++) slots.push(filename);
  }
  if (slots.length !== expected) throw new Error(`Tổng số lần (${slots.length}) phải bằng số lá (${expected}).`);
  return slots;
}

export function validateSlots(slots, filenames) {
  if (!Array.isArray(slots) || !validSlotCount(slots.length))
    throw new Error('Số lá phải từ 1 đến 128.');
  const available = new Set(filenames);
  if (slots.some(file => !validFilename(file) || !available.has(file)))
    throw new Error('Có ô bài đang tham chiếu ảnh không tồn tại.');
  return true;
}

export function validateImageBytes(bytes, fileName) {
  if (!validFilename(fileName) || !bytes || bytes.length === 0 || bytes.length > MAX_FILE_BYTES) return false;
  const png = bytes.length > 8 && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b);
  const jpg = bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length > 12 && [82,73,70,70].every((b,i) => bytes[i] === b) &&
    [87,69,66,80].every((b,i) => bytes[i + 8] === b);
  const lower = fileName.toLowerCase();
  return lower.endsWith('.png') ? png : /\.jpe?g$/.test(lower) ? jpg : webp;
}

export function validateManifest(data) {
  if (!data || data.schemaVersion !== 1 || typeof data.cards !== 'object' ||
    Array.isArray(data.cards) || !data.cards) throw new Error('Manifest không đúng cấu trúc.');
  for (const [name, entry] of Object.entries(data.cards)) {
    if (!validType(name) || !entry || typeof entry.revision !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,64}$/.test(entry.revision) ||
      !Array.isArray(entry.slots) || !validSlotCount(entry.slots.length) ||
      entry.slots.some(x => !validFilename(x))) throw new Error('Manifest chứa mục không hợp lệ: ' + name);
  }
  return data;
}

/**
 * The game allocates an independent artworkSlot for every physical copy it creates.
 * Repeating the configured slots is intentional when a particular game mode uses
 * more physical copies than the configured distribution cycle.
 */
export function expandArtworkSlots(slots, physicalCount) {
  if (!Array.isArray(slots) || slots.length === 0 || !validSlotCount(physicalCount) ||
      slots.some(name => !validFilename(name))) throw new Error('Chu kỳ artwork hoặc số lá không hợp lệ.');
  return Array.from({ length: physicalCount }, (_, index) => slots[index % slots.length]);
}

export function summarizeChanges(originalFiles, workingFiles, dirtyTypes) {
  const changes = [];
  for (const type of dirtyTypes) {
    if (!validType(type)) throw new Error('Loại bài không hợp lệ.');
    const originals = new Map((originalFiles.get(type) || []).map(file => [file.name, file.sha]));
    const current = workingFiles.get(type) || [];
    const remaining = new Set();
    for (const file of current) {
      const previous = originals.get(file.name);
      remaining.add(file.name);
      if (!previous) changes.push({ type, file: file.name, kind: 'add' });
      else if (file.bytes) changes.push({ type, file: file.name, kind: 'replace' });
    }
    for (const oldName of originals.keys()) {
      if (!remaining.has(oldName)) changes.push({ type, file: oldName, kind: 'delete' });
    }
    changes.push({ type, kind: 'mapping' });
  }
  return changes;
}

/** Allow only artwork paths and a separately validated manifest blob in a restore commit. */
export function buildArtworkRestoreEntries(current, historical, manifestSha) {
  if (!(current instanceof Map) || !(historical instanceof Map) ||
      !/^[0-9a-f]{40}$/i.test(manifestSha)) throw new Error('Git object không hợp lệ.');
  const pathPattern = /^public\/assets\/cards\/([a-z0-9_]+)\/([a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g|webp))$/i;
  for (const map of [current, historical]) for (const [path, sha] of map) {
    if (!pathPattern.test(path) || !/^[0-9a-f]{40}$/i.test(sha))
      throw new Error('Đường dẫn artwork hoặc SHA không hợp lệ.');
  }
  const entries = [];
  for (const [path, sha] of historical)
    if (current.get(path) !== sha) entries.push({ path, mode: '100644', type: 'blob', sha });
  for (const path of current.keys())
    if (!historical.has(path)) entries.push({ path, mode: '100644', type: 'blob', sha: null });
  entries.push({ path: MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestSha });
  return entries;
}

import {
  CARD_PREFIX, MANIFEST_PATH, validType, validFilename, validSlotCount,
  validateSlots, distributeEvenly, distributeByCounts, validateImageBytes, validateManifest,
  expandArtworkSlots, summarizeChanges
} from './core.mjs';

const OWNER = 'hyu276';
const REPO = 'Hyu-Fangame.Massive-Exploding-Kittens';
const BRANCH = 'main';
const API = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
const RAW = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + BRANCH + '/';

const $ = id => document.getElementById(id);
const state = {
  token: '', head: '', baseTree: '', manifest: { schemaVersion: 1, cards: {} },
  original: new Map(), working: new Map(), slots: new Map(), desired: new Map(),
  weights: new Map(), samples: new Map(), dirty: new Set(), selected: null, saving: false
};
const previews = new Set();

function node(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}
function notice(message, error = false) {
  $('notice').textContent = message;
  $('notice').dataset.kind = error ? 'error' : 'success';
}
function addButton(parent, label, callback, className = '') {
  const button = node('button', className, label);
  button.type = 'button';
  button.addEventListener('click', callback);
  parent.append(button);
  return button;
}
function filesOf(type) { return state.working.get(type) || []; }
function slotsOf(type) { return state.slots.get(type) || []; }
function namesOf(type) { return filesOf(type).map(file => file.name); }
function markDirty(type) { state.dirty.add(type); updateSummary(); }
function filePath(type, name) { return CARD_PREFIX + type + '/' + name; }
function imageUrl(type, file) {
  if (file.preview) return file.preview;
  return RAW + filePath(type, file.originalName || file.name).split('/').map(encodeURIComponent).join('/');
}
function cleanupPreviews() {
  for (const url of previews) URL.revokeObjectURL(url);
  previews.clear();
}
async function request(path, { method = 'GET', body, token = state.token } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(API + path, {
    method, headers, cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) {
    const reason = response.status === 401 ? 'Token không hợp lệ.'
      : response.status === 403 ? 'Không có quyền, bị giới hạn API hoặc branch protection đã từ chối.'
      : response.status === 409 || response.status === 422 ? 'Xung đột phiên bản hoặc thao tác bị GitHub từ chối.'
      : 'GitHub API trả về mã ' + response.status + '.';
    throw new Error(reason);
  }
  return response.json();
}
async function loadRepo() {
  $('reload').disabled = true;
  notice('Đang đọc dữ liệu trên GitHub...');
  try {
    const ref = await request('/git/ref/heads/' + BRANCH);
    const head = ref.object.sha;
    const tree = await request('/git/trees/' + head + '?recursive=1');
    if (tree.truncated) throw new Error('GitHub trả về danh sách file chưa đầy đủ, không cho phép sửa.');
    let manifest;
    try {
      const result = await request('/contents/' + MANIFEST_PATH + '?ref=' + BRANCH);
      const binary = atob(result.content.replace(/\s/g, ''));
      manifest = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
      validateManifest(manifest);
    } catch (error) {
      if (error.message.includes('404')) manifest = { schemaVersion: 1, cards: {} };
      else throw error;
    }
    cleanupPreviews();
    state.head = head;
    state.baseTree = tree.sha;
    state.manifest = manifest;
    state.original = new Map();
    state.working = new Map();
    state.slots = new Map();
    state.desired = new Map();
    state.weights = new Map();
    state.samples = new Map();
    state.dirty.clear();
    for (const item of tree.tree) {
      if (item.type !== 'blob') continue;
      const match = /^public\/assets\/cards\/([a-z0-9_]+)\/([a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:png|jpe?g|webp))$/i.exec(item.path);
      if (!match || !validType(match[1]) || !validFilename(match[2])) continue;
      const [, type, filename] = match;
      state.original.set(item.path, item.sha);
      if (!state.working.has(type)) state.working.set(type, []);
      state.working.get(type).push({ name: filename, originalName: filename, sha: item.sha });
    }
    for (const type of Object.keys(manifest.cards)) {
      if (!state.working.has(type)) state.working.set(type, []);
    }
    for (const [type, items] of state.working) {
      items.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
      const assigned = manifest.cards[type]?.slots;
      const slots = assigned ? [...assigned] : items.map(file => file.name).slice(0, 128);
      state.slots.set(type, slots);
      state.desired.set(type, Math.max(1, slots.length));
    }
    if (!state.working.has(state.selected)) state.selected = state.working.keys().next().value || null;
    $('revision').textContent = head.slice(0, 8);
    notice('Đã nạp dữ liệu từ nhánh main. Chưa có thay đổi nào được ghi.');
    render();
  } catch (error) { notice(error.message, true); }
  finally { $('reload').disabled = false; }
}
function updateSummary() {
  $('changedCount').textContent = String(state.dirty.size);
  $('save').disabled = !state.token || !state.dirty.size || state.saving;
  $('connection').textContent = state.token ? 'Đã nhập token' : 'Chế độ xem';
  $('connection').dataset.connected = state.token ? 'true' : 'false';
}
function renderTypes() {
  const list = $('typeList');
  list.replaceChildren();
  const term = $('search').value.trim().toLowerCase();
  for (const type of [...state.working.keys()].sort()) {
    if (!type.includes(term)) continue;
    const count = filesOf(type).length;
    const selected = type === state.selected;
    const button = node('button', 'type-item' + (selected ? ' active' : ''));
    button.type = 'button';
    button.append(node('strong', '', type.replaceAll('_', ' ')));
    button.append(node('span', '', count + ' artwork · ' + (state.desired.get(type) || 0) + ' ô'));
    if (state.dirty.has(type)) button.append(node('i', '', '●'));
    button.addEventListener('click', () => {
      state.selected = type; render();
    });
    list.append(button);
  }
  if (!list.childElementCount) list.append(node('p', 'muted', 'Không có loại bài phù hợp.'));
}
function renderCards() {
  const type = state.selected;
  const panel = $('workspace');
  panel.replaceChildren();
  if (!type) {
    panel.append(node('p', 'empty', 'Chọn một loại bài ở cột bên trái hoặc tạo loại mới.'));
    return;
  }
  const items = filesOf(type);
  const slots = slotsOf(type);
  const count = state.desired.get(type) || 1;
  const intro = node('div', 'workspace-heading');
  const text = node('div');
  text.append(node('div', 'eyebrow', 'BỘ TRANH / ' + type.toUpperCase()));
  text.append(node('h2', '', type.replaceAll('_', ' ')));
  text.append(node('p', 'muted', 'Mỗi ô tương ứng một lần xuất hiện. Có thể dùng lại một artwork nhiều lần.'));
  intro.append(text);
  const slotBox = node('label', 'slot-count');
  slotBox.append(node('span', '', 'SỐ LÁ CẦN PHÂN BỔ'));
  const number = document.createElement('input');
  number.type = 'number'; number.min = '1'; number.max = '128'; number.step = '1';
  number.value = String(count); number.setAttribute('aria-label', 'Số ô bài');
  number.addEventListener('change', () => {
    const next = Number(number.value);
    if (!validSlotCount(next)) { notice('Số lá phải từ 1 đến 128.', true); number.value = String(count); return; }
    state.desired.set(type, next);
    state.weights.delete(type);
    const names = namesOf(type);
    if (names.length) {
      const updated = Array.from({ length: next }, (_, i) => slots[i] && names.includes(slots[i])
        ? slots[i] : names[i % names.length]);
      state.slots.set(type, updated);
    }
    markDirty(type); render();
  });
  slotBox.append(number); intro.append(slotBox); panel.append(intro);

  const toolbar = node('div', 'toolbar');
  addButton(toolbar, '↻ Phân bổ ngẫu nhiên', () => {
    if (!items.length) return notice('Hãy tải ảnh trước khi phân bổ.', true);
    state.slots.set(type, distributeEvenly(namesOf(type), state.desired.get(type)));
    state.weights.delete(type);
    markDirty(type); render();
  }, 'button gold');
  addButton(toolbar, '✓ Áp dụng số lần', () => {
    const counts = state.weights.get(type) || Object.fromEntries(items.map(item => [
      item.name, slots.filter(name => name === item.name).length
    ]));
    try {
      state.slots.set(type, distributeByCounts(counts, state.desired.get(type)));
      state.weights.delete(type);
      markDirty(type); render();
    } catch (error) { notice(error.message, true); }
  }, 'button secondary');
  const upload = document.createElement('input');
  upload.type = 'file'; upload.accept = 'image/png,image/jpeg,image/webp';
  upload.multiple = true; upload.className = 'sr-only';
  upload.addEventListener('change', async () => {
    await addUploads(type, [...upload.files]);
    upload.value = '';
  });
  toolbar.append(upload);
  addButton(toolbar, '+ Tải artwork', () => upload.click(), 'button outline');
  panel.append(toolbar);

  const header = node('div', 'section-heading');
  header.append(node('h3', '', 'Thư viện artwork'));
  header.append(node('span', 'muted', items.length + ' file trong loại bài'));
  panel.append(header);
  const gallery = node('div', 'art-grid');
  if (!items.length) gallery.append(node('p', 'muted', 'Chưa có ảnh. Tải ảnh PNG, JPG hoặc WebP để bắt đầu.'));
  for (const item of items) {
    const card = node('article', 'art-card');
    const thumbnail = document.createElement('img');
    thumbnail.src = imageUrl(type, item);
    thumbnail.alt = 'Artwork ' + item.name; thumbnail.loading = 'lazy';
    card.append(thumbnail);
    card.append(node('div', 'art-name', item.name));
    const row = node('div', 'repeat-row');
    row.append(node('label', '', 'Số lần'));
    const input = document.createElement('input');
    input.type = 'number'; input.min = '0'; input.max = String(count); input.step = '1';
    const localWeights = state.weights.get(type);
    input.value = String(localWeights?.[item.name] ?? slots.filter(name => name === item.name).length);
    input.setAttribute('aria-label', 'Số lần xuất hiện của ' + item.name);
    input.addEventListener('change', () => {
      const draft = state.weights.get(type) || Object.fromEntries(items.map(file => [
        file.name, slots.filter(name => name === file.name).length
      ]));
      draft[item.name] = Number(input.value);
      state.weights.set(type, draft);
      const sum = Object.values(draft).reduce((a, b) => a + b, 0);
      $('weightStatus').textContent = 'Tổng đã chọn: ' + sum + '/' + count;
    });
    row.append(input); card.append(row);
    const actions = node('div', 'art-actions');
    addButton(actions, 'Đổi tên', () => renameImage(type, item), 'mini');
    const replace = document.createElement('input'); replace.type = 'file';
    replace.accept = 'image/png,image/jpeg,image/webp'; replace.className = 'sr-only';
    replace.addEventListener('change', async () => {
      if (replace.files[0]) await replaceImage(type, item, replace.files[0]);
      replace.value = '';
    });
    actions.append(replace);
    addButton(actions, 'Thay ảnh', () => replace.click(), 'mini');
    addButton(actions, 'Xóa', () => removeImage(type, item), 'mini danger');
    card.append(actions); gallery.append(card);
  }
  panel.append(gallery);

  const allocationHeading = node('div', 'section-heading');
  allocationHeading.append(node('h3', '', 'Bảng phân bổ theo ô'));
  allocationHeading.append(node('span', 'muted', 'Có thể chỉ định từng vị trí'));
  panel.append(allocationHeading);
  const grid = node('div', 'slot-grid');
  if (items.length) for (let i = 0; i < count; i++) {
    const row = node('label', 'slot-item');
    row.append(node('span', '', '#' + String(i + 1).padStart(2, '0')));
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Artwork cho lá thứ ' + (i + 1));
    for (const file of items) {
      const option = document.createElement('option');
      option.value = file.name; option.textContent = file.name;
      select.append(option);
    }
    select.value = slots[i] && namesOf(type).includes(slots[i]) ? slots[i] : items[0].name;
    select.addEventListener('change', () => {
      const next = [...slotsOf(type)];
      next[i] = select.value;
      state.slots.set(type, next);
      state.weights.delete(type); markDirty(type); render();
    });
    row.append(select); grid.append(row);
  }
  panel.append(grid);
  if (items.length && slots.length) {
    const sample = node('section', 'sample-section');
    sample.append(node('h3', '', 'Mô phỏng số lá thực tế'));
    sample.append(node('p', 'muted',
      'Mỗi chế độ chơi có thể tạo số bản sao khác nhau. Số ô trên chỉ là CHU KỲ artwork. Nếu số lá thực tế nhiều hơn, game lặp lại chu kỳ, không giữ nguyên tổng số lần hiển thị của từng ảnh.'));
    const label = node('label', 'sample-label');
    label.append(node('span', '', 'Số lá trong trận muốn kiểm tra'));
    const input = document.createElement('input');
    input.type = 'number'; input.min = '1'; input.max = '128'; input.step = '1';
    const physicalCount = state.samples.get(type) || count;
    input.value = String(physicalCount);
    input.addEventListener('change', () => {
      const n = Number(input.value);
      if (!validSlotCount(n)) { notice('Số bản sao cần từ 1 đến 128.', true); input.value = String(physicalCount); return; }
      state.samples.set(type, n); render();
    });
    label.append(input); sample.append(label);
    const actual = expandArtworkSlots(slots, physicalCount);
    const frequencies = Object.entries(actual.reduce((result, file) => {
      result[file] = (result[file] || 0) + 1;
      return result;
    }, {}));
    sample.append(node('p', 'sample-summary',
      frequencies.map(([name, total]) => name + ': ' + total).join(' · ')));
    const visual = node('div', 'sample-visual');
    actual.forEach((file, index) => {
      const tile = node('div', 'sample-tile');
      const image = document.createElement('img');
      const item = items.find(item => item.name === file);
      image.src = item ? imageUrl(type, item) : '';
      image.alt = 'Bản sao ' + (index + 1) + ': ' + file;
      image.loading = 'lazy';
      tile.append(image, node('span', '', '#' + (index + 1)));
      visual.append(tile);
    });
    sample.append(visual); panel.append(sample);
  }
  $('weightStatus').textContent = 'Tổng đang áp dụng: ' + slots.length + '/' + count;
}
function render() { renderTypes(); renderCards(); updateSummary(); }

async function readImage(file, asName) {
  if (file.size > 8 * 1024 * 1024) throw new Error('Mỗi ảnh phải tối đa 8 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validateImageBytes(bytes, asName)) throw new Error('Ảnh phải là PNG, JPG hoặc WebP hợp lệ (đuôi file phải trùng định dạng).');
  const preview = URL.createObjectURL(file); previews.add(preview);
  return { bytes, preview };
}
async function addUploads(type, inputFiles) {
  const working = filesOf(type);
  let added = 0;
  for (const file of inputFiles) {
    let name = file.name;
    if (!validFilename(name) || working.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      name = window.prompt('Tên file hợp lệ, không trùng (ví dụ artwork-7.png):', name);
    }
    if (!name) continue;
    if (!validFilename(name) || working.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      notice('Tên ảnh không hợp lệ hoặc đã tồn tại: ' + name, true); continue;
    }
    try {
      const { bytes, preview } = await readImage(file, name);
      working.push({ name, bytes, preview }); added++;
    } catch (error) { notice(error.message, true); }
  }
  if (added) {
    state.working.set(type, working);
    const current = slotsOf(type);
    if (!current.length) {
      const desired = state.desired.get(type) || Math.max(1, working.length);
      state.slots.set(type, distributeEvenly(namesOf(type), desired));
    }
    state.weights.delete(type); markDirty(type); render();
    notice('Đã đưa ' + added + ' ảnh vào bản nháp. Nhấn Lưu lên GitHub để ghi thật.');
  }
}
async function replaceImage(type, item, file) {
  try {
    const { bytes, preview } = await readImage(file, item.name);
    item.bytes = bytes; item.preview = preview;
    markDirty(type); render();
  } catch (error) { notice(error.message, true); }
}
function renameImage(type, item) {
  const name = window.prompt('Tên file mới (giữ nguyên phần mở rộng):', item.name);
  if (!name || name === item.name) return;
  if (!validFilename(name) || name.split('.').pop().toLowerCase() !== item.name.split('.').pop().toLowerCase() ||
    filesOf(type).some(other => other !== item && other.name.toLowerCase() === name.toLowerCase()))
    return notice('Tên không hợp lệ, bị trùng hoặc đổi định dạng file.', true);
  const previous = item.name;
  item.name = name;
  state.slots.set(type, slotsOf(type).map(slot => slot === previous ? name : slot));
  state.weights.delete(type); markDirty(type); render();
}
function removeImage(type, item) {
  const existing = filesOf(type);
  if (existing.length < 2) return notice('Không được xóa artwork cuối cùng của một loại bài.', true);
  if (!window.confirm('Xóa ' + item.name + ' khỏi repo khi lưu?')) return;
  const survivors = existing.filter(x => x !== item);
  state.working.set(type, survivors);
  state.slots.set(type, slotsOf(type).map(s => s === item.name ? survivors[0].name : s));
  state.weights.delete(type); markDirty(type); render();
}
function bytesToBase64(bytes) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 16384) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 16384)));
  }
  return btoa(chunks.join(''));
}
function originalByType() {
  const previous = new Map();
  for (const [path, sha] of state.original) {
    const match = /^public\/assets\/cards\/([a-z0-9_]+)\/(.+)$/.exec(path);
    if (!match) continue;
    if (!previous.has(match[1])) previous.set(match[1], []);
    previous.get(match[1]).push({ name: match[2], sha });
  }
  return previous;
}

/** Explicit, reviewable commit gate, with accurate filenames and all selected slots. */
async function reviewBeforeCommit() {
  const dialog = document.createElement('dialog');
  dialog.className = 'save-review';
  dialog.setAttribute('aria-label', 'Xem trước commit artwork');
  const heading = node('h2', '', 'Xem trước thay đổi trước khi commit');
  const warning = node('p', 'review-warning',
    'Nhánh đích: main. Nhấn xác nhận sẽ ghi trực tiếp vào repository và có thể kích hoạt Netlify build lại GAME.');
  dialog.append(heading, warning);
  const changes = summarizeChanges(originalByType(), state.working, state.dirty);
  const changeList = node('ul', 'review-change-list');
  const kindLabel = { add: 'Thêm ảnh', replace: 'Thay ảnh', delete: 'Xóa ảnh', mapping: 'Cập nhật phân bổ' };
  for (const change of changes) {
    changeList.append(node('li', '', (kindLabel[change.kind] || change.kind) +
      ': ' + change.type + (change.file ? '/' + change.file : '')));
  }
  dialog.append(changeList);
  for (const type of state.dirty) {
    const cardList = node('section', 'review-slots');
    const assigned = slotsOf(type);
    cardList.append(node('h3', '', type + ' · ' + assigned.length + ' vị trí'));
    const grid = node('div', 'review-grid');
    assigned.forEach((name, index) => {
      const item = filesOf(type).find(file => file.name === name);
      const entry = node('div', 'review-entry');
      const image = document.createElement('img');
      image.src = item ? imageUrl(type, item) : '';
      image.alt = name; image.loading = 'lazy';
      entry.append(image, node('span', '', '#' + (index + 1) + ' ' + name));
      grid.append(entry);
    });
    cardList.append(grid); dialog.append(cardList);
  }
  const footer = node('div', 'review-actions');
  addButton(footer, 'Quay lại chỉnh sửa', () => dialog.close('cancel'), 'button outline');
  addButton(footer, 'Xác nhận commit lên main', () => dialog.close('confirm'), 'button gold');
  dialog.append(footer); document.body.append(dialog);
  try {
    return await new Promise(resolve => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
      dialog.showModal();
    });
  } finally { dialog.remove(); }
}

async function saveAll() {
  if (!state.token || !state.dirty.size || state.saving) return;
  try {
    for (const type of state.dirty) {
      if (!filesOf(type).length) throw new Error(type + ': không còn ảnh nào.');
      if (state.weights.has(type)) throw new Error(type + ': có số lần xuất hiện chưa áp dụng. Nhấn Áp dụng số lần.');
      validateSlots(slotsOf(type), namesOf(type));
      if (slotsOf(type).length !== state.desired.get(type))
        throw new Error(type + ': số ô bài chưa khớp số lá cần phân bổ.');
    }
  } catch (error) { return notice(error.message, true); }
  if (!await reviewBeforeCommit()) return;
  state.saving = true; updateSummary();
  try {
    notice('Đang kiểm tra HEAD trên GitHub...');
    const latest = await request('/git/ref/heads/' + BRANCH);
    if (latest.object.sha !== state.head) throw new Error('Nhánh main đã thay đổi. Hãy nạp lại trước khi lưu để tránh ghi đè.');
    const nextManifest = structuredClone(state.manifest);
    const entries = [];
    const present = new Set();
    for (const [type, files] of state.working) for (const file of files) {
      const path = filePath(type, file.name);
      present.add(path);
      if (file.bytes) {
        notice('Đang gửi artwork ' + file.name + '...');
        const blob = await request('/git/blobs', {
          method: 'POST', body: { content: bytesToBase64(file.bytes), encoding: 'base64' }
        });
        entries.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
      } else if (state.original.get(path) !== file.sha) {
        entries.push({ path, mode: '100644', type: 'blob', sha: file.sha });
      }
    }
    for (const path of state.original.keys()) {
      if (!present.has(path)) entries.push({ path, mode: '100644', type: 'blob', sha: null });
    }
    for (const type of state.dirty) {
      nextManifest.cards[type] = {
        slots: [...slotsOf(type)],
        revision: Date.now().toString(36) + '-' + crypto.randomUUID().slice(0, 8)
      };
    }
    validateManifest(nextManifest);
    const manifestBlob = await request('/git/blobs', {
      method: 'POST', body: { content: JSON.stringify(nextManifest, null, 2) + '\n', encoding: 'utf-8' }
    });
    entries.push({ path: MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestBlob.sha });
    notice('Đang tạo một commit duy nhất...');
    const tree = await request('/git/trees', {
      method: 'POST', body: { base_tree: state.baseTree, tree: entries }
    });
    const commit = await request('/git/commits', {
      method: 'POST', body: {
        message: 'chore(cards): Update card artwork and allocation',
        tree: tree.sha, parents: [state.head]
      }
    });
    await request('/git/refs/heads/' + BRANCH, {
      method: 'PATCH', body: { sha: commit.sha, force: false }
    });
    state.head = commit.sha;
    await loadRepo();
    notice('Đã commit ' + commit.sha.slice(0, 8) + ' lên main. Netlify sẽ tải bản mới sau khi build/deploy của game chạy.');
  } catch (error) { notice(error.message, true); }
  finally { state.saving = false; updateSummary(); }
}
$('connect').addEventListener('click', async () => {
  const value = $('token').value.trim();
  if (!value) return notice('Nhập fine-grained token trước.', true);
  state.token = value;
  $('token').value = '';
  try {
    const repo = await request('');
    if (repo.full_name !== OWNER + '/' + REPO) throw new Error('Token không truy cập đúng repository.');
    notice('Đã xác thực quyền đọc. Để lưu cần Contents: Read and write.');
    await loadRepo();
  } catch (error) {
    state.token = ''; notice(error.message, true);
  }
  updateSummary();
});
$('disconnect').addEventListener('click', () => {
  state.token = ''; $('token').value = '';
  notice('Đã xóa token khỏi bộ nhớ trang.'); updateSummary();
});
$('reload').addEventListener('click', async () => {
  if (state.dirty.size && !window.confirm('Bỏ toàn bộ bản nháp chưa lưu và nạp lại?')) return;
  await loadRepo();
});
$('search').addEventListener('input', renderTypes);
$('newType').addEventListener('click', () => {
  const name = $('newTypeName').value.trim().toLowerCase();
  if (!validType(name)) return notice('Tên loại bài chỉ gồm a-z, số, dấu gạch dưới.', true);
  if (!state.working.has(name)) {
    state.working.set(name, []);
    state.slots.set(name, []);
    state.desired.set(name, 1);
  }
  state.selected = name; $('newTypeName').value = ''; render();
});
$('save').addEventListener('click', saveAll);
window.addEventListener('pagehide', () => { state.token = ''; cleanupPreviews(); });
loadRepo();

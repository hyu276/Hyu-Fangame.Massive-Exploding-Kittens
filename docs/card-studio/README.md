# Card Artwork Studio (GitHub Pages only)

The editor is located at `docs/card-studio/index.html` in this repository.

## Hosting boundary

- **Editor site:** GitHub Pages only, URL expected once Pages is enabled from `main /docs`:
  https://hyu276.github.io/Hyu-Fangame.Massive-Exploding-Kittens/card-studio/
- **Never deploy editor to Netlify.** Netlify publishes only Vite's `dist/`; do not copy `docs/card-studio/` into `public/`, `dist/`, a Netlify Function, or any Netlify-specific artifact.
- **Game itself:** published through Netlify. Game artwork stays under `public/assets/cards/<card_type>/` and is intentionally included in the Netlify game build. The artwork manifest is `src/client/data/card-artwork-map.json` and is intentionally bundled by Vite.
- A GitHub Pages site does not become public solely because these files exist. Under **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/docs**, save. If this is not enabled, the URL returns 404.
- The editor is not publicly available until this PR is merged into main and the Pages source is enabled.

## How it works

1. Open the Pages editor. Browsing public card assets requires no credentials.
2. Create a fine-grained personal access token under your GitHub settings. Repository access: **Only selected repositories**, select `hyu276/Hyu-Fangame.Massive-Exploding-Kittens`; Permissions: **Contents → Read and write**. Give the token a short expiration.
3. Paste token, click **Kết nối**. The editor uses it only in page memory and sends it directly to `https://api.github.com`; it never stores it in files, localStorage, sessionStorage, cookies, or URLs.
4. Select a card type. Set the number of visible *art slots* (1–128), upload/edit/delete art, and edit each image's frequency or choose **Phân bổ ngẫu nhiên**. **Áp dụng số lần** requires the total to exactly equal the number of art slots.
5. Review the per-slot assignments. Click **Commit thay đổi lên GitHub** to write files and the mapping in **one commit** to `main`. If main changed since loading, reload and review differences. A branch protection policy may reject direct writes; follow repository policy.
6. A Netlify game build triggered by the new main commit incorporates the updated images and manifest. Image URLs for configured card types include a per-type revision to bypass stale immutable caches.

Example with 6 art slots and 4 available images: give images A/B/C/D frequencies 2/2/1/1 and apply. The mapping is stored as six image filenames. The game issues separate `artworkSlot` values when constructing cards, so six copies do not depend on the fixed gameplay `card.index`.

## Limits and safety

- PNG, JPEG or WebP only; verified by file signature, maximum 8 MiB per artwork. No SVG, HTML or remote arbitrary URLs.
- The final artwork of an existing category cannot be deleted from this UI, avoiding broken image links.
- Game cards with no configured artwork map retain legacy rendering.
- The editor changes visual mappings only. Creating a new artwork category does *not* register a new game card type.
- GitHub Pages is public. **A fine-grained PAT remains a powerful write credential** despite in-memory handling; use least privilege, never share the token, revoke it after use, and use only a trusted browser on the official GitHub Pages URL.
- Large art pushes or protected main branches may be rejected by GitHub.
- The site does not offer a server, account system, or secrecy for art assets committed to a public repository.

## Validation before merge

```bash
npm test
npm run lint
npm run build
npm run build:server
node --test tests/card-studio.test.mjs
```

Manual: enable Pages source only after approval, validate 6:4 distribution, upload/replace/rename/delete, conflict detection, token disconnect, successful GitHub commit, and subsequent Netlify **game** build. No Netlify publish of the editor.

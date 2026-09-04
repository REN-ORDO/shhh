# Tasks: Clue Image Attachments

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250–320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Migration + types + validation helpers | PR 1 | `supabase db reset` | `npx ts-node -e "import './lib/validate'"` | `supabase/migrations/0004_clue_attachments.sql`, `lib/types.ts`, `lib/validate.ts` |
| 2 | Server action + UI + reveal | PR 1 | `npx next build` | Send clue with image via dev server | `lib/actions/clues.ts`, `SendClueForm.tsx`, `reveal/page.tsx`, `next.config.ts` |

## Phase 1: Foundation (Infrastructure & Types)

- [x] 1.1 Create `supabase/migrations/0004_clue_attachments.sql`: `clue_attachments` table (id uuid PK default gen_random_uuid(), clue_id uuid NOT NULL FK references public.clues(id) ON DELETE CASCADE, bucket text, path text, mime_type text, size_bytes bigint, created_at timestamptz default now()), index on `clue_id`, RLS deny-all (ALTER TABLE clue_attachments ENABLE ROW LEVEL SECURITY; CREATE POLICY deny_all ON clue_attachments FOR ALL USING (false) WITH CHECK (false)), `insert into storage.buckets (id, name, public) values ('clue-images', 'clue-images', false) on conflict do nothing`
- [x] 1.2 Add `ClueAttachmentRow` interface to `lib/types.ts`: id, clue_id, bucket, path, mime_type, size_bytes, created_at
- [x] 1.3 Add validation constants and helpers to `lib/validate.ts`: `ALLOWED_IMAGE_MIME` Set, `MAX_ATTACH_BYTES` (5MB), `MAX_ATTACH_COUNT` (5), `isValidImageMime(mime)`, `getExtensionForMime(mime)` mapping jpeg→jpg, png→png, gif→gif, webp→webp

## Phase 2: Core Implementation (Server Action)

- [ ] 2.1 Extend `sendClueAction` in `lib/actions/clues.ts`: extract `File[]` from FormData key `attachments`; server-validate each: MIME in allowlist, size ≤ 5MB, count ≤ 5; reject with FormState error on any failure before inserting clue
- [ ] 2.2 After clue insert, per file: generate attId via `crypto.randomUUID()`, upload to `storage.from('clue-images').upload('{eventId}/{clueId}/{attId}/original.{ext}', file)`, insert `clue_attachments` row; on any failure after clue insert, best-effort `storage.remove` all already-uploaded paths for that clue, return error FormState
- [ ] 2.3 Ensure no sender metadata is written: no sender id in path, no owner metadata, no user column — verify by code review of `sendClueAction`

## Phase 3: UI Integration

- [ ] 3.1 Modify `SendClueForm.tsx`: add `<input type="file" name="attachments" accept="image/jpeg,image/png,image/gif,image/webp" multiple>`, client-side preview thumbnails, count guard (≤5) and per-file size guard (≤5MB) before submit, append files to FormData
- [ ] 3.2 Modify `app/reveal/[accessToken]/page.tsx`: after existing `inboxClues` query, collect all clue IDs, batched query `clue_attachments WHERE clue_id IN (...)`, for each attachment call `supabaseAdmin.storage.from('clue-images').createSignedUrl(path, 3600)`, render images with `<Image>` from `next/image` using signed URL
- [ ] 3.3 Add `images.remotePatterns` to `next.config.ts`: derive Supabase host from `NEXT_PUBLIC_SUPABASE_URL` (parse hostname), add pattern `{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }` and a second pattern for the private bucket's signed URL path

## Phase 4: Verification

- [ ] 4.1 Verify migration: `supabase db reset` succeeds, `clue_attachments` table exists with correct columns, bucket `clue-images` is private, anon role cannot SELECT from `clue_attachments`
- [ ] 4.2 Verify send flow: send clue with 0 images (unchanged behavior), 1 image, 5 images; confirm `clue_attachments` rows created; send with PDF → rejected; send with >5MB → rejected; send with >5 files → rejected
- [ ] 4.3 Verify reveal page: clues with attachments render images via `next/image`; batched query fires once (not per-clue); signed URLs resolve correctly
- [ ] 4.4 Verify anonymity: inspect `clue_attachments` rows and storage paths — no sender id present anywhere; no sender metadata written; bucket has no anon/authenticated storage policies

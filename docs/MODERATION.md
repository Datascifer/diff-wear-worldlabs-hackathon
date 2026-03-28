# Content Moderation

## Philosophy

Diiff is a space for young people. Moderation defaults to protection. When in doubt, content waits for human review rather than being auto-approved.

The moderation system has three layers that work together. No single layer is assumed to be sufficient.

## Three Layers

### Layer 1: Automated Pre-Screening (Perspective API)

When a user submits a post or comment, the content is scored by the Google Perspective API before being inserted into the database.

- If scores exceed the threshold for the content's audience, the content is auto-flagged and queued for human review with `moderation_status = 'pending'`
- If the API is unavailable, the content still enters the queue as `pending` — fail-open means human review, not auto-approval
- Thresholds: see `services/moderation/classifier.ts` for current values

### Layer 2: Human Moderation Queue

All new posts and comments start with `moderation_status = 'pending'`. Staff review the queue via the admin moderation route (`GET /api/admin/moderation`).

Staff can take these actions:
- **Approve** (`moderation_status = 'approved'`) — content becomes visible
- **Remove** (`moderation_status = 'removed'`) — content hidden, user notified
- **Flag** (`moderation_status = 'flagged'`) — escalated, triggers additional review

Users can see their own pending posts (so they know submission worked) but no other user can see pending or removed content.

### Layer 3: Community Reporting

Users can report content they find harmful. Reports create a `moderation_flags` row with `flagged_by = auth.uid()`. Reports are reviewed by staff alongside the automated queue.

## Enforcement Actions

| Action | Effect | Reversible? |
|--------|--------|------------|
| Remove post | `moderation_status = 'removed'` | Yes (staff can re-approve) |
| Remove comment | `moderation_status = 'removed'` | Yes |
| Suspend account | `account_status = 'suspended'` | Yes |
| Ban account | `account_status = 'banned'` | No (requires manual intervention) |

Account-level actions are taken by staff via the Supabase dashboard or a future internal tool. There is no API endpoint for banning users — this is intentional to prevent accidental or unauthorized bans.

## Audit Logging

Every moderation action is recorded in `moderation_flags`. This table is **append-only** — rows can never be deleted. Staff can only update `status`, `resolved_by`, `resolved_at`, and `resolution_note`.

This design ensures:
- A complete, tamper-evident record of every moderation decision
- Ability to audit patterns over time (is a specific user repeatedly flagging others?)
- Legal defensibility if a moderation decision is challenged

## Minor-Specific Rules

Automated screening thresholds are lower for content that is accessible to minors:

- Toxicity threshold: `0.60` (vs. `0.80` for adults-only content)
- Sexual content threshold: `0.50` (auto-flag immediately)
- Self-harm content: `0.70` (auto-flag + staff alert)

Content created by or visible to minors that triggers these lower thresholds is quarantined and cannot be approved without explicit staff action (no bulk-approve shortcuts).

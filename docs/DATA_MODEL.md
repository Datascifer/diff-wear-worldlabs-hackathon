# Data Model

All tables live in the `public` schema in Supabase PostgreSQL. `auth.users` is managed by Supabase Auth and referenced by `public.users`.

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | References auth.users(id) |
| display_name | text | 1–40 chars |
| date_of_birth | date | Used to compute age_tier; never exposed in public APIs |
| age_tier | text | Server-computed: `minor` or `young_adult` |
| city | text | Optional, ≤80 chars |
| state | text | Optional, ≤50 chars |
| bio | text | Optional, ≤200 chars |
| avatar_url | text | Optional |
| auth_provider | text | `google` or `apple` |
| parental_consent_at | timestamptz | NULL until consent granted |
| account_status | text | `active`, `pending_consent`, `suspended`, `banned` |
| is_staff | boolean | Default false; set only via Supabase dashboard |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated by trigger |

### posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| author_id | uuid FK→users | |
| content | text | 1–500 chars |
| post_type | text | `spirit`, `move`, `community`, `wellness` |
| audience | text | `all_ages` or `adults_only` |
| media_url | text | Optional |
| moderation_status | text | `pending`, `approved`, `removed`, `flagged` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### post_reactions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| post_id | uuid FK→posts | |
| user_id | uuid FK→users | |
| reaction_type | text | `like` only at launch |
| created_at | timestamptz | |
| — | — | UNIQUE (post_id, user_id, reaction_type) |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| post_id | uuid FK→posts | |
| author_id | uuid FK→users | |
| content | text | 1–300 chars |
| moderation_status | text | `pending`, `approved`, `removed`, `flagged` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### rooms
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| creator_id | uuid FK→users | |
| title | text | 1–100 chars |
| topic | text | Optional, ≤200 chars |
| room_type | text | `all_ages_moderated` or `adults_only` |
| status | text | `scheduled`, `live`, `closed` |
| opened_at | timestamptz | NULL until opened |
| closed_at | timestamptz | NULL until closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### room_participants
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| room_id | uuid FK→rooms | |
| user_id | uuid FK→users | |
| role | text | `listener`, `speaker`, `moderator` |
| joined_at | timestamptz | |
| left_at | timestamptz | NULL until user leaves |

### room_moderators
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| room_id | uuid FK→rooms | |
| moderator_user_id | uuid FK→users | |
| is_active | boolean | Default true |
| assigned_at | timestamptz | |

### move_plans
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | 1–100 chars |
| description | text | Optional, ≤500 chars |
| plan_type | text | `cardio`, `strength`, `flexibility`, `breathwork` |
| scripture_reference | text | Optional, ≤100 chars |
| duration_minutes | int | Must be > 0 |
| created_at | timestamptz | |

### move_logs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK→users | |
| plan_id | uuid FK→move_plans | |
| completed_at | timestamptz | |
| duration_minutes | int | Optional override |
| created_at | timestamptz | |

### streaks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK→users | |
| streak_type | text | `move` or `devotional` |
| current_count | int | Default 0 |
| longest_count | int | Default 0 |
| last_activity_date | date | NULL until first activity |
| — | — | UNIQUE (user_id, streak_type) |

### badges
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text | Unique identifier |
| name | text | Display name |
| description | text | ≤200 chars |
| icon_url | text | Optional |
| created_at | timestamptz | |

### user_badges
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK→users | |
| badge_id | uuid FK→badges | |
| earned_at | timestamptz | |
| — | — | UNIQUE (user_id, badge_id) |

### moderation_flags
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| content_type | text | `post`, `comment`, `room`, `user` |
| content_id | uuid | References the flagged entity |
| flagged_by | uuid FK→users | NULL for system-generated flags |
| reason | text | ≤500 chars |
| status | text | `pending`, `reviewed`, `actioned`, `dismissed` |
| scores | jsonb | Raw Perspective API scores snapshot |
| resolved_by | uuid FK→users | NULL until resolved |
| resolved_at | timestamptz | NULL until resolved |
| resolution_note | text | Optional, ≤500 chars |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| — | — | **APPEND-ONLY: DELETE is revoked at DB level** |

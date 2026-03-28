# apps/api

This workspace is reserved for a future standalone API service.

At launch, all API logic lives in `apps/web/app/api/` as Next.js Route Handlers.

If the platform grows to require a dedicated API service (e.g., for background job processing, separate scaling, or non-HTTP protocols), it will live here.

No code should be added to this directory without a corresponding ADR in `docs/DECISION_LOG.md`.

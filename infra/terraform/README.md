# infra/terraform

Terraform configuration for Diiff infrastructure.

**Status: Not yet provisioned.**

At launch, infrastructure is managed entirely through the Supabase dashboard and Vercel dashboard. Terraform will be introduced when the team needs:

- Repeatable environment provisioning (staging vs. production parity)
- Infrastructure change review via PR (Terraform plan in CI)
- Secrets management automation

When Terraform is introduced, this directory will contain:

```
infra/terraform/
  main.tf          # Provider config (Supabase, Vercel, Cloudflare)
  variables.tf     # Input variables
  outputs.tf       # Output values (connection strings, etc.)
  environments/
    staging.tfvars
    production.tfvars
```

Do not add Terraform code here without a corresponding entry in `docs/DECISION_LOG.md`.

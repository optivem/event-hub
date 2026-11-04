# GCP Infrastructure with Terraform

This directory contains the Terraform configuration and helper scripts that set up the GCP and Neon infrastructure for event-hub, including:

- **GCP Project** with automatic naming
- **Artifact Registry** for Docker images
- **Workload Identity Federation** for GitHub Actions authentication
- **Secret Manager** for the database credentials and the Keycloak admin password
- **IAM bindings** for GitHub Actions deployment
- **Neon Postgres** project with one database per stack (created by `neonctl`, not Terraform)

## Quick Start

### Prerequisites

- `terraform` CLI (v1.0+) — [Install](https://www.terraform.io/downloads)
- `gcloud` CLI — [Install](https://cloud.google.com/sdk/docs/install)
- `gh` CLI — [Install](https://cli.github.com)
- `neonctl` — pinned by `NEONCTL_VERSION` in [neon.sh](neon.sh); falls back to `npx` if it is not installed
- `jq` and Node.js
- GCP account with active billing and a Neon account

The [dev container](../.devcontainer/README.md) has all of these.

### Setup (Automated)

From the repo root:

```bash
# Step 1: Authenticate
gh auth login
gcloud auth login
neonctl login   # or: export NEON_API_KEY=<key>

# Step 2: Run setup script
./setup-gcp.sh
```

The script will:
1. Check prerequisites
2. Find or create the shared Terraform state project and bucket
3. Initialize Terraform and show a plan
4. Apply it, prompting first if the plan changes or deletes existing resources (`--yes` skips the prompt)
5. Point Application Default Credentials at the new project as their quota project (skipped without ADC)
6. Configure GitHub repository variables
7. Create the Neon project and databases
8. Store the Neon credentials and Keycloak admin password in Secret Manager
9. Report any missing GitHub secrets (`GHCR_TOKEN`, `WORKFLOW_TOKEN`)

### Manual Terraform Usage

If you prefer to manage Terraform directly:

```bash
cd terraform

# Initialize (downloads providers, connects the remote state)
terraform init -backend-config="bucket=<state-project>-tfstate" -backend-config="prefix=owner/repo"

# Plan (shows what will be created)
terraform plan -var="github_repo=owner/repo" -var="billing_account_id=XXXXXX-XXXXXX-XXXXXX"

# Apply (creates resources)
terraform apply -var="github_repo=owner/repo" -var="billing_account_id=XXXXXX-XXXXXX-XXXXXX"

# Get outputs
terraform output
```

## Naming

Every name derives from the GitHub repo, or from the `SYSTEM_NAME` environment variable given to `./setup-gcp.sh`. For `optivem/event-hub`:

| What | Name |
|------|------|
| System name | `event-hub` |
| GCP project | `event-hub-<random 6 hex>` |
| Neon project | `event-hub` |
| Secrets | `event-hub-db`, `event-hub-keycloak-admin-password` |
| Databases | `event_hub_acceptance_real`, `event_hub_acceptance_stub`, `event_hub_qa`, `event_hub_prod`, `event_hub_keycloak` |

Hyphens are valid in GCP names but not in unquoted Postgres identifiers, so database names replace them with underscores. The system name is limited to 14 characters because it prefixes Cloud Run service names, which are limited to 49.

## Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `region` | GCP region | No | `us-central1` |
| `github_repo` | GitHub repo in `owner/repo` format | Yes | `optivem/event-hub` |
| `billing_account_id` | GCP billing account ID | Yes | `01ABCD-EFGHIJ-KLMNOP` |
| `system_name` | Overrides the name derived from the repo (4-14 chars) | No | `event-hub` |

Find your billing account ID:
```bash
gcloud billing accounts list
```

## Outputs

After applying, Terraform outputs:
- `project_id` — GCP project ID
- `region` — GCP region
- `workload_identity_provider` — WIF provider resource name
- `service_account_email` — GitHub Actions service account
- `artifact_registry_repository` — Artifact Registry repository name
- `runtime_service_account_email` — Cloud Run runtime service account
- `system_name` — prefix for Cloud Run services, secrets and databases

`./setup-gcp.sh` copies these to GitHub repository variables: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT` and `SYSTEM_NAME`.

## State

Terraform state lives in GCS, not on your machine, so setup/teardown work from any clone:

- One **state project** per Google account, labelled `purpose=terraform-state` (created on first `./setup-gcp.sh` as `tfstate-<random>`, and shared with any other repo that uses the same scripts on that account). The scripts create it, not Terraform, because it holds Terraform's own state; it also gives `gcloud` a project to run the billing lookup against, so setup works on an account with no projects.
- One versioned bucket in it, `gs://<state-project>-tfstate`; each repo uses prefix `<owner>/<repo>`.
- `state-backend.sh` (sourced by both scripts) finds or creates them and runs `terraform init -backend-config=...`.

## Teardown

Remove the GCP project, the Neon project and the GitHub variables:

```bash
# Automated teardown
./teardown-gcp.sh

# Or manual (GCP only)
cd terraform
terraform destroy -var="github_repo=owner/repo" -var="billing_account_id=XXXXXX-XXXXXX-XXXXXX"
```

The state project is kept.

## Architecture

```
Google Cloud Project
├── Artifact Registry (Docker images, last 10 versions per image)
├── Workload Identity Pool (GitHub OIDC)
│   └── Service Account (github-deployer)
├── Secret Manager (<system>-db, <system>-keycloak-admin-password)
├── Service Account (runtime, Cloud Run runtime identity)
└── IAM Roles
    ├── Cloud Run Admin
    ├── Artifact Registry Writer
    ├── Secret Manager Accessor
    └── Service Account User
```

## Custom domains

Optional. With the GitHub repo variable `CUSTOM_DOMAIN` set (e.g. `techexcellence.io`), each deploy maps prod to `events.<domain>`, QA to `events-qa.<domain>`, the acceptance stacks to `events-acc.<domain>` (stub) and `events-e2e.<domain>` (real), and the shared Keycloak to `auth.<domain>` ([Cloud Run domain mapping](https://cloud.google.com/run/docs/mapping-custom-domains): free, Google-managed TLS, no load balancer). Unset, nothing is mapped. The mapping is done by `.github/scripts/ensure-domain-mapping.sh`, which is idempotent.

One-time setup (`./setup-gcp.sh` prints these with the actual values):

1. Verify the domain in [Google Search Console](https://search.google.com/search-console) (a TXT record at the DNS provider).
2. In [Webmaster Central](https://www.google.com/webmasters/verification), add the deployer service account (`GCP_SERVICE_ACCOUNT`) as an owner of the domain. Without this, the deploy can't create the mappings.
3. `gh variable set CUSTOM_DOMAIN --body <domain>`
4. At the DNS provider, add `CNAME events`, `events-qa`, `events-acc`, `events-e2e` and `auth` → `ghs.googlehosted.com.`. The certificate follows; see [Certificates](#certificates).

After a teardown and setup, only step 2 has to be repeated, because the new project has a new deployer service account. `CUSTOM_DOMAIN`, the Search Console verification and the CNAMEs belong to the domain, not the project, so the teardown keeps them. The CNAMEs point to `ghs.googlehosted.com`, not to the project, so they stay valid after a rebuild.

### Teardown and rebuild

- `./teardown-gcp.sh` deletes the domain mappings **before** it deletes the project. A deleted project stays pending deletion for 30 days, and its mappings keep the hostnames reserved, so the next project's deploy would fail with "already in use elsewhere".
- As a fallback, `ensure-domain-mapping.sh` creates mappings with `--force-override`, which takes a hostname from a mapping in another project (only a verified owner can do this). It also deletes and recreates a mapping that is stuck on `MappingAlreadyExists`, because it was created while another project still held the hostname.
- The first deploy into the new project creates the mappings again.

### Certificates

A new mapping gets its certificate about 15 minutes after the CNAME exists, and at most 24 hours. `ensure-domain-mapping.sh` only warns while the certificate is pending; the deploy then waits up to 30 minutes for each custom domain to answer, because the system tests use it. If a certificate takes longer, re-run the deploy.

### Latency

Domain mapping is a [preview feature](https://cloud.google.com/run/docs/mapping-custom-domains#limitations), and Google says it adds latency. Every service except Keycloak scales to zero, so the first request after idle waits on a backend cold start (about 7–11 s, down from about 20 s with the AppCDS archive and C1-only JIT). Keycloak keeps one warm instance, because its cold start was about 22 s. Both are acceptable at this scale; see `plans/20261102-1953-reduce-cloud-run-cold-start-latency.md`.

If the mapping latency becomes a problem, put one of these in front of the Cloud Run services instead:

- **Firebase Hosting** with [rewrites to Cloud Run](https://firebase.google.com/docs/hosting/cloud-run): free tier, Google-managed certificate.
- **Global external Application Load Balancer** with serverless NEGs and a Google-managed certificate: about $18/month.

Either way, delete the domain mappings and point the DNS records (CNAMEs, or A records for a load balancer IP) to the new target.

## Cost

- **Free tier eligible**: Most resources are free or have generous free quotas
- **Artifact Registry**: 0.5 GB free storage per month
- **Secret Manager**: $0.06/month per active secret version per location; first 6 versions free per billing account (1 secret ≈ $0)
- **Cloud Run**: Free tier includes 180,000 GB-seconds/month

- **Keycloak warm instance**: `min-instances=1` (1 vCPU, 1 GiB) is billed at Cloud Run's idle rate around the clock: about $13/month

**Total estimated cost**: ~$13/month at demo scale (the warm Keycloak; everything else is ~$0)

### Cost guardrails

- **Budget alerts**: create two on the billing account (Billing > Budgets & alerts): €5 and €20 per month, alerting at 50/90/100%.
- **Scale to zero**: every backend and frontend is deployed with `min-instances=0` and small `max-instances`, so their idle cost is ~0. Keycloak is the exception: it is shared by every stack and cold-starts in about 22 s, so it runs with `min-instances=1` (about $13/month). The €5 budget alert will therefore fire every month.
- **Stages**: acceptance runs a real and a stub stack, and QA and prod run one each. Each stack has its own services and database, and they share the one Keycloak.
- **Secret versions**: one shared `<system>-db` JSON secret plus `<system>-keycloak-admin-password`, 2 versions in total; only 6 are free.
- **Reset**: `./teardown-gcp.sh` destroys everything; `./setup-gcp.sh` recreates it.

## Troubleshooting

### Authentication issues
```bash
# Re-authenticate to Google Cloud
gcloud auth login

# Verify authentication
gcloud auth list
```

### Billing account not found
```bash
# List all billing accounts
gcloud billing accounts list
```

If none is listed, set one up at <https://console.cloud.google.com/billing> and re-run `./setup-gcp.sh`.

### State corruption
If Terraform state gets corrupted, refresh:
```bash
terraform refresh
```

Or restore an earlier state: the bucket is versioned, so `gcloud storage ls -a gs://<state-project>-tfstate/<owner>/<repo>/` lists previous versions to copy back. Don't delete the remote state to "start fresh" — Terraform would then create a second project.

## See Also

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
- [Workload Identity Federation](https://cloud.google.com/docs/authentication/workload-identity-federation)

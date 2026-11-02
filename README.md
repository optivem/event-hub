# EventHub

[![backend-commit-stage](https://github.com/optivem/event-hub/actions/workflows/backend-commit-stage.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/backend-commit-stage.yml)
[![frontend-commit-stage](https://github.com/optivem/event-hub/actions/workflows/frontend-commit-stage.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/frontend-commit-stage.yml)
[![acceptance-stage](https://github.com/optivem/event-hub/actions/workflows/acceptance-stage.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/acceptance-stage.yml)
[![qa-stage](https://github.com/optivem/event-hub/actions/workflows/qa-stage.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/qa-stage.yml)
[![qa-signoff](https://github.com/optivem/event-hub/actions/workflows/qa-signoff.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/qa-signoff.yml)
[![prod-stage](https://github.com/optivem/event-hub/actions/workflows/prod-stage.yml/badge.svg)](https://github.com/optivem/event-hub/actions/workflows/prod-stage.yml)

## Project Info

- **Owner:** optivem
- **System:** EventHub
- **Architecture:** multitier
- **Repo strategy:** monorepo
- **Backend language:** java
- **Frontend language:** typescript
- **Test language:** typescript

## Documentation

- [Architecture](docs/architecture.md)
- [Use Cases](docs/use-cases.md)
- [Use Case Narrative](docs/use-case-narrative.md)
- [Project Registration](docs/project-registration.md)
- [Dev Container](.devcontainer/README.md)

## GCP deployment

`./setup-gcp.sh` provisions the GCP and Neon projects and `./teardown-gcp.sh` removes them. See [terraform/README.md](terraform/README.md).

## License

Copyright (C) 2026 optivem

EventHub is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0-only). If you run a modified version of EventHub as a network service, you must make your modified source code available to its users.

Versions released before 2 November 2026 were licensed under the MIT License.

Contributions require signing the [Contributor License Agreement](CLA.md). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributors

- [optivem](https://github.com/optivem)

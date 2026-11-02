#!/usr/bin/env bash
# Dev Containers copies the host's ~/.gitconfig into the container. On Windows, `gh auth setup-git`
# writes credential helpers with a Windows path ('C:\Program Files\GitHub CLI\gh.exe'), which doesn't
# exist here, so every push and pull prints "gh.exe: not found". Point those helpers at the container's
# own gh instead. Runs on every attach, because the copy can bring the Windows entries back.
set -euo pipefail

keys=$(git config --global --get-regexp '^credential\..*\.helper$' 2>/dev/null \
  | grep -iE '[a-z]:\\|\.exe' | cut -d' ' -f1 | sort -u || true)

for key in $keys; do
  git config --global --unset-all "$key"
  # The empty entry first clears any helper inherited from a broader config, as `gh auth setup-git` does
  git config --global --add "$key" ""
  git config --global --add "$key" "!gh auth git-credential"
  echo "Fixed $key: Windows gh path -> container gh"
done

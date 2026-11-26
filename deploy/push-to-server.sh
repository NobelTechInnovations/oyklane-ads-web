#!/usr/bin/env bash
# Sends the committed code (HEAD) to the Lightsail server and rebuilds the container there.
# Usage: SSH_KEY=/path/to/server-key.pem bash deploy/push-to-server.sh [user@host]
set -euo pipefail
cd "$(dirname "$0")/.."
TARGET="${1:-ubuntu@13.200.105.217}"
KEY="${SSH_KEY:?Set SSH_KEY to the server key file}"
[ -z "$(git status --porcelain)" ] || echo "Note: uncommitted changes are not deployed, only HEAD."
REVISION="$(git rev-parse --short HEAD)"

# The new code is unpacked beside the old one and swapped in, so a failed upload changes nothing.
git archive --format=tar HEAD | ssh -i "$KEY" "$TARGET" "set -euo pipefail
  rm -rf ~/apps/oyklane-ads-web.incoming && mkdir -p ~/apps/oyklane-ads-web.incoming
  tar -x -C ~/apps/oyklane-ads-web.incoming
  echo $REVISION > ~/apps/oyklane-ads-web.incoming/REVISION
  rm -rf ~/apps/oyklane-ads-web && mv ~/apps/oyklane-ads-web.incoming ~/apps/oyklane-ads-web
  cd ~/apps/oyklane-ads-web
  # One build at a time on this small server (same lock as the Oyklane apps).
  flock /tmp/oyklane-build.lock docker compose -f deploy/docker-compose.prod.yml up -d --build
  docker image prune -f >/dev/null"
echo "Deployed $REVISION"

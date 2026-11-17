#!/usr/bin/env bash
# Nahrá web na Hetzner server. Spúšťaj z koreňa projektu: deploy/deploy.sh
# Prvé nastavenie servera je v deploy/PREVADZKA.md.
set -euo pipefail
cd "$(dirname "$0")/.."

SERVER="advokat@37.27.84.175"
KEY="$HOME/.ssh/hetzner_evidencia"
TARGET="/var/www/endokrinologia/"

rsync -az --delete \
  --exclude .git --exclude .claude --exclude .DS_Store --exclude deploy --exclude scripts \
  --exclude '*.log' --exclude node_modules \
  -e "ssh -i $KEY" ./ "$SERVER:$TARGET"

echo "Nahraté. Kontrola:"
curl -s -o /dev/null -w "  %{http_code}  %{url_effective}\n" "https://endo.37-27-84-175.sslip.io/" || true

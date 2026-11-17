#!/usr/bin/env bash
# IndexNow – po každom nasadení oznámi Bingu, Seznamu, Yandexu a ďalším
# vyhľadávačom, že sa stránka zmenila (zaindexujú ju do hodín, nie týždňov).
# Použitie:  scripts/indexnow-ping.sh https://www.nova-domena.sk
# Kľúč = názov súboru <kluc>.txt v koreni webu (musí byť verejne dostupný).
set -euo pipefail
cd "$(dirname "$0")/.."

SITE="${1:?Zadaj adresu webu, napr. https://www.endokrinologia-zilina.sk}"
SITE="${SITE%/}"
HOST="$(echo "$SITE" | sed -E 's#https?://([^/]+).*#\1#')"
KEY="$(ls | grep -E '^[0-9a-f]{32}\.txt$' | head -1 | sed 's/\.txt$//')"

curl -sS -o /dev/null -w "IndexNow: HTTP %{http_code}\n" \
  -H 'Content-Type: application/json; charset=utf-8' \
  -X POST https://api.indexnow.org/indexnow \
  --data "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"$SITE/$KEY.txt\",\"urlList\":[\"$SITE/\",\"$SITE/llms.txt\",\"$SITE/llms-full.txt\"]}"
# 200/202 = prijaté. 403 = kľúčový súbor ešte nie je na webe dostupný.

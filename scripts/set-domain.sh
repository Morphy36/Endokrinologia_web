#!/usr/bin/env bash
# Prepne všetky absolútne adresy webu (canonical, Open Graph, JSON-LD, sitemap,
# robots, llms.txt, manifest) z GitHub Pages na vlastnú doménu.
# Použitie:  scripts/set-domain.sh https://www.endokrinologia-zilina.sk
set -euo pipefail
cd "$(dirname "$0")/.."

NEW="${1:?Zadaj novú adresu, napr. https://www.endokrinologia-zilina.sk}"
NEW="${NEW%/}"
OLD="https://morphy36.github.io/Endokrinologia_web"

FILES=(index.html 404.html robots.txt sitemap.xml llms.txt llms-full.txt)
for f in "${FILES[@]}"; do
  [ -f "$f" ] && sed -i.bak "s#${OLD}#${NEW}#g; s#\"/Endokrinologia_web/#\"/#g" "$f" && rm -f "$f.bak"
done
# Manifest: na vlastnej doméne beží web z koreňa
sed -i.bak 's#"/Endokrinologia_web/"#"/"#g' site.webmanifest && rm -f site.webmanifest.bak

echo "Hotovo. Zostávajúce výskyty starej adresy:"
grep -rn "Endokrinologia_web" --include='*.html' --include='*.txt' --include='*.xml' --include='*.webmanifest' . || echo "  žiadne"

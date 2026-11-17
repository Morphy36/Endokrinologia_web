# Poradňa – zodpovedané otázky

Každá otázka = jeden súbor `<slug>.html` (slug = adresa, napr. `vysoke-tsh-v-tehotenstve.html`).
Zverejňovať len so súhlasom pacienta (políčko „súhlas so zverejnením“ vo formulári) a bez mena / e-mailu.

```
---
title: Krátky nadpis otázky
question: Plné znenie otázky (upravené, bez osobných údajov)
asked_by: Jana, 34 r.
date: 2026-11-20
topic: Štítna žľaza
description: Popis pre Google (do 155 znakov)
---
<p>Odpoveď lekárky v HTML…</p>
```

Potom: `python3 scripts/build.py` a `deploy/deploy.sh`.

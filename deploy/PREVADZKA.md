# Prevádzka na Hetzner serveri

Statický web (bez databázy a bez Dockeru) – nginx servíruje súbory z `/var/www/endokrinologia`.
Server je ten istý ako pri Ledňáčikovi: `ssh -i ~/.ssh/hetzner_evidencia advokat@37.27.84.175`.

Adresa: **https://endokrinologia-zilina.sk** (DNS u Websupportu, A záznamy `@` a `www` → 37.27.84.175).
`www`, `http://` a stará dočasná adresa endo.37-27-84-175.sslip.io presmerujú (301) na ňu.
Certifikát Let's Encrypt `endokrinologia-zilina.sk` (aj www) obnovuje certbot sám.

GitHub Pages (morphy36.github.io/Endokrinologia_web) beží z vetvy `gh-pages`, ktorá len presmeruje na doménu.
Vetva `main` je zdroj webu – nasadzuje sa výhradne cez `deploy/deploy.sh`.

## Prvé nastavenie (raz)

```bash
ssh -i ~/.ssh/hetzner_evidencia advokat@37.27.84.175 \
  'sudo mkdir -p /var/www/endokrinologia && sudo chown advokat: /var/www/endokrinologia'
scp -i ~/.ssh/hetzner_evidencia deploy/nginx-endokrinologia.conf advokat@37.27.84.175:/tmp/
ssh -i ~/.ssh/hetzner_evidencia advokat@37.27.84.175 '
  sudo certbot certonly --nginx -d endo.37-27-84-175.sslip.io &&
  sudo mv /tmp/nginx-endokrinologia.conf /etc/nginx/sites-available/endokrinologia &&
  sudo ln -sf /etc/nginx/sites-available/endokrinologia /etc/nginx/sites-enabled/ &&
  sudo nginx -t && sudo systemctl reload nginx'
deploy/deploy.sh
```

Certifikát sa získa ešte pred zapnutím konfigurácie (nginx by inak neprešiel `nginx -t`). Obnovuje ho certbot sám.

## Nasadenie novej verzie

```bash
deploy/deploy.sh
scripts/indexnow-ping.sh https://endokrinologia-zilina.sk
```

## Prechod (hotovo 17. 11. 2026) na vlastnú doménu

1. U registrátora nastav DNS: `A  @  37.27.84.175` a `A  www  37.27.84.175`.
2. V projekte: `scripts/set-domain.sh https://DOMENA` (prepíše canonical, OG, JSON-LD, sitemap, robots, llms.txt), commit.
3. V `deploy/nginx-endokrinologia.conf` nahraď `endo.37-27-84-175.sslip.io` doménou, odkomentuj www blok, nahraj a spusti
   `sudo certbot --nginx -d DOMENA -d www.DOMENA`.
4. `deploy/deploy.sh`, potom `scripts/indexnow-ping.sh https://DOMENA`.
5. Google Search Console + Bing Webmaster Tools: pridať doménu, odoslať `sitemap.xml`.
6. GitHub Pages: nahradiť `index.html` presmerovaním (`<meta http-equiv="refresh">` + canonical na novú doménu),
   aby sa nová doména nekonkurovala sama so sebou.

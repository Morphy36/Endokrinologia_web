#!/usr/bin/env python3
"""
Generátor podstránok webu Endokrinológia Žilina (bez externých knižníc).

Zdroj obsahu:
  content/clanky/<slug>.html   – článok  (hlavička + HTML telo)
  content/poradna/<slug>.html  – zodpovedaná otázka z poradne

Výstup (negeneruj ručne, prepíše sa):
  clanky/index.html, clanky/<slug>/index.html
  poradna/index.html, poradna/<slug>/index.html
  sitemap.xml, blok v llms.txt medzi značkami <!-- obsah:start/end -->

Formát hlavičky (riadky "kľúč: hodnota" medzi riadkami "---"):
  článok:  title, description, lead, date (RRRR-MM-DD), updated, eyebrow, reading_min, tags
  poradňa: title (krátky nadpis), question (plné znenie otázky), asked_by (napr. "Jana, 34 r."),
           date (dátum odpovede), topic, description
Použitie:  python3 scripts/build.py
"""
import html, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://endokrinologia-zilina.sk"
VERSION = "20261118c"
LAYOUT = (ROOT / "templates/layout.html").read_text(encoding="utf-8")
DOCTOR_ID = f"{SITE}/#physician"
CLINIC_ID = f"{SITE}/#clinic"
MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla",
          "augusta", "septembra", "októbra", "novembra", "decembra"]


def sk_date(iso):
    y, m, d = map(int, iso.split("-"))
    return f"{d}. {MONTHS[m - 1]} {y}"


def esc(s):
    return html.escape(s, quote=True)


def parse(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m:
        sys.exit(f"Chýba hlavička --- v {path}")
    meta = {}
    for line in m.group(1).splitlines():
        if line.strip() and not line.startswith("#"):
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    meta["slug"] = path.stem
    meta["body"] = m.group(2).strip()
    return meta


def plain(htm):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", htm))).strip()


def breadcrumbs(items):
    """items = [(názov, url|None)]  → (html, jsonld)"""
    parts, ld = [], []
    for i, (name, url) in enumerate(items, 1):
        if url and i < len(items):
            parts.append(f'<a href="{url.replace(SITE, "") or "/"}">{esc(name)}</a>')
        else:
            parts.append(f'<span aria-current="page">{esc(name)}</span>')
        ld.append({"@type": "ListItem", "position": i, "name": name,
                   **({"item": url} if url else {})})
    sep = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>'
    return (" " * 20 + f" {sep} ".join(parts),
            {"@type": "BreadcrumbList", "itemListElement": ld})


def render(out, *, title, description, url, h1, lead, eyebrow, crumbs, content,
           graph, og_type="website", hero_meta="", nav="", robots="index, follow", narrow=True):
    bc_html, bc_ld = breadcrumbs(crumbs)
    graph = graph + [bc_ld]
    page = LAYOUT
    vals = {
        "title": esc(title), "description": esc(description), "url": url, "site": SITE,
        "robots": robots, "og_type": og_type, "version": VERSION, "h1": h1,
        "lead": lead, "eyebrow": esc(eyebrow), "breadcrumbs_html": bc_html,
        "hero_meta": hero_meta, "content": content, "extra_head": "",
        "hero_container": " container--narrow" if narrow else "",
        "nav_clanky": " nav-link--active" if nav == "clanky" else "",
        "nav_poradna": " nav-link--active" if nav == "poradna" else "",
        "jsonld": json.dumps({"@context": "https://schema.org", "@graph": graph},
                             ensure_ascii=False, indent=2),
    }
    for k, v in vals.items():
        page = page.replace("{{" + k + "}}", v)
    left = re.findall(r"\{\{\w+\}\}", page)
    if left:
        sys.exit(f"Nevyplnené premenné {left} v {out}")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")


def cta_box():
    return """
                <aside class="article-cta">
                    <div class="article-cta-icon"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i></div>
                    <div>
                        <h2>Riešite podobný problém?</h2>
                        <p>Ambulancia v Žiline prijíma nových pacientov. Na objednanie stačí výmenný lístok
                        od všeobecného alebo iného odborného lekára.</p>
                        <div class="article-cta-actions">
                            <a href="/#kontakt" class="btn btn-light"><i class="fa-solid fa-calendar-check"></i> Objednať sa</a>
                            <a href="tel:+421414510421" class="btn btn-outline-light"><i class="fa-solid fa-phone"></i> 041 451 0421</a>
                        </div>
                    </div>
                </aside>"""


DISCLAIMER = """
                <p class="article-disclaimer">
                    <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                    Informácie v tomto texte sú všeobecné a nenahrádzajú vyšetrenie ani individuálnu
                    radu lekára. Pri náhlych alebo závažných ťažkostiach volajte 155 alebo vyhľadajte pohotovosť.
                </p>"""


# ---------------------------------------------------------------- články
def build_articles():
    items = sorted((parse(p) for p in (ROOT / "content/clanky").glob("*.html")),
                   key=lambda a: a["date"], reverse=True)
    for a in items:
        url = f"{SITE}/clanky/{a['slug']}/"
        updated = a.get("updated", a["date"])
        words = len(plain(a["body"]).split())
        minutes = a.get("reading_min") or str(max(1, round(words / 200)))
        meta = (f'                <div class="page-hero-meta">'
                f'<span><i class="fa-solid fa-user-doctor" aria-hidden="true"></i> MUDr. Zuzana Samcová</span>'
                f'<span><i class="fa-regular fa-calendar" aria-hidden="true"></i> '
                f'<time datetime="{a["date"]}">{sk_date(a["date"])}</time></span>'
                f'<span><i class="fa-regular fa-clock" aria-hidden="true"></i> {minutes} min čítania</span></div>')
        content = f"""        <section class="section article-section">
            <div class="container container--narrow">
                <article class="article-body">
{a["body"]}
                </article>
{DISCLAIMER}
{cta_box()}
                <nav class="article-more" aria-label="Ďalšie čítanie">
                    <a href="/clanky/"><i class="fa-solid fa-arrow-left"></i> Všetky články</a>
                    <a href="/poradna/">Máte otázku? Opýtajte sa v poradni <i class="fa-solid fa-arrow-right"></i></a>
                </nav>
            </div>
        </section>"""
        graph = [{
            "@type": ["Article", "MedicalWebPage"], "@id": url + "#article",
            "headline": a["title"], "description": a["description"], "url": url,
            "inLanguage": "sk-SK", "datePublished": a["date"], "dateModified": updated,
            "author": {"@id": DOCTOR_ID}, "reviewedBy": {"@id": DOCTOR_ID},
            "lastReviewed": updated, "publisher": {"@id": CLINIC_ID},
            "image": f"{SITE}/og-image.png", "mainEntityOfPage": url,
            "audience": {"@type": "PeopleAudience", "audienceType": "Pacienti"},
            "wordCount": words,
            **({"keywords": a["tags"]} if a.get("tags") else {}),
        }, {
            "@type": "Physician", "@id": DOCTOR_ID, "name": "MUDr. Zuzana Samcová",
            "medicalSpecialty": "Endocrinology", "url": SITE + "/",
        }]
        render(ROOT / f"clanky/{a['slug']}/index.html",
               title=f"{a['title']} | Endokrinológia Žilina", description=a["description"],
               url=url, h1=esc(a["title"]), lead=esc(a["lead"]),
               eyebrow=a.get("eyebrow", "Článok"), og_type="article", hero_meta=meta,
               crumbs=[("Domov", SITE + "/"), ("Články", SITE + "/clanky/"), (a["title"], url)],
               content=content, graph=graph, nav="clanky")

    cards = "\n".join(f"""                    <a class="post-card" href="/clanky/{a['slug']}/">
                        <span class="post-card-eyebrow">{esc(a.get('eyebrow', 'Článok'))}</span>
                        <h2 class="post-card-title">{esc(a['title'])}</h2>
                        <p class="post-card-text">{esc(a['description'])}</p>
                        <span class="post-card-meta"><time datetime="{a['date']}">{sk_date(a['date'])}</time>
                            <span class="post-card-more">Čítať <i class="fa-solid fa-arrow-right"></i></span></span>
                    </a>""" for a in items)
    url = f"{SITE}/clanky/"
    content = f"""        <section class="section article-section">
            <div class="container">
                <div class="post-grid">
{cards}
                </div>
            </div>
        </section>"""
    graph = [{
        "@type": "CollectionPage", "@id": url, "url": url, "name": "Články o hormonálnom zdraví",
        "inLanguage": "sk-SK", "publisher": {"@id": CLINIC_ID},
        "hasPart": [{"@type": "Article", "headline": a["title"],
                     "url": f"{SITE}/clanky/{a['slug']}/"} for a in items],
    }]
    render(ROOT / "clanky/index.html",
           title="Články o hormónoch, štítnej žľaze a metabolizme | Endokrinológia Žilina",
           description="Zrozumiteľné články endokrinologičky MUDr. Zuzany Samcovej zo Žiliny o hormónoch, "
                       "štítnej žľaze, obezite, osteoporóze a ďalších endokrinných ochoreniach.",
           url=url, h1='Články o <span class="gradient-text-light">hormonálnom zdraví</span>',
           lead="Zrozumiteľne o hormónoch, štítnej žľaze a metabolizme – priamo z endokrinologickej ambulancie v Žiline.",
           eyebrow="Články", crumbs=[("Domov", SITE + "/"), ("Články", url)],
           content=content, graph=graph, nav="clanky", narrow=False)
    return items


# ---------------------------------------------------------------- poradňa
TOPICS = ["Štítna žľaza", "Obezita a metabolizmus", "Osteoporóza", "Hormónové poruchy",
          "Nadobličky a hypofýza", "Iné"]


def poradna_form():
    opts = "\n".join(f'                                    <option>{t}</option>' for t in TOPICS)
    return f"""
                <div class="contact-form-wrap poradna-form-wrap" id="opytajte-sa">
                    <form class="contact-form js-web3form" id="poradnaForm" action="https://api.web3forms.com/submit" method="POST" novalidate
                          data-success="Ďakujeme, otázku sme prijali. Odpoveď pošleme na váš e-mail.">
                        <h3>Položte otázku</h3>
                        <input type="hidden" name="access_key" value="REPLACE_WITH_WEB3FORMS_ACCESS_KEY">
                        <input type="hidden" name="subject" value="Poradňa – nová otázka z webu">
                        <input type="hidden" name="from_name" value="Poradňa Endokrinológia Žilina">
                        <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

                        <div class="form-row">
                            <div class="form-group">
                                <label for="p-name">Meno alebo prezývka</label>
                                <input type="text" id="p-name" name="meno" placeholder="napr. Jana" autocomplete="given-name">
                            </div>
                            <div class="form-group">
                                <label for="p-age">Vek</label>
                                <input type="number" id="p-age" name="vek" min="1" max="120" placeholder="napr. 42">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="p-email">E-mail na odpoveď <span aria-hidden="true">*</span></label>
                                <input type="email" id="p-email" name="email" placeholder="vas@email.sk" autocomplete="email" required>
                            </div>
                            <div class="form-group">
                                <label for="p-topic">Téma</label>
                                <select id="p-topic" name="tema">
{opts}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="p-question">Vaša otázka <span aria-hidden="true">*</span></label>
                            <textarea id="p-question" name="otazka" rows="6" required
                                placeholder="Opíšte, čo vás trápi – napr. výsledky TSH, užívané lieky, ako dlho ťažkosti trvajú…"></textarea>
                        </div>
                        <div class="form-checkbox">
                            <input type="checkbox" id="p-gdpr" name="suhlas_gdpr" value="áno" required>
                            <label for="p-gdpr">Súhlasím so spracovaním osobných údajov na účel odpovede na otázku. <span aria-hidden="true">*</span></label>
                        </div>
                        <div class="form-checkbox">
                            <input type="checkbox" id="p-publish" name="suhlas_zverejnenie" value="áno">
                            <label for="p-publish">Súhlasím s anonymným zverejnením otázky a odpovede v poradni (bez mena a e-mailu).</label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fa-solid fa-paper-plane"></i>
                            Odoslať otázku
                        </button>
                        <div class="form-success" role="alert" aria-live="polite">
                            <i class="fa-solid fa-circle-check"></i>
                            <span class="form-success-text">Ďakujeme, otázku sme prijali.</span>
                        </div>
                    </form>
                </div>"""


def build_poradna():
    items = sorted((parse(p) for p in (ROOT / "content/poradna").glob("*.html")),
                   key=lambda q: q["date"], reverse=True)
    for q in items:
        url = f"{SITE}/poradna/{q['slug']}/"
        content = f"""        <section class="section article-section">
            <div class="container container--narrow">
                <div class="qa-question">
                    <div class="qa-label"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Otázka{(' · ' + esc(q['asked_by'])) if q.get('asked_by') else ''}</div>
                    <p>{esc(q['question'])}</p>
                </div>
                <article class="article-body qa-answer">
                    <div class="qa-label"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i> Odpovedá MUDr. Zuzana Samcová</div>
{q["body"]}
                </article>
{DISCLAIMER}
{cta_box()}
                <nav class="article-more" aria-label="Ďalšie čítanie">
                    <a href="/poradna/"><i class="fa-solid fa-arrow-left"></i> Všetky otázky</a>
                    <a href="/poradna/#opytajte-sa">Položiť vlastnú otázku <i class="fa-solid fa-arrow-right"></i></a>
                </nav>
            </div>
        </section>"""
        graph = [{
            "@type": "QAPage", "@id": url, "url": url, "inLanguage": "sk-SK",
            "mainEntity": {
                "@type": "Question", "name": q["title"], "text": q["question"],
                "answerCount": 1, "datePublished": q["date"],
                "author": {"@type": "Person", "name": q.get("asked_by", "Pacient").split(",")[0]},
                "acceptedAnswer": {
                    "@type": "Answer", "text": plain(q["body"]), "url": url,
                    "datePublished": q["date"],
                    "author": {"@type": "Person", "name": "MUDr. Zuzana Samcová",
                               "jobTitle": "Endokrinológ", "url": SITE + "/"},
                },
            },
        }]
        render(ROOT / f"poradna/{q['slug']}/index.html",
               title=f"{q['title']} | Poradňa Endokrinológia Žilina",
               description=q.get("description") or plain(q["body"])[:155],
               url=url, h1=esc(q["title"]), lead=esc(q.get("topic", "Poradňa")),
               eyebrow="Poradňa", og_type="article",
               crumbs=[("Domov", SITE + "/"), ("Poradňa", SITE + "/poradna/"), (q["title"], url)],
               content=content, graph=graph, nav="poradna")

    if items:
        listing = "\n".join(f"""                    <a class="qa-item" href="/poradna/{q['slug']}/">
                        <span class="post-card-eyebrow">{esc(q.get('topic', 'Poradňa'))}</span>
                        <h3>{esc(q['title'])}</h3>
                        <p>{esc(q['question'][:180])}{'…' if len(q['question']) > 180 else ''}</p>
                    </a>""" for q in items)
    else:
        listing = """                    <div class="qa-empty">
                        <i class="fa-regular fa-comments" aria-hidden="true"></i>
                        <p>Prvé zodpovedané otázky tu pribudnú čoskoro. Pokojne sa opýtajte ako prví.</p>
                    </div>"""
    url = f"{SITE}/poradna/"
    content = f"""        <section class="section article-section">
            <div class="container">
                <div class="poradna-layout">
                    <div class="poradna-info">
                        <h2 class="poradna-h2">Ako poradňa funguje</h2>
                        <ol class="poradna-steps">
                            <li><strong>Pošlite otázku</strong> cez formulár – stačí e-mail, meno nie je povinné.</li>
                            <li><strong>Lekárka odpovie</strong> na váš e-mail, zvyčajne do niekoľkých pracovných dní.</li>
                            <li><strong>So súhlasom</strong> otázku a odpoveď anonymne zverejníme, aby pomohli aj ďalším.</li>
                        </ol>
                        <p class="poradna-note">
                            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                            Poradňa slúži na všeobecné otázky. Nenahrádza vyšetrenie a nie je určená na akútne
                            stavy – vtedy volajte 155 alebo vyhľadajte pohotovosť.
                        </p>
                    </div>
{poradna_form()}
                </div>

                <h2 class="poradna-h2 poradna-h2--list">Zodpovedané otázky</h2>
                <div class="qa-list">
{listing}
                </div>
            </div>
        </section>"""
    graph = [{
        "@type": "CollectionPage", "@id": url, "url": url, "inLanguage": "sk-SK",
        "name": "Endokrinologická poradňa online", "publisher": {"@id": CLINIC_ID},
    }]
    render(ROOT / "poradna/index.html",
           title="Endokrinologická poradňa online – opýtajte sa lekárky | Endokrinológia Žilina",
           description="Opýtajte sa endokrinologičky MUDr. Zuzany Samcovej na štítnu žľazu, hormóny, obezitu "
                       "či osteoporózu. Odpoveď dostanete e-mailom, vybrané otázky zverejňujeme anonymne.",
           url=url, h1='Endokrinologická <span class="gradient-text-light">poradňa</span>',
           lead="Máte otázku o štítnej žľaze, hormónoch alebo výsledkoch? Napíšte – odpovie vám endokrinologička MUDr. Zuzana Samcová.",
           eyebrow="Poradňa", crumbs=[("Domov", SITE + "/"), ("Poradňa", url)],
           content=content, graph=graph, nav="poradna", narrow=False)
    return items


# ---------------------------------------------------------------- sitemap + llms
def build_sitemap(articles, questions):
    today = date.today().isoformat()
    urls = [(SITE + "/", today, "1.0"), (SITE + "/clanky/", today, "0.8"),
            (SITE + "/poradna/", today, "0.8")]
    urls += [(f"{SITE}/clanky/{a['slug']}/", a.get("updated", a["date"]), "0.7") for a in articles]
    urls += [(f"{SITE}/poradna/{q['slug']}/", q["date"], "0.6") for q in questions]
    body = "\n".join(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{d}</lastmod>\n"
                     f"    <priority>{p}</priority>\n  </url>" for u, d, p in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
        encoding="utf-8")
    return [u for u, _, _ in urls]


def build_llms(articles, questions):
    lines = ["## Články a poradňa", "",
             f"- Články: {SITE}/clanky/",
             *[f"  - [{a['title']}]({SITE}/clanky/{a['slug']}/): {a['description']}" for a in articles],
             f"- Poradňa (otázky pacientov, odpovedá lekárka): {SITE}/poradna/",
             *[f"  - [{q['title']}]({SITE}/poradna/{q['slug']}/)" for q in questions]]
    block = "<!-- obsah:start -->\n" + "\n".join(lines) + "\n<!-- obsah:end -->"
    for name in ("llms.txt", "llms-full.txt"):
        p = ROOT / name
        t = p.read_text(encoding="utf-8")
        if "<!-- obsah:start -->" in t:
            t = re.sub(r"<!-- obsah:start -->.*?<!-- obsah:end -->", block, t, flags=re.S)
        else:
            t = t.rstrip() + "\n\n" + block + "\n"
        p.write_text(t, encoding="utf-8")


if __name__ == "__main__":
    arts = build_articles()
    qs = build_poradna()
    urls = build_sitemap(arts, qs)
    build_llms(arts, qs)
    print(f"Hotovo: {len(arts)} článkov, {len(qs)} otázok v poradni, {len(urls)} adries v sitemap.xml")

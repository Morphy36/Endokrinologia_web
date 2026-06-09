/* ============================================
   Progress Bar
   ============================================ */
const progressBar = document.getElementById('progressBar');

function updateProgress() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
}

/* ============================================
   Navbar
   ============================================ */
const navbar = document.getElementById('navbar');

function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}

/* ============================================
   Mobile Menu
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
});

navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
});

/* ============================================
   Smooth Scroll
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = navbar.offsetHeight + 8;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
});

/* ============================================
   Scroll Reveal (IntersectionObserver)
   ============================================ */
const revealObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.section .reveal, .stats-bar .reveal').forEach(el => revealObserver.observe(el));

/* ============================================
   Counter Animation
   ============================================ */
function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start    = performance.now();

    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    }),
    { threshold: 0.6 }
);

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

/* ============================================
   Accordion
   ============================================ */
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item      = header.closest('.accordion-item');
        const body      = item.querySelector('.accordion-body');
        const bodyInner = item.querySelector('.accordion-body-inner');
        const isOpen    = item.classList.contains('open');

        // Close all open items first
        document.querySelectorAll('.accordion-item.open').forEach(open => {
            open.classList.remove('open');
            open.querySelector('.accordion-body').style.maxHeight = '0';
            open.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
            item.classList.add('open');
            body.style.maxHeight = bodyInner.scrollHeight + 44 + 'px';
            header.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ============================================
   Back to Top
   ============================================ */
const backToTop = document.getElementById('backToTop');
const mobileBook = document.getElementById('mobileBook');

function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 450);

    // Floating mobile booking CTA: show after hero, hide near the contact section
    if (mobileBook) {
        const contact = document.getElementById('kontakt');
        const nearContact = contact &&
            contact.getBoundingClientRect().top < window.innerHeight * 0.9;
        mobileBook.classList.toggle('visible', window.scrollY > 500 && !nearContact);
    }
}

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================
   Contact Form
   ============================================ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Odosielam...';

        // Simulate async send — replace body with real fetch/Formspree call
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Odoslané!';
            submitBtn.style.background = 'linear-gradient(135deg,#059669,#10B981)';
            formSuccess.classList.add('show');
            contactForm.reset();

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Odoslať správu';
                submitBtn.style.background = '';
                formSuccess.classList.remove('show');
            }, 6000);
        }, 1400);
    });
}

/* ============================================
   Active nav link on scroll (highlight)
   ============================================ */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    sections.forEach(section => {
        const top = section.offsetTop;
        const bot = top + section.offsetHeight;
        if (scrollMid >= top && scrollMid < bot) {
            navLinks.forEach(link => {
                link.classList.toggle(
                    'nav-link--active',
                    link.getAttribute('href') === '#' + section.id
                );
            });
        }
    });
}

/* ============================================
   Scroll event — single listener, passive
   ============================================ */
window.addEventListener('scroll', () => {
    updateProgress();
    updateNavbar();
    updateBackToTop();
    updateActiveLink();
}, { passive: true });

// Init on load
updateNavbar();
updateBackToTop();

/* ============================================
   Cursor Glow
   ============================================ */
const cursorGlow = document.getElementById('cursorGlow');

if (cursorGlow) {
    let glowVisible = false;

    document.addEventListener('mousemove', e => {
        cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        if (!glowVisible) {
            cursorGlow.style.opacity = '1';
            glowVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
        glowVisible = false;
    });
}

/* ============================================
   Hero Canvas — Hormone chemical formulas + real butterflies
   Mouse flee physics: elements run away from cursor
   ============================================ */
const heroCanvas = document.getElementById('heroParticles');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroCanvas && !prefersReducedMotion) {
    const ctx  = heroCanvas.getContext('2d');
    let particles = [];
    let animFrame;
    let t = 0;
    let mouseX = -9999, mouseY = -9999;

    // Aqua-teal ink — crisp against dark navy/violet gradient
    const ink = (a) => `rgba(110, 225, 215, ${a})`;
    const set = (lw, a) => {
        ctx.strokeStyle = ink(a);
        ctx.lineWidth   = Math.max(0.5, lw);
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
    };

    /* ── flat-top hexagon path helper ── */
    function hexPath(cx, cy, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + Math.PI / 6;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    /* ══════════════════════════════════════════════════
       1. REAL BUTTERFLY  (motýľ)
       Forewings + hindwings + body + antennae
    ══════════════════════════════════════════════════ */
    function drawButterfly(ctx, s) {
        const lw = s / 22;
        ctx.shadowColor = ink(0.35); ctx.shadowBlur = s * 0.25;

        // Upper-right forewing
        ctx.beginPath();
        ctx.moveTo(s * 0.06, -s * 0.04);
        ctx.bezierCurveTo(s * 0.30, -s * 1.10, s * 1.30, -s * 1.20, s * 1.40, -s * 0.40);
        ctx.bezierCurveTo(s * 1.35,  s * 0.10, s * 0.55,  s * 0.22, s * 0.06,  s * 0.10);
        ctx.closePath();
        ctx.fillStyle = ink(0.07); ctx.fill();
        set(lw, 0.80); ctx.stroke();

        // Upper-left forewing (mirror)
        ctx.beginPath();
        ctx.moveTo(-s * 0.06, -s * 0.04);
        ctx.bezierCurveTo(-s * 0.30, -s * 1.10, -s * 1.30, -s * 1.20, -s * 1.40, -s * 0.40);
        ctx.bezierCurveTo(-s * 1.35,  s * 0.10, -s * 0.55,  s * 0.22, -s * 0.06,  s * 0.10);
        ctx.closePath();
        ctx.fillStyle = ink(0.07); ctx.fill();
        set(lw, 0.80); ctx.stroke();

        // Lower-right hindwing
        ctx.beginPath();
        ctx.moveTo(s * 0.06,  s * 0.12);
        ctx.bezierCurveTo(s * 0.40,  s * 0.22, s * 1.25,  s * 0.15, s * 1.30,  s * 0.70);
        ctx.bezierCurveTo(s * 1.18,  s * 1.10, s * 0.35,  s * 1.10, s * 0.06,  s * 0.55);
        ctx.closePath();
        ctx.fillStyle = ink(0.07); ctx.fill();
        set(lw, 0.80); ctx.stroke();

        // Lower-left hindwing (mirror)
        ctx.beginPath();
        ctx.moveTo(-s * 0.06,  s * 0.12);
        ctx.bezierCurveTo(-s * 0.40,  s * 0.22, -s * 1.25,  s * 0.15, -s * 1.30,  s * 0.70);
        ctx.bezierCurveTo(-s * 1.18,  s * 1.10, -s * 0.35,  s * 1.10, -s * 0.06,  s * 0.55);
        ctx.closePath();
        ctx.fillStyle = ink(0.07); ctx.fill();
        set(lw, 0.80); ctx.stroke();

        ctx.shadowBlur = 0;

        // Body (abdomen + thorax)
        ctx.beginPath();
        ctx.ellipse(0, s * 0.24, s * 0.11, s * 0.44, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.22); ctx.fill();
        set(lw * 0.70, 0.85); ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(0, -s * 0.12, s * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.20); ctx.fill();
        set(lw * 0.70, 0.85); ctx.stroke();

        // Antennae
        set(s / 50, 0.65);
        ctx.beginPath();
        ctx.moveTo(-s * 0.06, -s * 0.22);
        ctx.quadraticCurveTo(-s * 0.30, -s * 0.85, -s * 0.20, -s * 1.10);
        ctx.moveTo( s * 0.06, -s * 0.22);
        ctx.quadraticCurveTo( s * 0.30, -s * 0.85,  s * 0.20, -s * 1.10);
        ctx.stroke();
        // Antenna balls
        ctx.beginPath();
        ctx.arc(-s * 0.20, -s * 1.10, s * 0.06, 0, Math.PI * 2);
        ctx.arc( s * 0.20, -s * 1.10, s * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.70); ctx.fill();

        // Wing vein details
        set(s / 58, 0.25);
        // Right forewing veins
        ctx.beginPath();
        ctx.moveTo(s * 0.06, s * 0.04);
        ctx.quadraticCurveTo(s * 0.50, -s * 0.50, s * 1.20, -s * 0.55);
        ctx.moveTo(s * 0.06, s * 0.04);
        ctx.quadraticCurveTo(s * 0.60, -s * 0.10, s * 1.30, -s * 0.10);
        ctx.stroke();
        set(s / 58, 0.25);
        // Left forewing veins (mirror)
        ctx.beginPath();
        ctx.moveTo(-s * 0.06, s * 0.04);
        ctx.quadraticCurveTo(-s * 0.50, -s * 0.50, -s * 1.20, -s * 0.55);
        ctx.moveTo(-s * 0.06, s * 0.04);
        ctx.quadraticCurveTo(-s * 0.60, -s * 0.10, -s * 1.30, -s * 0.10);
        ctx.stroke();
    }

    /* ══════════════════════════════════════════════════
       2. STEROID SKELETON  (A-B-C hexagons + D pentagon)
       Backbone of cortisol / estradiol / testosterone
    ══════════════════════════════════════════════════ */
    function drawSteroid(ctx, s) {
        const lw = s / 22;
        const r  = s * 0.34;
        const dh = r * Math.sqrt(3); // fused hex center-to-center

        ctx.shadowColor = ink(0.42); ctx.shadowBlur = s * 0.28;

        // Rings A, B, C
        for (let i = 0; i < 3; i++) {
            hexPath(-dh + i * dh, 0, r);
            ctx.fillStyle = ink(0.05); ctx.fill();
            set(lw, 0.82); ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Ring D — pentagon fused to right of ring C
        const Dx = dh + r * Math.sqrt(3) * 0.5 + r * 0.44;
        const rD = r * 0.76;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = i * (Math.PI * 2 / 5) - Math.PI / 2;
            const x = Dx + rD * Math.cos(a);
            const y = rD * Math.sin(a) - r * 0.04;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = ink(0.05); ctx.fill();
        set(lw, 0.82); ctx.stroke();

        // Functional groups: =O on ring A, -OH on ring D
        set(lw * 0.68, 0.55);
        ctx.beginPath();
        ctx.moveTo(-dh, -r); ctx.lineTo(-dh, -r - s * 0.40); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Dx + rD * 0.78, -rD * 0.72);
        ctx.lineTo(Dx + rD * 1.20, -rD * 1.10); ctx.stroke();

        ctx.font      = `bold ${Math.round(s * 0.21)}px monospace`;
        ctx.fillStyle = ink(0.78);
        ctx.textAlign = 'center';
        ctx.fillText('O',  -dh, -r - s * 0.52);
        ctx.fillText('OH', Dx + rD * 1.22, -rD * 1.24);
    }

    /* ══════════════════════════════════════════════════
       3. THYROXINE T4
       Two phenyl rings, -O- bridge, 4 iodine atoms
    ══════════════════════════════════════════════════ */
    function drawThyroxine(ctx, s) {
        const lw = s / 22;
        const r  = s * 0.35;
        const gc = r * 2.78; // gap between ring centres

        ctx.shadowColor = ink(0.44); ctx.shadowBlur = s * 0.28;

        hexPath(-gc * 0.5, 0, r);
        ctx.fillStyle = ink(0.05); ctx.fill();
        set(lw, 0.82); ctx.stroke();

        hexPath(gc * 0.5, 0, r);
        ctx.fillStyle = ink(0.05); ctx.fill();
        set(lw, 0.82); ctx.stroke();

        ctx.shadowBlur = 0;

        // -O- ether bridge
        set(lw, 0.68);
        ctx.beginPath();
        ctx.moveTo(-gc * 0.5 + r * 0.86, 0);
        ctx.lineTo( gc * 0.5 - r * 0.86, 0);
        ctx.stroke();
        ctx.font      = `bold ${Math.round(s * 0.28)}px monospace`;
        ctx.fillStyle = ink(0.82);
        ctx.textAlign = 'center';
        ctx.fillText('O', 0, -s * 0.05);

        // 4 iodine atoms: 2 per ring at ortho/meta positions
        const iodines = [
            { lx: -gc * 0.5 - r * 0.85, ly: -r * 1.14, fx: -gc * 0.5 - r * 0.46, fy: -r * 0.46 },
            { lx: -gc * 0.5 - r * 0.85, ly:  r * 1.14, fx: -gc * 0.5 - r * 0.46, fy:  r * 0.46 },
            { lx:  gc * 0.5 + r * 0.85, ly: -r * 1.14, fx:  gc * 0.5 + r * 0.46, fy: -r * 0.46 },
            { lx:  gc * 0.5 + r * 0.85, ly:  r * 1.14, fx:  gc * 0.5 + r * 0.46, fy:  r * 0.46 }
        ];
        ctx.font      = `bold ${Math.round(s * 0.31)}px monospace`;
        ctx.fillStyle = ink(0.92);
        ctx.textAlign = 'center';
        iodines.forEach(({ lx, ly, fx, fy }) => {
            set(lw * 0.62, 0.50);
            ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(lx, ly); ctx.stroke();
            ctx.fillText('I', lx, ly + s * 0.11);
        });

        // Side chain: -CH₂-CH(NH₂)-COOH
        set(lw * 0.72, 0.52);
        const sx = gc * 0.5 + r * 0.86;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + s * 0.44, 0);
        ctx.lineTo(sx + s * 0.80, -s * 0.36);
        ctx.lineTo(sx + s * 1.18, -s * 0.36);
        ctx.stroke();
        ctx.font      = `${Math.round(s * 0.19)}px monospace`;
        ctx.fillStyle = ink(0.55);
        ctx.textAlign = 'left';
        ctx.fillText('NH₂',  sx + s * 0.70, -s * 0.54);
        ctx.fillText('COOH', sx + s * 1.18, -s * 0.20);
    }

    /* ══════════════════════════════════════════════════
       4. CATECHOLAMINE — Adrenaline / Epinephrine
       Benzene with catechol -OH groups + aminoethanol chain
    ══════════════════════════════════════════════════ */
    function drawCatecholamine(ctx, s) {
        const lw = s / 22;
        const r  = s * 0.50;

        ctx.shadowColor = ink(0.40); ctx.shadowBlur = s * 0.26;

        // Benzene ring
        hexPath(0, 0, r);
        ctx.fillStyle = ink(0.06); ctx.fill();
        set(lw, 0.86); ctx.stroke();

        // Aromatic inner circle
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
        set(lw * 0.50, 0.28); ctx.stroke();

        ctx.shadowBlur = 0;

        // Catechol -OH groups at 3,4 positions
        ctx.font      = `bold ${Math.round(s * 0.24)}px monospace`;
        ctx.fillStyle = ink(0.80);
        ctx.textAlign = 'center';
        [210, 270].forEach(deg => {
            const rad = deg * Math.PI / 180;
            const vx  = r * Math.cos(rad), vy = r * Math.sin(rad);
            set(lw * 0.72, 0.60);
            ctx.beginPath();
            ctx.moveTo(vx, vy); ctx.lineTo(vx * 1.56, vy * 1.56); ctx.stroke();
            ctx.fillText('OH', vx * 1.76, vy * 1.76 + s * 0.05);
        });

        // Side chain at 30° vertex: -CH(OH)-CH₂-NH-CH₃
        const vx0 = r * Math.cos(30 * Math.PI / 180);
        const vy0 = r * Math.sin(30 * Math.PI / 180);
        set(lw * 0.80, 0.62);
        ctx.beginPath();
        ctx.moveTo(vx0, vy0);
        ctx.lineTo(vx0 + s * 0.42, vy0 - s * 0.42);
        ctx.lineTo(vx0 + s * 0.80, vy0 - s * 0.28);
        ctx.lineTo(vx0 + s * 1.15, vy0 - s * 0.52);
        ctx.stroke();
        ctx.font      = `${Math.round(s * 0.21)}px monospace`;
        ctx.fillStyle = ink(0.58);
        ctx.textAlign = 'center';
        ctx.fillText('OH',  vx0 + s * 0.42, vy0 - s * 0.60);
        ctx.fillText('NH',  vx0 + s * 0.88, vy0 - s * 0.55);
        ctx.fillText('CH₃', vx0 + s * 1.18, vy0 - s * 0.63);
    }

    /* ══════════════════════════════════════════════════
       5. INSULIN HEXAMER  (6-fold symmetry, Zn²⁺ centre)
    ══════════════════════════════════════════════════ */
    function drawInsulin(ctx, s) {
        const lw = s / 24;

        ctx.shadowColor = ink(0.38); ctx.shadowBlur = s * 0.24;

        // Central zinc ion
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.16); ctx.fill();
        set(lw * 0.80, 0.74); ctx.stroke();

        // 6 subunit ellipses in hexagonal arrangement
        for (let i = 0; i < 6; i++) {
            const a  = i * Math.PI / 3;
            const cx = Math.cos(a) * s * 0.72;
            const cy = Math.sin(a) * s * 0.72;
            ctx.beginPath();
            ctx.ellipse(cx, cy, s * 0.30, s * 0.22, a, 0, Math.PI * 2);
            ctx.fillStyle = ink(0.05); ctx.fill();
            set(lw, 0.80); ctx.stroke();
            // Coordination bond to Zn centre
            set(lw * 0.44, 0.28);
            ctx.beginPath();
            ctx.moveTo(cx * 0.35, cy * 0.35); ctx.lineTo(cx * 0.66, cy * 0.66); ctx.stroke();
        }

        ctx.shadowBlur = 0;

        ctx.font      = `bold ${Math.round(s * 0.22)}px monospace`;
        ctx.fillStyle = ink(0.74);
        ctx.textAlign = 'center';
        ctx.fillText('Zn²⁺', 0, s * 0.07);
    }

    /* ══════════════════════════════════════════════════
       Animation engine — flee-from-mouse physics
    ══════════════════════════════════════════════════ */
    const DRAW_FNS = {
        butterfly:     drawButterfly,
        steroid:       drawSteroid,
        thyroxine:     drawThyroxine,
        catecholamine: drawCatecholamine,
        insulin:       drawInsulin
    };

    function resizeHero() {
        heroCanvas.width  = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
    }

    function createParticles() {
        particles = [];
        // 2 butterflies + 3 steroids + 3 thyroxines + 2 catecholamines + 2 insulins = 12
        const types = [
            'butterfly', 'butterfly',
            'steroid',   'steroid',   'steroid',
            'thyroxine', 'thyroxine', 'thyroxine',
            'catecholamine', 'catecholamine',
            'insulin', 'insulin'
        ];
        types.forEach((type, i) => {
            const cols = 4;
            const col  = i % cols;
            const row  = Math.floor(i / cols);
            const rows = Math.ceil(types.length / cols);
            const hx   = ((col + 0.5) / cols  + (Math.random() - 0.5) * 0.18) * heroCanvas.width;
            const hy   = ((row + 0.5) / rows  + (Math.random() - 0.5) * 0.18) * heroCanvas.height;
            particles.push({
                type,
                homeX: hx, homeY: hy,
                x:     hx, y:     hy,
                vx: 0,  vy: 0,
                size:    Math.random() * 12 + 34,        // 34–46 px — moderate size
                angle:   Math.random() * Math.PI * 2,
                vAngle:  (Math.random() - 0.5) * 0.0010,
                opacity: Math.random() * 0.08 + 0.16,   // 0.16–0.24 — subtle
                phase:   Math.random() * Math.PI * 2
            });
        });
    }

    function animateHero() {
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        t += 0.005;

        particles.forEach(p => {
            // Spring back towards home position — lazy, gentle
            p.vx += (p.homeX - p.x) * 0.005;
            p.vy += (p.homeY - p.y) * 0.005;

            // Mouse flee — soft, slow reaction
            const mdx   = p.x - mouseX;
            const mdy   = p.y - mouseY;
            const dist2 = mdx * mdx + mdy * mdy;
            const R     = 180;
            if (dist2 < R * R && dist2 > 0.1) {
                const dist  = Math.sqrt(dist2);
                const force = Math.pow(1 - dist / R, 1.8) * 2.8;
                p.vx += (mdx / dist) * force;
                p.vy += (mdy / dist) * force;
                p.vAngle += (Math.random() - 0.5) * 0.003;
            }

            // Heavy damping — slow, fluid movement
            p.vx     *= 0.94;
            p.vy     *= 0.94;
            p.vAngle *= 0.95;

            // Integrate + gentle ambient drift
            p.x     += p.vx + Math.sin(t * 0.26 + p.phase) * 0.28;
            p.y     += p.vy + Math.cos(t * 0.20 + p.phase) * 0.22;
            p.angle += p.vAngle;

            // Butterflies flap wings: scale y slightly
            const flapY = p.type === 'butterfly'
                ? 1 + 0.08 * Math.sin(t * 3.5 + p.phase)
                : 1;

            const op = p.opacity * (0.82 + 0.18 * Math.sin(t * 0.38 + p.phase));

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.scale(1, flapY);
            ctx.globalAlpha = op;
            DRAW_FNS[p.type](ctx, p.size);
            ctx.restore();
        });

        animFrame = requestAnimationFrame(animateHero);
    }

    // Mouse tracking — use document so it works even with hero content on top
    function updateMouse(e) {
        const rect = heroCanvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
    document.addEventListener('mousemove', updateMouse, { passive: true });
    // Reset when mouse leaves the viewport
    document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    resizeHero();
    createParticles();
    animateHero();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animFrame);
        resizeHero();
        createParticles();
        animateHero();
    });
}

/* ============================================
   Service Card 3D Tilt
   ============================================ */
document.querySelectorAll('.service-card').forEach(card => {
    const shine = card.querySelector('.card-shine');

    card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 10;
        const rotY   =  dx * 10;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;

        const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');

        if (shine) shine.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        if (shine) shine.style.opacity = '0';
    });
});

/* ============================================
   Interactive Endocrine Map
   ============================================ */
const endoPanel   = document.getElementById('endoPanel');
const endoDefault = document.querySelector('.endo-default');

const glandData = {
    pituitary: {
        name:     'Hypofýza',
        color:    '#7C3AED',
        hormones: ['GH', 'TSH', 'LH', 'FSH', 'ACTH', 'Prolaktín'],
        desc:     'Hypofýza je hlavná endokrinná žľaza — "dirigent" hormonálneho systému. Reguluje väčšinu ostatných endokrinných žliaz prostredníctvom trópnych hormónov.',
        diseases: ['Akromegália', 'Hypopituitarizmus', 'Prolaktinóm', 'Cushingova choroba']
    },
    thyroid: {
        name:     'Štítna žľaza',
        color:    '#0D9488',
        hormones: ['T3 (trijódtyronín)', 'T4 (tyroxín)', 'Kalcitonín'],
        desc:     'Štítna žľaza riadi metabolizmus, telesný rast a vývoj. Produkuje hormóny regulujúce spotrebu energie, telesnú teplotu a funkciu srdca.',
        diseases: ['Hypotyreóza', 'Hypertyreóza', 'Gravesova choroba', 'Hashimotova tyreoiditída', 'Strumy']
    },
    parathyroid: {
        name:     'Prištítne telieska',
        color:    '#3B82F6',
        hormones: ['PTH (parathormón)'],
        desc:     'Štyri malé žľazy za štítnou žľazou regulujú hladinu vápnika a fosforu v krvi — kľúčové pre zdravie kostí a nervovosvalovú funkciu.',
        diseases: ['Hyperparatyreóza', 'Hypoparatyreóza', 'Osteoporóza']
    },
    adrenal: {
        name:     'Nadobličky',
        color:    '#EC4899',
        hormones: ['Kortizol', 'Aldosterón', 'Adrenalín', 'Noradrenalín', 'DHEA'],
        desc:     'Nadobličky sedia na vrchole obličiek a produkujú hormóny stresu (kortizol, adrenalín) aj regulátory krvného tlaku a elektrolytov (aldosterón).',
        diseases: ['Addisonova choroba', 'Cushingov syndróm', 'Feochromocytóm', 'Primárny hyperaldosteronizmus']
    },
    pancreas: {
        name:     'Pankreas',
        color:    '#F97316',
        hormones: ['Inzulín', 'Glukagón', 'Somatostatín'],
        desc:     'Endokrinná časť pankreasu (Langerhansove ostrovčeky) reguluje hladinu krvného cukru. Inzulín znižuje a glukagón zvyšuje glykémiu.',
        diseases: ['Diabetes mellitus typ 1', 'Diabetes mellitus typ 2', 'Hypoglykémia', 'Inzulinóm']
    },
    gonads: {
        name:     'Pohlavné žľazy',
        color:    '#10B981',
        hormones: ['Estrogén', 'Progesterón', 'Testosterón', 'Inhibín'],
        desc:     'Vaječníky a semenníky produkujú pohlavné hormóny regulujúce reprodukciu, sekundárne pohlavné znaky a hustotu kostí.',
        diseases: ['PCOS', 'Hypogonadizmus', 'Predčasná menopauza', 'Poruchy fertility']
    }
};

function showGlandPanel(id) {
    const g = glandData[id];
    if (!g || !endoPanel) return;

    endoPanel.innerHTML = `
        <div class="endo-panel-header">
            <span class="endo-panel-dot" style="background:${g.color}"></span>
            <h3 class="endo-panel-title">${g.name}</h3>
            <button class="endo-panel-close" id="endoPanelClose" aria-label="Zavrieť">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <p class="endo-panel-desc">${g.desc}</p>
        <div class="endo-panel-section">
            <span class="endo-panel-label">Hormóny</span>
            <div class="endo-hormones">
                ${g.hormones.map(h => `<span class="hormone-tag" style="border-color:${g.color};color:${g.color}">${h}</span>`).join('')}
            </div>
        </div>
        <div class="endo-panel-section">
            <span class="endo-panel-label">Ochorenia v ambulancii</span>
            <ul class="endo-diseases">
                ${g.diseases.map(d => `<li><i class="fa-solid fa-circle-dot" style="color:${g.color}"></i> ${d}</li>`).join('')}
            </ul>
        </div>`;

    endoPanel.hidden = false;
    if (endoDefault) endoDefault.style.display = 'none';

    document.getElementById('endoPanelClose')?.addEventListener('click', closeGlandPanel);
}

function closeGlandPanel() {
    if (endoPanel) endoPanel.hidden = true;
    if (endoDefault) endoDefault.style.display = '';
    document.querySelectorAll('.endo-node').forEach(n => n.classList.remove('active'));
}

document.querySelectorAll('.endo-node').forEach(node => {
    node.style.cursor = 'pointer';

    node.addEventListener('click', () => {
        const id = node.dataset.id;
        document.querySelectorAll('.endo-node').forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        showGlandPanel(id);
    });

    node.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            node.click();
        }
    });

    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && endoPanel && !endoPanel.hidden) closeGlandPanel();
});

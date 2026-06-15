/* ============================================
   Trial Operation Banner
   ============================================ */
const trialBannerClose = document.getElementById('trialBannerClose');
if (trialBannerClose) {
    trialBannerClose.addEventListener('click', () => {
        document.documentElement.classList.add('trial-dismissed');
        try { localStorage.setItem('trialBannerDismissed', '1'); } catch (e) {}
    });
}

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
        const group     = header.closest('.accordion') || document;

        // Close other open items within the SAME accordion group
        group.querySelectorAll('.accordion-item.open').forEach(open => {
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
    const resetBtn = (delay = 6000) => setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Odoslať správu';
        submitBtn.style.background = '';
        formSuccess.classList.remove('show');
    }, delay);

    const showError = (msg) => {
        submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + msg;
        submitBtn.style.background = 'linear-gradient(135deg,#DC2626,#EF4444)';
        resetBtn(5000);
    };

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        // Native validation (required fields + GDPR checkbox)
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Odosielam...';

        const data = Object.fromEntries(new FormData(contactForm).entries());

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body:    JSON.stringify(data)
            });
            const json = await res.json();

            if (res.ok && json.success) {
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Odoslané!';
                submitBtn.style.background = 'linear-gradient(135deg,#059669,#10B981)';
                formSuccess.classList.add('show');
                contactForm.reset();
                resetBtn(6000);
            } else {
                // Most common cause: access_key still set to the placeholder
                showError('Skúste neskôr');
                console.error('Web3Forms error:', json);
            }
        } catch (err) {
            showError('Chyba spojenia');
            console.error('Form submit failed:', err);
        }
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
        title:    'Hormóny hypofýzy – dirigent hormonálneho systému',
        hormones: ['GH', 'TSH', 'ACTH', 'FSH', 'LH', 'Prolaktín', 'ADH', 'Oxytocín'],
        diseases: ['Akromegália', 'Hypopituitarizmus', 'Prolaktinóm', 'Cushingova choroba', 'Diabetes insipidus'],
        body: `
            <p>Hypofýza (podmozgová žľaza) je malá žľaza veľkosti hrášku uložená na spodine mozgu v tzv. tureckom sedle. Napriek svojej veľkosti je nadradeným riadiacim centrom väčšiny ostatných endokrinných žliaz — býva označovaná ako „dirigent“ hormonálneho systému. Skladá sa z prednej časti (adenohypofýza) a zadnej časti (neurohypofýza).</p>

            <h4>Predná hypofýza (adenohypofýza)</h4>
            <p>Produkuje vlastné hormóny, ktoré riadia ďalšie žľazy:</p>
            <ul>
                <li><strong>Rastový hormón (GH)</strong> – rast tela a metabolizmus bielkovín, tukov a cukrov</li>
                <li><strong>TSH</strong> – stimuluje štítnu žľazu</li>
                <li><strong>ACTH</strong> – stimuluje kôru nadobličiek k tvorbe kortizolu</li>
                <li><strong>FSH a LH</strong> – riadia činnosť pohlavných žliaz a plodnosť</li>
                <li><strong>Prolaktín</strong> – tvorba materského mlieka</li>
            </ul>

            <h4>Zadná hypofýza (neurohypofýza)</h4>
            <p>Uvoľňuje hormóny tvorené v hypotalame:</p>
            <ul>
                <li><strong>ADH (vazopresín)</strong> – hospodárenie s vodou a koncentrácia moču</li>
                <li><strong>Oxytocín</strong> – sťahy maternice pri pôrode a tvorba mlieka</li>
            </ul>

            <p class="endo-note">Nadprodukcia rastového hormónu spôsobuje akromegáliu, nedostatok hormónov vedie k hypopituitarizmu. Poruchy hypofýzy môžu ovplyvniť celý hormonálny systém — od rastu cez plodnosť až po reakciu na stres.</p>

            <table class="endo-table">
                <thead><tr><th>Časť hypofýzy</th><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>Adenohypofýza</td><td>GH</td><td>Rast a metabolizmus</td></tr>
                    <tr><td>Adenohypofýza</td><td>TSH / ACTH</td><td>Riadenie štítnej žľazy a nadobličiek</td></tr>
                    <tr><td>Adenohypofýza</td><td>FSH / LH</td><td>Plodnosť a pohlavné žľazy</td></tr>
                    <tr><td>Neurohypofýza</td><td>ADH / oxytocín</td><td>Hospodárenie s vodou, pôrod</td></tr>
                </tbody>
            </table>

            <p>Hypofýza koordinuje takmer celý hormonálny systém. Pri podozrení na jej poruchu je dôležité odborné endokrinologické vyšetrenie.</p>`
    },

    thyroid: {
        name:     'Štítna žľaza',
        color:    '#0D9488',
        title:    'Hormóny štítnej žľazy – riadenie metabolizmu',
        hormones: ['T4 (tyroxín)', 'T3 (trijódtyronín)', 'Kalcitonín'],
        diseases: ['Hypotyreóza', 'Hypertyreóza', 'Gravesova choroba', 'Hashimotova tyreoiditída', 'Uzly a strumy', 'Cysty štítnej žľazy'],
        body: `
            <p>Štítna žľaza je motýľovitá žľaza uložená v prednej časti krku pod hrtanom. Riadi rýchlosť metabolizmu — teda to, ako telo využíva a vydáva energiu — a ovplyvňuje takmer každý orgán v tele.</p>

            <h4>Hormóny štítnej žľazy</h4>
            <ul>
                <li><strong>T4 (tyroxín)</strong> a <strong>T3 (trijódtyronín)</strong> – hlavné hormóny štítnej žľazy; na ich tvorbu je nevyhnutný jód</li>
                <li><strong>Kalcitonín</strong> – pomáha znižovať hladinu vápnika v krvi</li>
            </ul>

            <h4>Hlavné funkcie</h4>
            <ul>
                <li>regulujú rýchlosť metabolizmu a spotrebu energie,</li>
                <li>ovplyvňujú telesnú teplotu, srdcovú frekvenciu a krvný tlak,</li>
                <li>sú nevyhnutné pre vývoj mozgu a rast u detí,</li>
                <li>ovplyvňujú náladu, trávenie, stav kože a vlasov.</li>
            </ul>

            <p class="endo-note">Znížená funkcia (hypotyreóza) sa prejavuje únavou, priberaním a zimomravosťou; zvýšená funkcia (hypertyreóza) chudnutím, búšením srdca, nervozitou a potením.</p>

            <h4>Vyšetrenie a výkony v ambulancii</h4>
            <p>Súčasťou starostlivosti je ultrazvukové vyšetrenie štítnej žľazy a v indikovaných prípadoch <strong>tenkoihlová aspiračná biopsia (FNAB) uzlov</strong> štítnej žľazy na odlíšenie nezhubných a zhubných uzlov, ako aj <strong>evakuácia (odsatie) cýst</strong> štítnej žľazy.</p>

            <table class="endo-table">
                <thead><tr><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>T4 / T3</td><td>Metabolizmus, energia, telesná teplota</td></tr>
                    <tr><td>Kalcitonín</td><td>Znižovanie hladiny vápnika</td></tr>
                </tbody>
            </table>

            <p>Ochorenia štítnej žľazy patria k najčastejším endokrinným poruchám. Vďaka odbornému vyšetreniu a ultrazvuku je možné ich včas zachytiť a účinne liečiť.</p>`
    },

    parathyroid: {
        name:     'Prištítne telieska',
        color:    '#3B82F6',
        title:    'Hormón prištítnych teliesok – hospodárenie s vápnikom',
        hormones: ['PTH (parathormón)'],
        diseases: ['Hyperparatyreóza', 'Hypoparatyreóza', 'Osteoporóza', 'Obličkové kamene'],
        body: `
            <p>Prištítne telieska sú zvyčajne štyri drobné žľazy veľkosti šošovice uložené na zadnej strane štítnej žľazy. Hoci sú maličké, zohrávajú kľúčovú úlohu v hospodárení s vápnikom a fosforom — minerálmi nevyhnutnými pre zdravie kostí a správnu funkciu nervov a svalov.</p>

            <h4>Parathormón (PTH)</h4>
            <p><span class="endo-produces">Produkuje: parathormón (PTH)</span></p>
            <p><strong>Hlavné funkcie:</strong></p>
            <ul>
                <li>zvyšuje hladinu vápnika v krvi,</li>
                <li>uvoľňuje vápnik z kostí, keď je ho v krvi málo,</li>
                <li>zvyšuje vstrebávanie vápnika v črevách a obličkách,</li>
                <li>podieľa sa na aktivácii vitamínu D.</li>
            </ul>

            <p class="endo-note">Nadmerná tvorba PTH (hyperparatyreóza) môže viesť k odvápneniu kostí, obličkovým kameňom a únave. Nedostatok (hypoparatyreóza) sa prejavuje tŕpnutím a svalovými kŕčmi.</p>

            <table class="endo-table">
                <thead><tr><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>PTH (parathormón)</td><td>Regulácia vápnika a fosforu, zdravie kostí</td></tr>
                </tbody>
            </table>

            <p>Rovnováha vápnika je dôležitá pre kosti, svaly aj nervový systém. Poruchy prištítnych teliesok sa odhaľujú laboratórnym vyšetrením a vyžadujú endokrinologickú starostlivosť.</p>`
    },

    adrenal: {
        name:     'Nadobličky',
        color:    '#EC4899',
        title:    'Hormóny nadobličiek – malé žľazy s veľkým významom',
        hormones: ['Aldosterón', 'Kortizol', 'DHEA / DHEAS', 'Androstendión', 'Adrenalín', 'Noradrenalín'],
        diseases: ['Addisonova choroba', 'Cushingov syndróm', 'Feochromocytóm', 'Primárny hyperaldosteronizmus'],
        body: `
            <p>Nadobličky sú párové žľazy uložené nad obličkami. Napriek svojej malej veľkosti produkujú hormóny nevyhnutné pre život. Podieľajú sa na regulácii krvného tlaku, hospodárenia s vodou a minerálmi, reakcii organizmu na stres, metabolizme aj tvorbe pohlavných hormónov.</p>
            <p>Nadoblička sa skladá z <strong>kôry nadobličky</strong> a <strong>drene nadobličky</strong>, pričom každá časť produkuje odlišné hormóny.</p>

            <h4>Kôra nadobličky</h4>
            <p>Kôra nadobličky sa skladá z troch vrstiev:</p>

            <h5>1. Zona glomerulosa (vonkajšia vrstva)</h5>
            <p><span class="endo-produces">Produkuje: aldosterón</span></p>
            <p><strong>Hlavné funkcie:</strong></p>
            <ul>
                <li>reguluje množstvo sodíka a draslíka v organizme,</li>
                <li>ovplyvňuje zadržiavanie vody v tele,</li>
                <li>podieľa sa na udržiavaní normálneho krvného tlaku.</li>
            </ul>
            <p class="endo-note">Nadmerná tvorba aldosterónu môže viesť k vysokému krvnému tlaku a nízkej hladine draslíka v krvi.</p>

            <h5>2. Zona fasciculata (stredná vrstva)</h5>
            <p><span class="endo-produces">Produkuje: kortizol</span></p>
            <p><strong>Hlavné funkcie:</strong></p>
            <ul>
                <li>pomáha organizmu zvládať fyzický a psychický stres,</li>
                <li>reguluje metabolizmus cukrov, tukov a bielkovín,</li>
                <li>ovplyvňuje imunitný systém a zápalové procesy,</li>
                <li>podieľa sa na udržiavaní krvného tlaku a hladiny glukózy v krvi.</li>
            </ul>
            <p class="endo-note">Nedostatok kortizolu môže viesť k únave, chudnutiu a nízkemu krvnému tlaku, zatiaľ čo jeho nadbytok spôsobuje Cushingov syndróm.</p>

            <h5>3. Zona reticularis (vnútorná vrstva kôry)</h5>
            <p><span class="endo-produces">Produkuje: DHEA, DHEAS a androstendión</span></p>
            <p>Ide o tzv. adrenálne androgény, teda pohlavné hormóny produkované nadobličkami.</p>
            <p><strong>Hlavné funkcie:</strong></p>
            <ul>
                <li>prispievajú k rozvoju sekundárnych pohlavných znakov,</li>
                <li>podieľajú sa na raste ochlpenia,</li>
                <li>u žien predstavujú významný zdroj androgénov,</li>
                <li>ovplyvňujú libido a celkovú vitalitu.</li>
            </ul>
            <p class="endo-note">Ich zvýšená tvorba sa môže prejaviť nadmerným ochlpením, akné alebo poruchami menštruačného cyklu.</p>

            <h4>Dreň nadobličky</h4>
            <p>Dreň nadobličky produkuje tzv. katecholamíny:</p>
            <ul>
                <li>adrenalín,</li>
                <li>noradrenalín,</li>
                <li>malé množstvo dopamínu.</li>
            </ul>
            <p><strong>Hlavné funkcie:</strong></p>
            <ul>
                <li>pripravujú organizmus na „boj alebo útek“,</li>
                <li>zrýchľujú srdcovú frekvenciu,</li>
                <li>zvyšujú krvný tlak,</li>
                <li>zvyšujú hladinu glukózy v krvi,</li>
                <li>zlepšujú prekrvenie svalov počas záťaže.</li>
            </ul>
            <p class="endo-note">Pri nadmernej tvorbe katecholamínov (napríklad pri feochromocytóme) sa môžu objavovať záchvaty vysokého krvného tlaku, búšenie srdca, potenie a úzkosť.</p>

            <h4>Prehľad hormónov nadobličiek</h4>
            <table class="endo-table">
                <thead><tr><th>Časť nadobličky</th><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>Zona glomerulosa</td><td>Aldosterón</td><td>Regulácia krvného tlaku, sodíka a draslíka</td></tr>
                    <tr><td>Zona fasciculata</td><td>Kortizol</td><td>Reakcia na stres, metabolizmus, imunita</td></tr>
                    <tr><td>Zona reticularis</td><td>DHEA, DHEAS, androstendión</td><td>Tvorba pohlavných hormónov</td></tr>
                    <tr><td>Dreň nadobličky</td><td>Adrenalín, noradrenalín</td><td>Akútna stresová reakcia</td></tr>
                </tbody>
            </table>

            <p>Nadobličky zohrávajú kľúčovú úlohu v udržiavaní vnútorného prostredia organizmu. Poruchy ich funkcie môžu viesť k závažným hormonálnym ochoreniam, preto je pri podozrení na ochorenie nadobličiek dôležité odborné endokrinologické vyšetrenie.</p>`
    },

    pancreas: {
        name:     'Pankreas',
        color:    '#F97316',
        title:    'Hormóny pankreasu – riadenie hladiny cukru',
        hormones: ['Inzulín', 'Glukagón', 'Somatostatín', 'Pankreatický polypeptid'],
        diseases: ['Hypoglykémia', 'Inzulinóm', 'Poruchy hladiny cukru'],
        body: `
            <p>Pankreas (podžalúdková žľaza) má dvojakú funkciu — tráviacu, pri ktorej tvorí tráviace enzýmy, a hormonálnu. Endokrinnú časť tvoria tzv. <strong>Langerhansove ostrovčeky</strong>, ktoré presne regulujú hladinu cukru (glukózy) v krvi.</p>

            <h4>Bunky ostrovčekov a ich hormóny</h4>
            <ul>
                <li><strong>Beta-bunky → inzulín</strong> – znižuje hladinu cukru v krvi tým, že umožňuje bunkám prijímať glukózu</li>
                <li><strong>Alfa-bunky → glukagón</strong> – zvyšuje hladinu cukru uvoľňovaním zásob z pečene</li>
                <li><strong>Delta-bunky → somatostatín</strong> – tlmí uvoľňovanie inzulínu a glukagónu</li>
                <li><strong>PP-bunky → pankreatický polypeptid</strong> – ovplyvňuje trávenie a chuť do jedla</li>
            </ul>

            <h4>Hlavné funkcie</h4>
            <ul>
                <li>udržiavanie stabilnej hladiny cukru v krvi,</li>
                <li>hospodárenie organizmu s energiou,</li>
                <li>jemná rovnováha medzi ukladaním a uvoľňovaním glukózy.</li>
            </ul>

            <p class="endo-note">Pri poruche tvorby alebo účinku inzulínu sa narúša hladina cukru v krvi. Nadmerná tvorba inzulínu (napr. pri inzulinóme) spôsobuje naopak nízku hladinu cukru — hypoglykémiu.</p>

            <table class="endo-table">
                <thead><tr><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>Inzulín</td><td>Znižuje hladinu cukru v krvi</td></tr>
                    <tr><td>Glukagón</td><td>Zvyšuje hladinu cukru v krvi</td></tr>
                    <tr><td>Somatostatín</td><td>Reguluje uvoľňovanie ostatných hormónov</td></tr>
                </tbody>
            </table>

            <p>Endokrinná funkcia pankreasu je nevyhnutná pre stabilný metabolizmus cukru. Jej poruchy sa odhaľujú laboratórnym vyšetrením a vyžadujú dlhodobú odbornú starostlivosť.</p>`
    },

    gonads: {
        name:     'Pohlavné žľazy',
        color:    '#10B981',
        title:    'Hormóny pohlavných žliaz – reprodukcia a vitalita',
        hormones: ['Estrogén', 'Progesterón', 'Testosterón', 'Inhibín'],
        diseases: ['PCOS', 'Hypogonadizmus', 'Predčasná menopauza', 'Poruchy plodnosti'],
        body: `
            <p>Pohlavné žľazy (gonády) — u žien <strong>vaječníky</strong>, u mužov <strong>semenníky</strong> — produkujú pohlavné hormóny a zabezpečujú tvorbu pohlavných buniek. Ich činnosť riadi hypofýza prostredníctvom hormónov FSH a LH.</p>

            <h4>Vaječníky (u žien)</h4>
            <ul>
                <li><strong>Estrogény</strong> – vývoj a udržiavanie ženských pohlavných znakov, riadenie menštruačného cyklu, ochrana kostí</li>
                <li><strong>Progesterón</strong> – príprava maternice na tehotenstvo a jeho udržiavanie</li>
            </ul>

            <h4>Semenníky (u mužov)</h4>
            <ul>
                <li><strong>Testosterón</strong> – mužské pohlavné znaky, tvorba spermií, svalová hmota a libido</li>
            </ul>

            <h4>Hlavné funkcie</h4>
            <ul>
                <li>riadia pohlavné dozrievanie a reprodukciu,</li>
                <li>ovplyvňujú hustotu kostí, svalovú hmotu a rozloženie tuku,</li>
                <li>ovplyvňujú náladu, libido a celkovú vitalitu.</li>
            </ul>

            <p class="endo-note">Hormonálna nerovnováha sa môže prejaviť poruchami menštruačného cyklu, zníženou plodnosťou, syndrómom polycystických vaječníkov (PCOS) alebo predčasnou menopauzou.</p>

            <table class="endo-table">
                <thead><tr><th>Žľaza</th><th>Hormón</th><th>Hlavná funkcia</th></tr></thead>
                <tbody>
                    <tr><td>Vaječníky</td><td>Estrogén</td><td>Ženské znaky, cyklus, kosti</td></tr>
                    <tr><td>Vaječníky</td><td>Progesterón</td><td>Tehotenstvo</td></tr>
                    <tr><td>Semenníky</td><td>Testosterón</td><td>Mužské znaky, spermie, libido</td></tr>
                </tbody>
            </table>

            <p>Pohlavné hormóny ovplyvňujú nielen reprodukciu, ale aj kosti, svaly a psychickú pohodu. Ich poruchy patria do oblasti endokrinológie a vyžadujú individuálny prístup.</p>`
    }
};

function showGlandPanel(id) {
    const g = glandData[id];
    if (!g || !endoPanel) return;

    endoPanel.innerHTML = `
        <div class="endo-panel-header">
            <span class="endo-panel-dot" style="background:${g.color}"></span>
            <h3 class="endo-panel-title">${g.title || g.name}</h3>
            <button class="endo-close" id="endoPanelClose" aria-label="Zavrieť">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="endo-panel-scroll" tabindex="0">
            <div class="endo-hormones">
                ${g.hormones.map(h => `<span class="endo-hormone-tag">${h}</span>`).join('')}
            </div>
            <div class="endo-rich" style="--gland-color:${g.color}">
                ${g.body}
            </div>
            <div class="endo-diseases">
                <h4>Ochorenia, ktoré liečime</h4>
                <div class="endo-disease-list">
                    ${g.diseases.map(d => `<div class="endo-disease-item" style="color:${g.color}"><span>${d}</span></div>`).join('')}
                </div>
            </div>
        </div>`;

    endoPanel.hidden = false;
    if (endoDefault) endoDefault.style.display = 'none';

    const scroll = endoPanel.querySelector('.endo-panel-scroll');
    if (scroll) scroll.scrollTop = 0;

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

/* ============================================
   Live "Otvorené / Zatvorené" status
   Mon–Fri 7:00–15:00, Europe/Bratislava
   ============================================ */
function updateOpenStatus() {
    let day, minutes;
    try {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Bratislava',
            weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
        }).formatToParts(new Date());
        const get = (t) => parts.find(p => p.type === t)?.value;
        day     = ['Mon','Tue','Wed','Thu','Fri'].indexOf(get('weekday'));
        minutes = parseInt(get('hour'), 10) % 24 * 60 + parseInt(get('minute'), 10);
    } catch (e) {
        const now = new Date();
        day     = now.getDay() >= 1 && now.getDay() <= 5 ? now.getDay() - 1 : -1;
        minutes = now.getHours() * 60 + now.getMinutes();
    }

    const isOpen = day >= 0 && minutes >= 7 * 60 && minutes < 15 * 60;

    ['openStatusHero', 'openStatusHours'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.hidden = false;
        el.classList.toggle('open-status--closed', !isOpen);
        el.querySelector('.open-status-text').textContent =
            isOpen ? 'Teraz otvorené' : 'Momentálne zatvorené';
    });
}
updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

/* ============================================
   Service cards → open gland on the endo map
   ============================================ */
document.querySelectorAll('.service-card[data-gland]').forEach(card => {
    const glandId = card.dataset.gland;

    // Inject "show on map" hint link
    const link = document.createElement('span');
    link.className = 'service-map-link';
    link.innerHTML = 'Zobraziť na mape <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    card.appendChild(link);

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', card.querySelector('.service-title').textContent + ' — zobraziť na interaktívnej mape');

    const goToGland = () => {
        const map = document.getElementById('endo-mapa');
        if (!map) return;
        const offset = navbar.offsetHeight + 8;
        window.scrollTo({
            top: map.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth'
        });
        // Activate the matching node + panel once we arrive
        setTimeout(() => {
            const node = document.querySelector(`.endo-node[data-id="${glandId}"]`);
            document.querySelectorAll('.endo-node').forEach(n => n.classList.remove('active'));
            if (node) node.classList.add('active');
            showGlandPanel(glandId);
        }, 550);
    };

    card.addEventListener('click', goToGland);
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToGland(); }
    });
});

/* ============================================
   Copy-to-clipboard for phone & email (contact section)
   ============================================ */
document.querySelectorAll('.contact-item-body a[href^="tel:"], .contact-item-body a[href^="mailto:"]').forEach(link => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', 'Kopírovať ' + link.textContent.trim());
    link.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', async () => {
        const text = link.textContent.trim();
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>';
        }, 1800);
    });
});


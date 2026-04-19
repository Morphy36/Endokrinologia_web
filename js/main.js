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

function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 450);
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
   Hero Canvas — Da Vinci anatomical endocrine glands
   Large, clearly recognisable sepia ink drawings
   ============================================ */
const heroCanvas = document.getElementById('heroParticles');

if (heroCanvas) {
    const ctx  = heroCanvas.getContext('2d');
    let glands = [];
    let animFrame;
    let t = 0;

    // Warm sepia — Da Vinci iron-gall ink on dark parchment
    const ink = (a) => `rgba(222,190,134,${a})`;
    const set = (lw, a) => {
        ctx.strokeStyle = ink(a);
        ctx.lineWidth   = lw;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
    };

    /* ─────────────────────────────────────────────────────────────
       THYROID (Štítna žľaza)
       Two vertical oval lobes joined at the bottom by an isthmus.
       Most recognisable endocrine gland — butterfly silhouette.
    ───────────────────────────────────────────────────────────── */
    function drawThyroid(ctx, s) {
        const lw  = s / 28;       // outline weight
        const ox  = s * 0.82;     // lobe centre x-offset
        const rx  = s * 0.68;     // lobe horizontal radius
        const ry  = s;            // lobe vertical radius (taller than wide)

        ctx.shadowColor = ink(0.40); ctx.shadowBlur = s * 0.20;

        // Left & right lobes
        for (const cx of [-ox, ox]) {
            ctx.beginPath();
            ctx.ellipse(cx, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = ink(0.08); ctx.fill();
            set(lw, 0.92); ctx.stroke();
        }

        // Isthmus — short horizontal bridge at lobe lower-thirds
        const iy = ry * 0.62;
        ctx.beginPath();
        ctx.moveTo(-rx * 0.55, iy - ry * 0.14);
        ctx.quadraticCurveTo(0, iy - ry * 0.18, rx * 0.55, iy - ry * 0.14);
        ctx.lineTo(rx * 0.55, iy + ry * 0.14);
        ctx.quadraticCurveTo(0, iy + ry * 0.20, -rx * 0.55, iy + ry * 0.14);
        ctx.closePath();
        ctx.fillStyle = ink(0.10); ctx.fill();
        set(lw * 0.80, 0.85); ctx.stroke();

        ctx.shadowBlur = 0;

        // Lobular texture — horizontal arcs in each lobe
        set(s / 62, 0.30);
        for (const cx of [-ox, ox]) {
            for (let row = -2; row <= 2; row++) {
                ctx.beginPath();
                ctx.ellipse(cx, row * ry * 0.38, rx * 0.70, ry * 0.18, 0, 0, Math.PI);
                ctx.stroke();
            }
        }

        // Superior thyroid vessels (two arteries entering each lobe from top)
        set(s / 50, 0.55);
        for (const cx of [-ox, ox]) {
            ctx.beginPath();
            ctx.moveTo(cx - rx * 0.26, -ry * 0.90);
            ctx.lineTo(cx - rx * 0.32, -ry * 1.48);
            ctx.moveTo(cx + rx * 0.20, -ry * 0.90);
            ctx.lineTo(cx + rx * 0.26, -ry * 1.44);
            ctx.stroke();
        }
    }

    /* ─────────────────────────────────────────────────────────────
       PITUITARY (Hypofýza)
       Small bean in sella turcica, with infundibulum stalk going up.
    ───────────────────────────────────────────────────────────── */
    function drawPituitary(ctx, s) {
        const lw = s / 28;
        ctx.shadowColor = ink(0.38); ctx.shadowBlur = s * 0.18;

        // Main gland — slightly kidney-bean shaped
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.92, s * 0.76, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.08); ctx.fill();
        set(lw, 0.92); ctx.stroke();

        ctx.shadowBlur = 0;

        // Anterior / posterior lobe division
        set(s / 60, 0.38);
        ctx.beginPath();
        ctx.moveTo(s * 0.06, -s * 0.74); ctx.lineTo(s * 0.06, s * 0.74); ctx.stroke();

        // Infundibulum (pituitary stalk) — funnel shape rising upward
        set(lw * 0.90, 0.88);
        ctx.beginPath();
        ctx.moveTo(-s * 0.20, -s * 0.74);
        ctx.quadraticCurveTo(-s * 0.08, -s * 1.15, 0, -s * 1.65);
        ctx.moveTo( s * 0.20, -s * 0.74);
        ctx.quadraticCurveTo( s * 0.08, -s * 1.15, 0, -s * 1.65);
        ctx.stroke();

        // Median eminence (thickening where stalk meets brain)
        ctx.beginPath();
        ctx.ellipse(0, -s * 1.58, s * 0.18, s * 0.10, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.12); ctx.fill();
        set(lw * 0.70, 0.72); ctx.stroke();

        // Sella turcica — bony cup beneath gland
        set(lw * 1.10, 0.62);
        ctx.beginPath();
        ctx.arc(0, s * 0.10, s * 1.14, Math.PI * 0.07, Math.PI * 0.93); ctx.stroke();
        // Clinoid processes (upward spurs at rim)
        set(lw * 0.80, 0.50);
        ctx.beginPath();
        ctx.moveTo(-s * 1.10, s * 0.34); ctx.lineTo(-s * 1.22, -s * 0.14);
        ctx.moveTo( s * 1.10, s * 0.34); ctx.lineTo( s * 1.22, -s * 0.14);
        ctx.stroke();
    }

    /* ─────────────────────────────────────────────────────────────
       ADRENAL (Nadobličky)
       Triangular cap sitting atop kidney.  Cortex + medulla visible.
    ───────────────────────────────────────────────────────────── */
    function drawAdrenal(ctx, s) {
        const lw = s / 28;
        ctx.shadowColor = ink(0.38); ctx.shadowBlur = s * 0.18;

        // Kidney (background shape, lower, dimmer)
        ctx.beginPath();
        ctx.ellipse(0, s * 1.05, s * 0.72, s * 0.88, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.04); ctx.fill();
        set(lw * 0.65, 0.38); ctx.stroke();

        // Adrenal cap — inverted triangle/crescent
        ctx.beginPath();
        ctx.moveTo(-s * 0.85, s * 0.20);
        ctx.bezierCurveTo(-s * 1.02, -s * 0.08, -s * 0.64, -s * 1.05, 0, -s * 1.08);
        ctx.bezierCurveTo( s * 0.64, -s * 1.05,  s * 1.02, -s * 0.08, s * 0.85, s * 0.20);
        ctx.bezierCurveTo( s * 0.55,  s * 0.42, -s * 0.55,  s * 0.42, -s * 0.85, s * 0.20);
        ctx.fillStyle = ink(0.08); ctx.fill();
        set(lw, 0.92); ctx.stroke();

        ctx.shadowBlur = 0;

        // Medulla boundary (inner layer)
        set(s / 55, 0.36);
        ctx.beginPath();
        ctx.moveTo(-s * 0.46, s * 0.08);
        ctx.bezierCurveTo(-s * 0.58, -s * 0.30, -s * 0.30, -s * 0.72, 0, -s * 0.74);
        ctx.bezierCurveTo( s * 0.30, -s * 0.72,  s * 0.58, -s * 0.30, s * 0.46, s * 0.08);
        ctx.bezierCurveTo( s * 0.28,  s * 0.25, -s * 0.28,  s * 0.25, -s * 0.46, s * 0.08);
        ctx.stroke();

        // Zona layers (horizontal hatching in cortex)
        set(s / 68, 0.22);
        for (let i = 0; i < 7; i++) {
            const y  = -s * 0.94 + i * s * 0.19;
            const hw = s * (0.18 + i * 0.10);
            ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
        }
    }

    /* ─────────────────────────────────────────────────────────────
       PANCREAS (Pankreas)
       Elongated: head (right, bulky) → body → tail (left, tapers up).
       Wirsung duct as central axis.
    ───────────────────────────────────────────────────────────── */
    function drawPancreas(ctx, s) {
        const lw = s / 28;
        ctx.shadowColor = ink(0.35); ctx.shadowBlur = s * 0.17;

        // Organ outline — very characteristic elongated curved shape
        ctx.beginPath();
        ctx.moveTo( s * 1.30,  s * 0.55);
        ctx.bezierCurveTo( s * 1.52,  s * 0.52,  s * 1.55, -s * 0.18,  s * 1.38, -s * 0.60);
        ctx.bezierCurveTo( s * 1.16, -s * 0.92,  s * 0.70, -s * 0.88,  s * 0.48, -s * 0.58);
        ctx.bezierCurveTo( s * 0.08, -s * 0.75, -s * 0.32, -s * 0.80, -s * 0.68, -s * 0.92);
        ctx.bezierCurveTo(-s * 0.96, -s * 1.00, -s * 1.38, -s * 1.02, -s * 1.52, -s * 0.72);
        ctx.bezierCurveTo(-s * 1.62, -s * 0.46, -s * 1.46, -s * 0.10, -s * 1.24,  s * 0.08);
        ctx.bezierCurveTo(-s * 0.94,  s * 0.32, -s * 0.32,  s * 0.58,  s * 0.28,  s * 0.60);
        ctx.bezierCurveTo( s * 0.72,  s * 0.62,  s * 1.08,  s * 0.60,  s * 1.30,  s * 0.55);
        ctx.fillStyle = ink(0.07); ctx.fill();
        set(lw, 0.92); ctx.stroke();

        ctx.shadowBlur = 0;

        // Wirsung duct (main duct — runs whole length as central axis)
        set(s / 42, 0.55);
        ctx.beginPath();
        ctx.moveTo( s * 1.32,  s * 0.14);
        ctx.bezierCurveTo( s * 0.62, -s * 0.06, -s * 0.42, -s * 0.22, -s * 1.28, -s * 0.30);
        ctx.stroke();

        // Accessory duct (Santorini) — short branch near head
        set(s / 58, 0.32);
        ctx.beginPath();
        ctx.moveTo( s * 1.10, -s * 0.12);
        ctx.quadraticCurveTo( s * 1.22, -s * 0.44,  s * 1.05, -s * 0.52);
        ctx.stroke();

        // Lobular septa
        set(s / 68, 0.22);
        for (let i = 0; i < 6; i++) {
            const x = -s * 1.08 + i * s * 0.46;
            ctx.beginPath();
            ctx.moveTo(x, -s * 0.50);
            ctx.quadraticCurveTo(x + s * 0.10, 0, x, s * 0.46);
            ctx.stroke();
        }

        // Uncinate process (small hook at bottom of head)
        set(lw * 0.80, 0.50);
        ctx.beginPath();
        ctx.moveTo( s * 1.02,  s * 0.55);
        ctx.bezierCurveTo( s * 0.78,  s * 0.88,  s * 0.36,  s * 0.85,  s * 0.30,  s * 0.60);
        ctx.stroke();
    }

    /* ─────────────────────────────────────────────────────────────
       OVARY (Pohlavné žľazy)
       Oval with Graafian follicles on surface — unmistakeable.
    ───────────────────────────────────────────────────────────── */
    function drawGonad(ctx, s) {
        const lw = s / 28;
        ctx.shadowColor = ink(0.38); ctx.shadowBlur = s * 0.18;

        // Tunica albuginea (outer capsule)
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.92, s * 0.70, Math.PI * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.08); ctx.fill();
        set(lw, 0.92); ctx.stroke();

        ctx.shadowBlur = 0;

        // Graafian follicles — the unique identifier of an ovary
        const fol = [
            [-0.48, -0.30, 0.22], [ 0.28, -0.42, 0.20], [ 0.58, -0.08, 0.16],
            [ 0.26,  0.38, 0.22], [-0.36,  0.34, 0.18], [-0.60,  0.08, 0.15],
            [ 0.04, -0.04, 0.12]
        ];
        fol.forEach(([fx, fy, fr]) => {
            // Follicle circle
            ctx.beginPath();
            ctx.arc(fx * s, fy * s, fr * s, 0, Math.PI * 2);
            set(s / 44, 0.72); ctx.stroke();
            // Oocyte nucleus dot
            if (fr > 0.16) {
                ctx.beginPath();
                ctx.arc(fx * s - fr * s * 0.25, fy * s - fr * s * 0.25, fr * s * 0.28, 0, Math.PI * 2);
                set(s / 66, 0.42); ctx.stroke();
            }
        });

        // Mesovarium ligament (cord exiting from one end)
        set(lw * 0.90, 0.52);
        ctx.beginPath();
        ctx.moveTo( s * 0.90,  s * 0.05);
        ctx.bezierCurveTo( s * 1.18, -s * 0.20,  s * 1.35, -s * 0.08,  s * 1.42,  s * 0.12);
        ctx.stroke();

        // Fimbriae at opposite end
        set(s / 52, 0.40);
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(-s * 0.90, i * s * 0.14);
            ctx.lineTo(-s * 1.18, i * s * 0.20 - s * 0.04);
            ctx.stroke();
        }
    }

    /* ─────────────────────────────────────────────────────────────
       PARATHYROID (Prištítne telieska)
       Four tiny ovals in 2×2 arrangement on thyroid posterior.
    ───────────────────────────────────────────────────────────── */
    function drawParathyroid(ctx, s) {
        const lw = s / 28;
        ctx.shadowColor = ink(0.35); ctx.shadowBlur = s * 0.16;

        const pos = [[-0.40, -0.48], [0.40, -0.48], [-0.40, 0.48], [0.40, 0.48]];
        pos.forEach(([px, py]) => {
            // Gland body
            ctx.beginPath();
            ctx.ellipse(px * s, py * s, s * 0.34, s * 0.25, Math.PI * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = ink(0.10); ctx.fill();
            set(lw, 0.90); ctx.stroke();
            // Inner parenchyma boundary
            ctx.beginPath();
            ctx.ellipse(px * s, py * s, s * 0.22, s * 0.16, Math.PI * 0.08, 0, Math.PI * 2);
            set(s / 60, 0.36); ctx.stroke();
        });

        ctx.shadowBlur = 0;

        // Connective tissue strands
        set(s / 65, 0.26);
        ctx.beginPath();
        ctx.moveTo(-s * 0.40, -s * 0.30); ctx.lineTo(-s * 0.40,  s * 0.30);
        ctx.moveTo( s * 0.40, -s * 0.30); ctx.lineTo( s * 0.40,  s * 0.30);
        ctx.moveTo(-s * 0.28, -s * 0.48); ctx.lineTo( s * 0.28, -s * 0.48);
        ctx.moveTo(-s * 0.28,  s * 0.48); ctx.lineTo( s * 0.28,  s * 0.48);
        ctx.stroke();
    }

    /* ── Animation engine ──────────────────────────────────────── */

    const DRAW_FNS = {
        thyroid: drawThyroid, pituitary: drawPituitary, adrenal: drawAdrenal,
        pancreas: drawPancreas, gonad: drawGonad, parathyroid: drawParathyroid
    };
    const TYPES = Object.keys(DRAW_FNS);

    function resizeHero() {
        heroCanvas.width  = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
    }

    function createGlands() {
        glands = [];
        // One of each type + one extra thyroid and one extra adrenal = 8 total
        [...TYPES, 'thyroid', 'adrenal'].forEach((type, i, arr) => {
            const col = (i + 0.5) / arr.length;
            glands.push({
                type,
                x:       (col + (Math.random() - 0.5) * 0.18) * heroCanvas.width,
                y:       (0.15 + Math.random() * 0.70) * heroCanvas.height,
                size:    Math.random() * 28 + 52,    // 52–80 px — large & clearly visible
                angle:   Math.random() * Math.PI * 2,
                vAngle:  (Math.random() - 0.5) * 0.0028,
                vx:      (Math.random() - 0.5) * 0.14,
                vy:      (Math.random() - 0.5) * 0.10,
                opacity: Math.random() * 0.12 + 0.30, // 0.30–0.42 — clearly visible
                phase:   Math.random() * Math.PI * 2
            });
        });
    }

    function animateVinci() {
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        t += 0.005;

        glands.forEach(g => {
            const fx = Math.sin(t * 0.30 + g.phase) * 11;
            const fy = Math.cos(t * 0.24 + g.phase) * 13;
            const op = g.opacity * (0.76 + 0.24 * Math.sin(t * 0.42 + g.phase));

            ctx.save();
            ctx.translate(g.x + fx, g.y + fy);
            ctx.rotate(g.angle);
            ctx.globalAlpha = op;

            DRAW_FNS[g.type](ctx, g.size);

            ctx.restore();

            g.angle += g.vAngle;
            g.x     += g.vx;
            g.y     += g.vy;
            const pad = g.size * 3;
            if (g.x < -pad) g.x = heroCanvas.width  + pad;
            if (g.x > heroCanvas.width  + pad) g.x = -pad;
            if (g.y < -pad) g.y = heroCanvas.height + pad;
            if (g.y > heroCanvas.height + pad) g.y = -pad;
        });

        animFrame = requestAnimationFrame(animateVinci);
    }

    resizeHero();
    createGlands();
    animateVinci();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animFrame);
        resizeHero();
        createGlands();
        animateVinci();
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

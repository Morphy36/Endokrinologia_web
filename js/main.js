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
   Hero Canvas — Da Vinci–style anatomical endocrine glands
   Sepia ink-line illustrations floating on dark background
   ============================================ */
const heroCanvas = document.getElementById('heroParticles');

if (heroCanvas) {
    const ctx  = heroCanvas.getContext('2d');
    let glands = [];
    let animFrame;
    let t = 0;

    // Warm sepia ink colour (Da Vinci iron-gall ink palette)
    const S = [220, 188, 132]; // main sepia RGB
    const ink  = (a) => `rgba(${S[0]},${S[1]},${S[2]},${a})`;

    /* ── Individual gland drawing functions ──────────────────── */

    function drawThyroid(ctx, s) {
        const lobe = s * 0.60;
        ctx.shadowColor = ink(0.25); ctx.shadowBlur = 6;

        // Outline each lobe
        [[-lobe, 0], [lobe, 0]].forEach(([ox]) => {
            ctx.beginPath();
            ctx.ellipse(ox, 0, s, s * 0.64, 0, 0, Math.PI * 2);
            ctx.fillStyle   = ink(0.05);
            ctx.strokeStyle = ink(0.88);
            ctx.lineWidth   = 1.1;
            ctx.fill(); ctx.stroke();
        });

        // Isthmus
        ctx.beginPath();
        ctx.ellipse(0, s * 0.08, s * 0.12, s * 0.28, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.08); ctx.strokeStyle = ink(0.75);
        ctx.lineWidth = 0.9; ctx.fill(); ctx.stroke();

        // Lobular interior lines (light hatch)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ink(0.28); ctx.lineWidth = 0.5;
        [-lobe, lobe].forEach(ox => {
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.ellipse(ox, i * s * 0.2, s * 0.6, s * 0.2, 0, 0, Math.PI);
                ctx.stroke();
            }
        });

        // Superior vessels
        ctx.strokeStyle = ink(0.45); ctx.lineWidth = 0.8;
        [[-lobe - s * 0.1, -s * 0.62], [lobe + s * 0.1, -s * 0.62]].forEach(([vx, vy]) => {
            ctx.beginPath();
            ctx.moveTo(vx, vy); ctx.lineTo(vx - s * 0.05, vy - s * 0.35);
            ctx.moveTo(vx + s * 0.12, vy); ctx.lineTo(vx + s * 0.16, vy - s * 0.32);
            ctx.stroke();
        });
    }

    function drawPituitary(ctx, s) {
        ctx.shadowColor = ink(0.3); ctx.shadowBlur = 5;

        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.92, s * 0.76, 0, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.06); ctx.strokeStyle = ink(0.88); ctx.lineWidth = 1.1;
        ctx.fill(); ctx.stroke();

        // Anterior / posterior division
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ink(0.32); ctx.lineWidth = 0.55;
        ctx.beginPath(); ctx.moveTo(0, -s * 0.72); ctx.lineTo(0, s * 0.72); ctx.stroke();

        // Pituitary stalk (infundibulum)
        ctx.strokeStyle = ink(0.82); ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-s * 0.16, -s * 0.73);
        ctx.quadraticCurveTo(-s * 0.04, -s * 1.05, 0, -s * 1.45);
        ctx.moveTo(s * 0.16, -s * 0.73);
        ctx.quadraticCurveTo(s * 0.04, -s * 1.05, 0, -s * 1.45);
        ctx.stroke();

        // Sella turcica (bony cavity arc)
        ctx.strokeStyle = ink(0.55); ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(0, s * 0.05, s * 1.12, Math.PI * 0.08, Math.PI * 0.92); ctx.stroke();
        ctx.strokeStyle = ink(0.45); ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-s * 1.08, s * 0.30); ctx.lineTo(-s * 1.18, -s * 0.15);
        ctx.moveTo( s * 1.08, s * 0.30); ctx.lineTo( s * 1.18, -s * 0.15);
        ctx.stroke();
    }

    function drawAdrenal(ctx, s) {
        ctx.shadowColor = ink(0.28); ctx.shadowBlur = 5;

        // Outer cap / hat shape
        ctx.beginPath();
        ctx.moveTo(-s * 0.78, s * 0.18);
        ctx.bezierCurveTo(-s * 0.94, -s * 0.08, -s * 0.58, -s * 0.98, 0, -s * 1.02);
        ctx.bezierCurveTo( s * 0.58, -s * 0.98,  s * 0.94, -s * 0.08, s * 0.78, s * 0.18);
        ctx.bezierCurveTo( s * 0.50,  s * 0.38, -s * 0.50,  s * 0.38, -s * 0.78, s * 0.18);
        ctx.fillStyle = ink(0.06); ctx.strokeStyle = ink(0.88); ctx.lineWidth = 1.1;
        ctx.fill(); ctx.stroke();

        // Inner medulla layer
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ink(0.32); ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(-s * 0.42, s * 0.05);
        ctx.bezierCurveTo(-s * 0.52, -s * 0.32, -s * 0.28, -s * 0.68, 0, -s * 0.70);
        ctx.bezierCurveTo( s * 0.28, -s * 0.68,  s * 0.52, -s * 0.32, s * 0.42, s * 0.05);
        ctx.bezierCurveTo( s * 0.26,  s * 0.22, -s * 0.26,  s * 0.22, -s * 0.42, s * 0.05);
        ctx.stroke();

        // Cortex horizontal hatching
        ctx.strokeStyle = ink(0.18); ctx.lineWidth = 0.45;
        for (let i = 0; i < 5; i++) {
            const y = -s * 0.82 + i * s * 0.2;
            const hw = s * (0.25 + i * 0.12);
            ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
        }
    }

    function drawPancreas(ctx, s) {
        ctx.shadowColor = ink(0.25); ctx.shadowBlur = 5;

        // Main organ body (elongated with head, body, tail)
        ctx.beginPath();
        ctx.moveTo(-s * 1.12, -s * 0.18);
        ctx.bezierCurveTo(-s * 1.22, -s * 0.58, -s * 0.50, -s * 0.88, 0, -s * 0.62);
        ctx.bezierCurveTo( s * 0.58, -s * 0.36,  s * 1.08,  s * 0.06, s * 1.22, s * 0.48);
        ctx.bezierCurveTo( s * 1.00,  s * 0.76,  s * 0.42,  s * 0.76, 0, s * 0.52);
        ctx.bezierCurveTo(-s * 0.62,  s * 0.30, -s * 1.04,  s * 0.16, -s * 1.12, -s * 0.18);
        ctx.fillStyle = ink(0.05); ctx.strokeStyle = ink(0.88); ctx.lineWidth = 1.1;
        ctx.fill(); ctx.stroke();

        // Wirsung duct (main pancreatic duct)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ink(0.48); ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(-s * 0.98, -s * 0.02);
        ctx.bezierCurveTo(-s * 0.52, -s * 0.22, s * 0.52, -s * 0.06, s * 1.12, s * 0.36);
        ctx.stroke();

        // Accessory duct
        ctx.strokeStyle = ink(0.28); ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.62, -s * 0.12);
        ctx.quadraticCurveTo(-s * 0.40, -s * 0.40, -s * 0.22, -s * 0.48);
        ctx.stroke();

        // Lobular dividers
        ctx.strokeStyle = ink(0.20); ctx.lineWidth = 0.45;
        for (let i = 0; i < 5; i++) {
            const x = -s * 0.82 + i * s * 0.38;
            ctx.beginPath();
            ctx.moveTo(x, -s * 0.30); ctx.quadraticCurveTo(x + s * 0.08, 0, x, s * 0.28);
            ctx.stroke();
        }
    }

    function drawGonad(ctx, s) {
        ctx.shadowColor = ink(0.28); ctx.shadowBlur = 5;

        // Ovary outline
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.90, s * 0.70, Math.PI * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = ink(0.06); ctx.strokeStyle = ink(0.88); ctx.lineWidth = 1.1;
        ctx.fill(); ctx.stroke();

        // Surface follicles (Graafian follicles characteristic of ovary)
        ctx.shadowBlur = 0;
        const follicles = [
            [-0.44, -0.34, 0.20], [0.24, -0.44, 0.16], [0.56, -0.10, 0.13],
            [0.22,  0.38,  0.17], [-0.34, 0.32, 0.15], [-0.56, 0.04, 0.12]
        ];
        follicles.forEach(([fx, fy, fr]) => {
            ctx.beginPath();
            ctx.arc(fx * s, fy * s, fr * s, 0, Math.PI * 2);
            ctx.strokeStyle = ink(0.62); ctx.lineWidth = 0.75;
            ctx.stroke();
            // Follicle highlight dot
            ctx.beginPath();
            ctx.arc(fx * s - fr * s * 0.3, fy * s - fr * s * 0.3, fr * s * 0.22, 0, Math.PI * 2);
            ctx.strokeStyle = ink(0.38); ctx.lineWidth = 0.4; ctx.stroke();
        });

        // Ovarian ligament
        ctx.strokeStyle = ink(0.48); ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(s * 0.88, 0);
        ctx.quadraticCurveTo(s * 1.15, -s * 0.28, s * 1.32, -s * 0.12);
        ctx.stroke();
    }

    function drawParathyroid(ctx, s) {
        ctx.shadowColor = ink(0.28); ctx.shadowBlur = 5;

        // 4 parathyroid glands arranged 2×2 (anatomical placement)
        const positions = [[-0.32, -0.38], [0.32, -0.38], [-0.32, 0.38], [0.32, 0.38]];
        positions.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.ellipse(px * s, py * s, s * 0.28, s * 0.20, Math.PI * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = ink(0.08); ctx.strokeStyle = ink(0.85); ctx.lineWidth = 1.0;
            ctx.fill(); ctx.stroke();
            // Interior capsule hint
            ctx.beginPath();
            ctx.ellipse(px * s, py * s, s * 0.17, s * 0.12, Math.PI * 0.1, 0, Math.PI * 2);
            ctx.strokeStyle = ink(0.32); ctx.lineWidth = 0.45; ctx.stroke();
        });

        ctx.shadowBlur = 0;
        // Connecting tissue lines between glands
        ctx.strokeStyle = ink(0.22); ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.32, -s * 0.28); ctx.lineTo(-s * 0.32, s * 0.28);
        ctx.moveTo( s * 0.32, -s * 0.28); ctx.lineTo( s * 0.32, s * 0.28);
        ctx.moveTo(-s * 0.22, -s * 0.38); ctx.lineTo( s * 0.22, -s * 0.38);
        ctx.moveTo(-s * 0.22,  s * 0.38); ctx.lineTo( s * 0.22,  s * 0.38);
        ctx.stroke();
    }

    const DRAW_FNS = {
        thyroid: drawThyroid, pituitary: drawPituitary, adrenal: drawAdrenal,
        pancreas: drawPancreas, gonad: drawGonad, parathyroid: drawParathyroid
    };
    const TYPES = ['thyroid', 'pituitary', 'adrenal', 'pancreas', 'gonad', 'parathyroid'];

    function resizeHero() {
        heroCanvas.width  = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
    }

    function createGlands() {
        glands = [];
        // Each type appears 1-2 times, scattered
        const typeList = [...TYPES, 'thyroid', 'adrenal', 'gonad'];
        typeList.forEach((type, i) => {
            glands.push({
                type,
                x:       (i / typeList.length + Math.random() * 0.15) * heroCanvas.width,
                y:       Math.random() * heroCanvas.height,
                size:    Math.random() * 22 + 16,
                angle:   Math.random() * Math.PI * 2,
                vAngle:  (Math.random() - 0.5) * 0.0035,
                vx:      (Math.random() - 0.5) * 0.16,
                vy:      (Math.random() - 0.5) * 0.12,
                opacity: Math.random() * 0.20 + 0.08,
                phase:   Math.random() * Math.PI * 2
            });
        });
    }

    function animateVinci() {
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        t += 0.006;

        glands.forEach(g => {
            const fx = Math.sin(t * 0.32 + g.phase) * 9;
            const fy = Math.cos(t * 0.27 + g.phase) * 11;
            const op = g.opacity * (0.72 + 0.28 * Math.sin(t * 0.45 + g.phase));

            ctx.save();
            ctx.translate(g.x + fx, g.y + fy);
            ctx.rotate(g.angle);
            ctx.globalAlpha = op;

            DRAW_FNS[g.type](ctx, g.size);

            ctx.restore();

            // Drift
            g.angle += g.vAngle;
            g.x += g.vx;
            g.y += g.vy;
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

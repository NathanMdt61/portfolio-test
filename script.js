/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
});

(function animRing() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
})();

/* ══════════════════════════════════════════════════════
   LOADER
══════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500);
});

/* ══════════════════════════════════════════════════════
   PARTICLE CANVAS
══════════════════════════════════════════════════════ */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let pts = [];
let mouse = { x: -9999, y: -9999 };

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Pt {
    constructor() { this.spawn(true); }
    spawn(random) {
        this.x  = random ? Math.random() * canvas.width  : (Math.random() > .5 ? 0 : canvas.width);
        this.y  = random ? Math.random() * canvas.height : Math.random() * canvas.height;
        this.vx = (Math.random() - .5) * .28;
        this.vy = (Math.random() - .5) * .28;
        this.r  = Math.random() * 1.4 + .3;
        this.a  = Math.random() * .22 + .04;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20)
            this.spawn(false);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,255,87,${this.a})`;
        ctx.fill();
    }
}

function initParticles() {
    const n = Math.min(Math.floor(canvas.width * canvas.height / 10000), 100);
    pts = Array.from({ length: n }, () => new Pt());
}

function drawConnections() {
    const D = 120;
    for (let i = 0; i < pts.length; i++) {
        const dmx = pts[i].x - mouse.x, dmy = pts[i].y - mouse.y;
        const md = Math.sqrt(dmx * dmx + dmy * dmy);
        if (md < D * 1.6) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(184,255,87,${(1 - md / (D * 1.6)) * .28})`;
            ctx.lineWidth = .5; ctx.stroke();
        }
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < D) {
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = `rgba(184,255,87,${(1 - d / D) * .1})`;
                ctx.lineWidth = .5; ctx.stroke();
            }
        }
    }
}

function loopCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loopCanvas);
}

resize(); initParticles(); loopCanvas();
window.addEventListener('resize', () => { resize(); initParticles(); });

const heroEl = document.getElementById('hero');
heroEl.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
heroEl.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

/* ══════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════ */
const phrases = [
    'Développeur Web',
    'Concepteur 3D · BTS CPDE',
    'En formation au Wagon',
    'Passionné de Tech & Gaming',
    'Amateur de Pêche en Rivière'
];
let pi = 0, ci = 0, deleting = false;
const typEl = document.getElementById('typewriter');

function typeLoop() {
    const current = phrases[pi];
    if (!deleting) {
        typEl.textContent = current.slice(0, ++ci);
        if (ci === current.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
    } else {
        typEl.textContent = current.slice(0, --ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(typeLoop, deleting ? 40 : 85);
}
setTimeout(typeLoop, 1900);

/* ══════════════════════════════════════════════════════
   NAV SCROLL
══════════════════════════════════════════════════════ */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   INTERSECTION OBSERVER — reveal bidirectionnel + skill bars
══════════════════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.querySelectorAll('.sb-fill').forEach(bar => {
                bar.style.width = bar.dataset.w + '%';
            });
        } else {
            entry.target.classList.remove('revealed');
            entry.target.querySelectorAll('.sb-fill').forEach(bar => {
                bar.style.width = '0';
            });
        }
    });
}, { threshold: .12, rootMargin: '-30px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => io.observe(el));

/* ══════════════════════════════════════════════════════
   SMOOTH SCROLL NAV — easing cubic custom
══════════════════════════════════════════════════════ */
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothNavScroll(target, duration = 1000) {
    const navH   = document.getElementById('navbar').offsetHeight;
    const startY = window.scrollY;
    const endY   = target.getBoundingClientRect().top + window.scrollY - navH;
    const dist   = endY - startY;
    let t0 = null;
    function step(ts) {
        if (!t0) t0 = ts;
        const prog = Math.min((ts - t0) / duration, 1);
        window.scrollTo(0, startY + dist * easeInOutCubic(prog));
        if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) smoothNavScroll(el);
    });
});

/* ══════════════════════════════════════════════════════
   DEFINITIONS DATA
══════════════════════════════════════════════════════ */
const defs = {
    wagon: {
        title: 'Le Wagon',
        type: 'Bootcamp · Développement Web Full-Stack',
        body: 'Le Wagon est l\'un des meilleurs bootcamps de développement web au monde (classé #1 sur Switchup), présent dans plus de 40 villes. La formation intensive de 9 semaines couvre : HTML, CSS, JavaScript, SQL, Ruby on Rails, APIs REST, Git & GitHub et le déploiement en production. L\'approche est 100 % pratique, orientée projet, encadrée par des développeurs expérimentés.',
        themes: ['HTML · CSS · JS', 'Ruby on Rails', 'SQL & BDD', 'Git & GitHub', 'APIs REST', 'Agile'],
        link: 'https://www.lewagon.com/fr',
        linkLabel: '→ Visiter le site officiel de Le Wagon'
    },
    cpde: {
        title: 'BTS CPDE',
        type: 'Brevet de Technicien Supérieur · 2 ans post-bac',
        body: 'Le BTS CPDE (Conception des Processus de Découpe et d\'Emboutissage) forme des techniciens spécialisés dans la conception d\'outillages industriels pour la mise en forme des métaux en feuilles. On y apprend la modélisation 3D sur Catia V5 et SolidWorks, la simulation de mise en forme avec AutoForm, le dessin industriel et la gestion de projets techniques.',
        themes: ['Catia V5', 'SolidWorks', 'AutoForm', 'Dessin industriel', 'Bureau d\'études', 'Emboutissage'],
        link: null
    },
    mmi: {
        title: 'BUT MMI',
        type: 'Bachelor Universitaire de Technologie · 3 ans',
        body: 'Le BUT MMI (Métiers du Multimédia et de l\'Internet) forme des profils polyvalents du numérique, à mi-chemin entre développement et communication. Au programme : développement web (HTML, CSS, JS, PHP), design UX/UI, gestion de projets digitaux, création de contenus, référencement SEO/SEA et communication numérique.',
        themes: ['Dev Web', 'UX/UI Design', 'Communication', 'Multimédia', 'SEO', 'Gestion de projet'],
        link: null
    },
    sti2d: {
        title: 'Baccalauréat STI2D',
        type: 'Baccalauréat Technologique · 3 ans',
        body: 'Le Bac STI2D (Sciences et Technologies de l\'Industrie et du Développement Durable) est un baccalauréat technologique orienté vers les métiers de l\'ingénierie. Au programme : mécanique, électronique, informatique industrielle, énergie et développement durable.',
        themes: ['Mécanique', 'Électronique', 'Informatique industrielle', 'Énergie', 'Développement durable'],
        link: null
    },
    onepiece: { title: 'One Piece', type: 'Anime · 1100+ épisodes · 1999–présent', body: 'Monkey D. Luffy rêve de devenir le Roi des Pirates en trouvant le légendaire trésor "One Piece". Avec plus de 25 ans d\'existence, One Piece est la plus grande épopée de l\'histoire du manga/anime : une œuvre qui mêle aventure débridée, émotions profondes, humour et une construction narrative d\'une richesse inégalée.', themes: ['Liberté', 'Nakama (Amitié)', 'Rêves', 'Aventure', 'Justice', 'Famille'] },
    aot: { title: 'Attack on Titan', type: 'Anime · 87 épisodes · 2013–2023', body: 'L\'humanité survit derrière d\'immenses murs pour se protéger des Titans. Eren Jaeger jure de les exterminer après avoir vu sa mère être dévorée. Une œuvre monumentale, sombre et philosophique sur la liberté et le cycle de la violence.', themes: ['Liberté', 'Guerre', 'Sacrifice', 'Humanité', 'Politique'] },
    naruto: { title: 'Naruto / Naruto Shippuden', type: 'Anime · 720 épisodes · 2002–2017', body: 'Naruto Uzumaki, jeune ninja rejeté de son village car il porte en lui le Renard à neuf queues, rêve de devenir Hokage. À travers des combats épiques, des amitiés indéfectibles et des épreuves dévastatrices, il grandit et forge sa légende.', themes: ['Amitié', 'Persévérance', 'Rêves', 'Famille', 'Sacrifice'] },
    hxh: { title: 'Hunter x Hunter', type: 'Anime · 148 épisodes · 2011–2014', body: 'Gon Freecss quitte son île natale pour passer l\'examen des Chasseurs et retrouver son père légendaire. Considéré comme l\'un des meilleurs shōnen jamais créés, grâce à sa profondeur narrative et philosophique.', themes: ['Amitié', 'Pouvoir', 'Philosophie', 'Ambition', 'Stratégie'] },
    deathnote: { title: 'Death Note', type: 'Anime · 37 épisodes · 2006–2007', body: 'Light Yagami trouve un carnet de la mort qui permet de tuer quiconque dont il écrit le nom. Décidé à purger le monde des criminels, il entre dans un duel psychologique intense avec le mystérieux détective L.', themes: ['Justice', 'Pouvoir', 'Morale', 'Dualité', 'Psychologie'] },
    opm: { title: 'One Punch Man', type: 'Anime · 24 épisodes · 2015–2019', body: 'Saitama est un héros capable de vaincre n\'importe quel adversaire d\'un seul coup de poing. Cette puissance absolue lui apporte un problème inattendu : l\'ennui total. Déconstruction hilarante du genre super-héroïque.', themes: ['Héroïsme', 'Existentialisme', 'Humour', 'Action', 'Satire'] },
    demonslayer: { title: 'Demon Slayer', type: 'Anime · 63 épisodes · 2019–présent', body: 'Après avoir trouvé sa famille massacrée et sa sœur Nezuko transformée en démon, Tanjiro Kamado devient pourfendeur de démons pour trouver un remède. Portée par des animations époustouflantes du studio Ufotable.', themes: ['Famille', 'Détermination', 'Humanité', 'Sacrifice', 'Fraternité'] },
    assassin: { title: 'Assassination Classroom', type: 'Anime · 47 épisodes · 2015–2016', body: 'La classe 3-E reçoit une mission impossible : assassiner Koro-sensei, une créature capable de voler à Mach 20 qui se révèle être le meilleur professeur qu\'ils aient jamais eu. Un shōnen touchant sur l\'éducation.', themes: ['Éducation', 'Confiance', 'Ambition', 'Humour', 'Croissance'] },
    sololeveling: { title: 'Solo Leveling', type: 'Anime · 25 épisodes · 2024–présent', body: 'Dans un monde où des portails magiques font apparaître des monstres, Sung Jin-Woo est le chasseur le plus faible. Après une quasi-mort, il obtient un système unique qui lui permet de progresser sans limite.', themes: ['Dépassement de soi', 'Pouvoir', 'Survie', 'Progression', 'Fantasy'] }
};

/* ══════════════════════════════════════════════════════
   DEFINITION PANEL
══════════════════════════════════════════════════════ */
const defPanel   = document.getElementById('def-panel');
const defClose   = document.getElementById('def-close');
const defTypeEl  = document.getElementById('def-type');
const defTitleEl = document.getElementById('def-title');
const defBodyEl  = document.getElementById('def-body');
const defThemes  = document.getElementById('def-themes');
const defLinkEl  = document.getElementById('def-link-el');

function openDef(key) {
    const d = defs[key]; if (!d) return;
    defTypeEl.textContent  = d.type;
    defTitleEl.textContent = d.title;
    defBodyEl.textContent  = d.body;
    defThemes.innerHTML = d.themes
        ? d.themes.map(t => `<span class="def-theme-tag">${t}</span>`).join('') : '';
    if (d.link) {
        defLinkEl.href = d.link; defLinkEl.textContent = d.linkLabel;
        defLinkEl.classList.add('show');
    } else {
        defLinkEl.classList.remove('show');
    }
    defPanel.classList.add('open');
}
function closeDef() { defPanel.classList.remove('open'); }

defClose.addEventListener('click', closeDef);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDef(); });
document.querySelectorAll('.term-link').forEach(el => el.addEventListener('click', () => openDef(el.dataset.def)));
document.querySelectorAll('.anime-card-item').forEach(el => el.addEventListener('click', () => openDef(el.dataset.def)));

/* ══════════════════════════════════════════════════════
   MUSIC PLAYER + VOLUME
══════════════════════════════════════════════════════ */
const audio     = document.getElementById('bg-music');
const musicBtn  = document.getElementById('music-btn');
const volWrap   = document.getElementById('volume-wrap');
const volSlider = document.getElementById('volume-slider');
let isPlaying   = false;

audio.volume = 0.5;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        musicBtn.innerHTML = '<span class="ring"></span>🎵';
        musicBtn.classList.remove('playing');
        volWrap.classList.remove('show');
    } else {
        audio.play().catch(() => {});
        musicBtn.innerHTML = '<span class="ring"></span>🔊';
        musicBtn.classList.add('playing');
        volWrap.classList.add('show');
    }
    isPlaying = !isPlaying;
});

volSlider.addEventListener('input', () => {
    audio.volume = volSlider.value;
    const pct = volSlider.value * 100;
    volSlider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--surface2) ${pct}%)`;
});

/* ══════════════════════════════════════════════════════
   FORM SUBMIT
══════════════════════════════════════════════════════ */
function submitForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-submit');
    const span = btn.querySelector('span');
    span.textContent = '✓ Message envoyé';
    btn.style.background = '#4ade80';
    setTimeout(() => {
        span.textContent = 'Envoyer';
        btn.style.background = '';
        e.target.reset();
    }, 3500);
}

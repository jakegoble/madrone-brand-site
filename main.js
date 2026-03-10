/* ============================================
   MADRONE STUDIOS — Scroll Animations & Interactions
   v4.0 — Lenis smooth scroll, mobile menu, varied reveals
   ============================================ */

(function () {
    'use strict';

    // ── Lenis Smooth Scroll ──────────────────────────────
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        // Connect Lenis → GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            // Fallback RAF loop if GSAP unavailable
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    } catch (e) {
        console.warn('Lenis init skipped:', e.message);
    }

    // Ensure GSAP is available for the rest
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded');
        var pl = document.getElementById('preloader');
        if (pl) setTimeout(function () { pl.classList.add('is-hidden'); }, 2000);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Preloader ────────────────────────────────────────
    const preloader = document.getElementById('preloader');
    let animationsInitialized = false;

    function finishPreloaderDismiss() {
        if (preloader) {
            preloader.classList.add('is-hidden');
            preloader.style.display = 'none';
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            preloader.style.pointerEvents = 'none';
        }
        if (!animationsInitialized) {
            animationsInitialized = true;
            try {
                initAnimations();
                ScrollTrigger.refresh();
            } catch (e) {
                console.warn('Animation init error:', e);
            }
        }
    }

    function dismissPreloader() {
        if (animationsInitialized) return;
        try {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: finishPreloaderDismiss
            });
        } catch (e) {
            finishPreloaderDismiss();
        }
        setTimeout(function () {
            if (preloader && getComputedStyle(preloader).opacity !== '0') {
                preloader.style.transition = 'opacity 0.5s ease';
                preloader.style.opacity = '0';
                setTimeout(finishPreloaderDismiss, 600);
            }
        }, 1500);
    }

    if (document.readyState === 'complete') {
        setTimeout(dismissPreloader, 400);
    } else {
        window.addEventListener('load', function () { setTimeout(dismissPreloader, 400); });
        setTimeout(dismissPreloader, 3000);
    }
    setTimeout(function () {
        if (preloader && !preloader.classList.contains('is-hidden')) {
            preloader.style.transition = 'opacity 0.3s ease';
            preloader.style.opacity = '0';
            setTimeout(finishPreloaderDismiss, 400);
        }
    }, 5000);

    // ── Cursor Glow ──────────────────────────────────────
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX, glowY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursorGlow() {
            glowX += (mouseX - glowX) * 0.06;
            glowY += (mouseY - glowY) * 0.06;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(updateCursorGlow);
        }
        requestAnimationFrame(updateCursorGlow);
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    // ── Progress Bar ─────────────────────────────────────
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    if (docHeight > 0) {
                        progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ── Mobile Menu (Hamburger) ──────────────────────────
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-open');
            hamburger.setAttribute('aria-expanded', isOpen);

            // Lock/unlock scroll
            if (lenis) {
                isOpen ? lenis.stop() : lenis.start();
            }
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                if (lenis) lenis.start();
                document.body.style.overflow = '';
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                mobileMenu.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                if (lenis) lenis.start();
                document.body.style.overflow = '';
            }
        });
    }

    // ── Navigation ───────────────────────────────────────
    const nav = document.getElementById('mainNav');
    const sections = document.querySelectorAll('.section');
    const navDotsContainer = document.getElementById('navDots');

    if (navDotsContainer) {
        sections.forEach((section, i) => {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => {
                if (lenis) {
                    lenis.scrollTo(section, { offset: 0, duration: 1.2 });
                } else {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });
            navDotsContainer.appendChild(dot);
        });
    }

    const navDots = document.querySelectorAll('.nav-dot');

    let navTicking = false;
    window.addEventListener('scroll', () => {
        if (!navTicking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                if (nav) nav.classList.toggle('is-scrolled', scrollTop > 80);

                let current = 0;
                sections.forEach((section, i) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.5) current = i;
                });
                navDots.forEach((dot, i) => {
                    dot.classList.toggle('is-active', i === current);
                });

                navTicking = false;
            });
            navTicking = true;
        }
    }, { passive: true });

    // ── Reveal Helpers ───────────────────────────────────
    // Standard reveal with fromTo for hidden-tab resilience
    function scrollReveal(targets, triggerEl, fromVars, toVars, scrollOpts) {
        var defaults = { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0 };
        var to = Object.assign({}, defaults, toVars || {}, {
            scrollTrigger: Object.assign({
                trigger: triggerEl,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }, scrollOpts || {})
        });
        return gsap.fromTo(targets, fromVars, to);
    }

    // Clip-path wipe reveal (bottom to top)
    function clipReveal(targets, triggerEl, scrollOpts) {
        return gsap.fromTo(targets,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.2,
                ease: 'power3.inOut',
                scrollTrigger: Object.assign({
                    trigger: triggerEl,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }, scrollOpts || {})
            }
        );
    }

    // ── Main Animations ──────────────────────────────────
    function initAnimations() {

        // ── Hero Entrance (immediate, no scroll trigger) ──
        const heroTl = gsap.timeline();
        heroTl
            .fromTo('.hero-eyebrow',
                { opacity: 0, y: 20, letterSpacing: '0.2em' },
                { opacity: 1, y: 0, letterSpacing: '0.35em', duration: 1, ease: 'power3.out' }
            )
            .fromTo('.title-line',
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1.4, stagger: 0.18, ease: 'expo.out' },
                '-=0.5'
            )
            .fromTo('.hero-subtitle',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
                '-=0.5'
            )
            .fromTo('.hero-line',
                { scaleX: 0, transformOrigin: 'left center' },
                { scaleX: 1, duration: 1, ease: 'power2.inOut' },
                '-=0.4'
            )
            .fromTo('.scroll-indicator',
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
                '-=0.2'
            );

        // Safety for hero content in frozen tabs
        setTimeout(function () {
            document.querySelectorAll('.hero-eyebrow, .title-line, .hero-subtitle, .hero-line, .scroll-indicator').forEach(function (el) {
                if (getComputedStyle(el).opacity === '0') {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                }
            });
        }, 3000);

        // ── Section Labels — fade + letter-spacing ──
        document.querySelectorAll('.section-label').forEach(el => {
            scrollReveal(el, el,
                { opacity: 0, y: 12, letterSpacing: '0.15em' },
                { letterSpacing: '0.3em', duration: 0.9 },
                { start: 'top 88%' }
            );
        });

        // ── Section Headlines — slide up, bold entrance ──
        document.querySelectorAll('.section-headline').forEach(el => {
            scrollReveal(el, el,
                { opacity: 0, y: 40 },
                { duration: 1.1, ease: 'expo.out' },
                { start: 'top 88%' }
            );
        });

        // ── Section Body — gentle fade ──
        document.querySelectorAll('.section-body').forEach(el => {
            scrollReveal(el, el,
                { opacity: 0, y: 18 },
                { duration: 0.85, delay: 0.1, ease: 'power2.out' },
                { start: 'top 88%' }
            );
        });

        // ── Generic [data-reveal] ──
        document.querySelectorAll('[data-reveal]').forEach(el => {
            scrollReveal(el, el,
                { opacity: 0, y: 30 },
                { duration: 0.9 },
                { start: 'top 90%' }
            );
        });

        // ── Glass Cards — stagger with slight scale ──
        document.querySelectorAll('.cards-grid').forEach(grid => {
            const cards = grid.querySelectorAll('.glass-card');
            scrollReveal(cards, grid,
                { opacity: 0, y: 50, scale: 0.96 },
                { duration: 0.9, stagger: 0.12, ease: 'power3.out' },
                { start: 'top 82%' }
            );
        });

        // ── Pillar Cards — cascade from bottom with rotation ──
        const pillarCards = document.querySelectorAll('.pillar-card');
        if (pillarCards.length) {
            scrollReveal(pillarCards, '.pillars-grid',
                { opacity: 0, y: 60, rotationX: 8 },
                { duration: 1, stagger: 0.18, ease: 'power3.out', rotationX: 0 },
                { start: 'top 82%' }
            );
        }

        // ── Service Pills — pop in with elastic ease ──
        const pills = document.querySelectorAll('.service-pill');
        if (pills.length) {
            scrollReveal(pills, '.service-pillars',
                { opacity: 0, y: 20, scale: 0.8 },
                { duration: 0.7, stagger: 0.06, ease: 'back.out(2)' }
            );
        }

        // ── Capability Items — slide in from left ──
        const capItems = document.querySelectorAll('.capability-item');
        if (capItems.length) {
            scrollReveal(capItems, '.capabilities-list',
                { opacity: 0, x: -40 },
                { duration: 0.7, stagger: 0.08, ease: 'power3.out' },
                { start: 'top 82%' }
            );
        }

        // ── Animated Counters ──
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            const obj = { val: 0 };

            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    gsap.to(obj, {
                        val: target,
                        duration: 2.2,
                        ease: 'power2.out',
                        onUpdate: () => { el.textContent = Math.round(obj.val); }
                    });
                }
            });
        });

        // ── Stat Card Counters ──
        document.querySelectorAll('.stat-card-number[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            const obj = { val: 0 };

            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => { el.textContent = Math.round(obj.val); }
                    });
                }
            });
        });

        // ── Budget Table Rows — slide from left ──
        const budgetRows = document.querySelectorAll('.budget-row');
        if (budgetRows.length) {
            scrollReveal(budgetRows, '.budget-table',
                { opacity: 0, x: -25 },
                { duration: 0.6, stagger: 0.07, ease: 'power2.out' }
            );
        }

        // ── Background Parallax ──
        document.querySelectorAll('.bg-image').forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.closest('.section'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                },
                y: -60,
                scale: 1.08,
                ease: 'none'
            });
        });

        // ── CTA Button — scale pop ──
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            scrollReveal(ctaButton, ctaButton,
                { opacity: 0, y: 20, scale: 0.92 },
                { duration: 0.9, ease: 'back.out(1.8)' },
                { start: 'top 92%' }
            );
        }

        // ── Engagement Cards — stagger with scale ──
        const engCards = document.querySelectorAll('.engagement-card');
        if (engCards.length) {
            scrollReveal(engCards, '.engagement-options',
                { opacity: 0, y: 50, scale: 0.95 },
                { duration: 1, stagger: 0.2, ease: 'power3.out' }
            );
        }

        // ── Venue Details — stagger fade ──
        const venueDetails = document.querySelectorAll('.venue-detail');
        if (venueDetails.length) {
            scrollReveal(venueDetails, '.venue-details',
                { opacity: 0, y: 20 },
                { duration: 0.7, stagger: 0.12, ease: 'power2.out' }
            );
        }

        // ── Case Study Cards — clip-path wipe ──
        const caseCards = document.querySelectorAll('.case-card');
        if (caseCards.length) {
            scrollReveal(caseCards, '.case-studies-grid',
                { opacity: 0, y: 50 },
                { duration: 1, stagger: 0.2, ease: 'power3.out' }
            );
        }

        // ── Partner Cards — scale pop stagger ──
        const partnerCards = document.querySelectorAll('.partner-card');
        if (partnerCards.length) {
            scrollReveal(partnerCards, '.partners-grid',
                { opacity: 0, scale: 0.85 },
                { duration: 0.7, stagger: 0.08, ease: 'back.out(1.4)' }
            );
        }

        // ── Team Cards — slide up stagger ──
        const teamCards = document.querySelectorAll('.team-card');
        if (teamCards.length) {
            scrollReveal(teamCards, '.team-grid',
                { opacity: 0, y: 40 },
                { duration: 0.9, stagger: 0.18, ease: 'power3.out' }
            );
        }

        // ── Footer Bar — fade ──
        const footerBar = document.querySelector('.footer-bar');
        if (footerBar) {
            scrollReveal(footerBar, footerBar,
                { opacity: 0 },
                { duration: 1, ease: 'power2.out' },
                { start: 'top 95%' }
            );
        }

        // ── Contact Icon — spin in ──
        const contactIcon = document.querySelector('.contact-icon');
        if (contactIcon) {
            scrollReveal(contactIcon, contactIcon,
                { opacity: 0, rotation: -120, scale: 0.4 },
                { duration: 1.3, ease: 'back.out(1.6)' },
                { start: 'top 90%' }
            );
        }

        // ── Contact Items — stagger from right ──
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length) {
            scrollReveal(contactItems, '.contact-grid',
                { opacity: 0, x: 25 },
                { duration: 0.6, stagger: 0.1, ease: 'power2.out' },
                { start: 'top 90%' }
            );
        }
    }

    // ── Smooth Scroll for Anchor Links ───────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ── Global Visibility Safety Net ─────────────────────
    var safetySelectors = '.section-label, .section-headline, .section-body, [data-reveal], .glass-card, .pillar-card, .service-pill, .capability-item, .budget-row, .case-card, .partner-card, .team-card, .engagement-card, .venue-detail, .contact-item, .cta-button, .footer-bar, .contact-icon';

    function runSafetyNet() {
        var stuck = document.querySelectorAll(safetySelectors);
        stuck.forEach(function (el) {
            var op = getComputedStyle(el).opacity;
            if (op === '0' || parseFloat(op) < 0.1) {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
                el.style.clipPath = 'none';
            }
        });
    }

    setTimeout(runSafetyNet, 5000);
    setTimeout(runSafetyNet, 10000);
    setTimeout(runSafetyNet, 20000);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            setTimeout(runSafetyNet, 500);
            setTimeout(runSafetyNet, 2000);
            // Also refresh ScrollTrigger when tab becomes visible
            try { ScrollTrigger.refresh(); } catch (e) { }
        }
    });

})();

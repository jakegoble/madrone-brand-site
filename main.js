/* ============================================
   MADRONE STUDIOS — Scroll Animations & Interactions
   v3.0 — fromTo fix for hidden-tab resilience
   ============================================ */

(function() {
    'use strict';

    // Ensure GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded');
        // Even without GSAP, hide preloader via CSS class
        var pl = document.getElementById('preloader');
        if (pl) setTimeout(function() { pl.classList.add('is-hidden'); }, 2000);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ---------- Preloader ----------
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
            } catch(e) {
                console.warn('Animation init error:', e);
            }
        }
    }

    function dismissPreloader() {
        if (animationsInitialized) return;

        // Try GSAP first (smoothest)
        try {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: finishPreloaderDismiss
            });
        } catch(e) {
            // GSAP failed — use CSS class
            finishPreloaderDismiss();
        }

        // Safety: if GSAP ticker freezes (hidden tab, power saving, etc),
        // force-complete after 1.5s using pure JS
        setTimeout(function() {
            if (preloader && getComputedStyle(preloader).opacity !== '0') {
                preloader.style.transition = 'opacity 0.5s ease';
                preloader.style.opacity = '0';
                setTimeout(finishPreloaderDismiss, 600);
            }
        }, 1500);
    }

    // Strategy: fire on whichever comes first — load event or DOM ready + timeout
    if (document.readyState === 'complete') {
        setTimeout(dismissPreloader, 400);
    } else {
        window.addEventListener('load', function() {
            setTimeout(dismissPreloader, 400);
        });
        // Hard fallback: if nothing fires within 3 seconds, dismiss anyway
        setTimeout(dismissPreloader, 3000);
    }

    // Ultimate nuclear fallback: pure JS, no GSAP, no rAF dependency
    // If preloader is STILL showing after 5 seconds, force kill it
    setTimeout(function() {
        if (preloader && !preloader.classList.contains('is-hidden')) {
            preloader.style.transition = 'opacity 0.3s ease';
            preloader.style.opacity = '0';
            setTimeout(finishPreloaderDismiss, 400);
        }
    }, 5000);

    // ---------- Cursor Glow ----------
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

    // ---------- Progress Bar ----------
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

    // ---------- Navigation ----------
    const nav = document.getElementById('mainNav');
    const sections = document.querySelectorAll('.section');
    const navDotsContainer = document.getElementById('navDots');

    // Create nav dots
    if (navDotsContainer) {
        sections.forEach((section, i) => {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth' });
            });
            navDotsContainer.appendChild(dot);
        });
    }

    const navDots = document.querySelectorAll('.nav-dot');

    // Throttled scroll handler for nav
    let navTicking = false;
    window.addEventListener('scroll', () => {
        if (!navTicking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;

                // Nav background
                if (nav) {
                    nav.classList.toggle('is-scrolled', scrollTop > 80);
                }

                // Active dot
                let current = 0;
                sections.forEach((section, i) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.5) {
                        current = i;
                    }
                });
                navDots.forEach((dot, i) => {
                    dot.classList.toggle('is-active', i === current);
                });

                navTicking = false;
            });
            navTicking = true;
        }
    }, { passive: true });

    // ---------- Helper: scroll-triggered fromTo ----------
    // Using fromTo instead of from ensures the end state (opacity:1, transforms:none)
    // is explicit and cannot be corrupted by ticker freezes in hidden tabs.
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

    // ---------- Main Animations ----------
    function initAnimations() {
        // Hero entrance — timeline (not scroll-triggered, plays immediately)
        const heroTl = gsap.timeline();
        heroTl
            .fromTo('.hero-eyebrow',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
            )
            .fromTo('.title-line',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' },
                '-=0.6'
            )
            .fromTo('.hero-subtitle',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
                '-=0.4'
            )
            .fromTo('.hero-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'power2.inOut' },
                '-=0.3'
            )
            .fromTo('.scroll-indicator',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
                '-=0.2'
            );

        // Safety: if GSAP ticker freezes, ensure hero content is visible after 3s
        setTimeout(function() {
            document.querySelectorAll('.hero-eyebrow, .title-line, .hero-subtitle, .hero-line, .scroll-indicator').forEach(function(el) {
                if (getComputedStyle(el).opacity === '0') {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                }
            });
        }, 3000);

        // Section labels — scroll triggered
        document.querySelectorAll('.section-label').forEach(el => {
            scrollReveal(el, el, { opacity: 0, y: 15 }, { duration: 0.8 }, { start: 'top 88%' });
        });

        document.querySelectorAll('.section-headline').forEach(el => {
            scrollReveal(el, el, { opacity: 0, y: 30 }, { duration: 1 }, { start: 'top 88%' });
        });

        document.querySelectorAll('.section-body').forEach(el => {
            scrollReveal(el, el, { opacity: 0, y: 20 }, { duration: 0.8, delay: 0.15 }, { start: 'top 88%' });
        });

        // Reveal elements
        document.querySelectorAll('[data-reveal]').forEach(el => {
            scrollReveal(el, el, { opacity: 0, y: 30 }, { duration: 0.9 }, { start: 'top 90%' });
        });

        // Glass cards stagger
        document.querySelectorAll('.cards-grid').forEach(grid => {
            const cards = grid.querySelectorAll('.glass-card');
            scrollReveal(cards, grid, { opacity: 0, y: 40 }, { duration: 0.8, stagger: 0.15 }, { start: 'top 82%' });
        });

        // Pillar cards stagger
        const pillarCards = document.querySelectorAll('.pillar-card');
        if (pillarCards.length) {
            scrollReveal(pillarCards, '.pillars-grid', { opacity: 0, y: 40 }, { duration: 0.9, stagger: 0.2 }, { start: 'top 82%' });
        }

        // Service pills stagger
        const pills = document.querySelectorAll('.service-pill');
        if (pills.length) {
            scrollReveal(pills, '.service-pillars', { opacity: 0, y: 20, scale: 0.9 }, { duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)' });
        }

        // Capability items stagger
        const capItems = document.querySelectorAll('.capability-item');
        if (capItems.length) {
            scrollReveal(capItems, '.capabilities-list', { opacity: 0, x: -30 }, { duration: 0.7, stagger: 0.1 }, { start: 'top 82%' });
        }

        // ---------- Animated Counters ----------
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
                        onUpdate: () => {
                            el.textContent = Math.round(obj.val);
                        }
                    });
                }
            });
        });

        // Stat card counters (91% in "Why Now")
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
                        onUpdate: () => {
                            el.textContent = Math.round(obj.val);
                        }
                    });
                }
            });
        });

        // ---------- Budget Table Rows ----------
        const budgetRows = document.querySelectorAll('.budget-row');
        if (budgetRows.length) {
            scrollReveal(budgetRows, '.budget-table', { opacity: 0, x: -20 }, { duration: 0.6, stagger: 0.08 });
        }

        // ---------- Background Parallax ----------
        document.querySelectorAll('.bg-image').forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.closest('.section'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                },
                y: -50,
                scale: 1.06,
                ease: 'none'
            });
        });

        // ---------- CTA Button ----------
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            scrollReveal(ctaButton, ctaButton, { opacity: 0, y: 20, scale: 0.95 }, { duration: 0.8, ease: 'back.out(1.5)' }, { start: 'top 92%' });
        }

        // ---------- Engagement cards ----------
        const engCards = document.querySelectorAll('.engagement-card');
        if (engCards.length) {
            scrollReveal(engCards, '.engagement-options', { opacity: 0, y: 40 }, { duration: 0.9, stagger: 0.2 });
        }

        // ---------- Venue details stagger ----------
        const venueDetails = document.querySelectorAll('.venue-detail');
        if (venueDetails.length) {
            scrollReveal(venueDetails, '.venue-details', { opacity: 0, y: 25 }, { duration: 0.7, stagger: 0.15 });
        }

        // ---------- Case studies ----------
        const caseCards = document.querySelectorAll('.case-card');
        if (caseCards.length) {
            scrollReveal(caseCards, '.case-studies-grid', { opacity: 0, y: 40 }, { duration: 0.9, stagger: 0.2 });
        }

        // ---------- Partner cards ----------
        const partnerCards = document.querySelectorAll('.partner-card');
        if (partnerCards.length) {
            scrollReveal(partnerCards, '.partners-grid', { opacity: 0, y: 25, scale: 0.95 }, { duration: 0.7, stagger: 0.1 });
        }

        // ---------- Team cards ----------
        const teamCards = document.querySelectorAll('.team-card');
        if (teamCards.length) {
            scrollReveal(teamCards, '.team-grid', { opacity: 0, y: 30 }, { duration: 0.8, stagger: 0.2 });
        }

        // ---------- Footer bar ----------
        const footerBar = document.querySelector('.footer-bar');
        if (footerBar) {
            scrollReveal(footerBar, footerBar, { opacity: 0 }, { duration: 1, ease: 'power2.out' }, { start: 'top 95%' });
        }

        // ---------- Contact section icon spin ----------
        const contactIcon = document.querySelector('.contact-icon');
        if (contactIcon) {
            scrollReveal(contactIcon, contactIcon, { opacity: 0, rotation: -90, scale: 0.5 }, { duration: 1.2, ease: 'back.out(1.5)' }, { start: 'top 90%' });
        }

        // ---------- Contact details ----------
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length) {
            scrollReveal(contactItems, '.contact-grid', { opacity: 0, y: 15 }, { duration: 0.6, stagger: 0.12 }, { start: 'top 90%' });
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---------- Global visibility safety net ----------
    // Repeating check: if any animated element is stuck at opacity:0,
    // force it visible. Runs at 5s, 10s, and 20s to catch all timing edge cases
    // (ScrollTrigger may fire AFTER the first safety-net pass).
    var safetySelectors = '.section-label, .section-headline, .section-body, [data-reveal], .glass-card, .pillar-card, .service-pill, .capability-item, .budget-row, .case-card, .partner-card, .team-card, .engagement-card, .venue-detail, .contact-item, .cta-button, .footer-bar, .contact-icon';

    function runSafetyNet() {
        var stuck = document.querySelectorAll(safetySelectors);
        stuck.forEach(function(el) {
            var op = getComputedStyle(el).opacity;
            if (op === '0' || parseFloat(op) < 0.1) {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
            }
        });
    }

    // Run at 5s, 10s, and 20s after page load
    setTimeout(runSafetyNet, 5000);
    setTimeout(runSafetyNet, 10000);
    setTimeout(runSafetyNet, 20000);

    // Also run when tab becomes visible (user switches back to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(runSafetyNet, 500);
            setTimeout(runSafetyNet, 2000);
        }
    });

})();

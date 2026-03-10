/* ============================================
   MADRONE STUDIOS — Scroll Animations & Interactions
   v2.0 — Full audit fix pass
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

    // ---------- Main Animations ----------
    function initAnimations() {
        // Hero entrance
        const heroTl = gsap.timeline();
        heroTl
            .from('.hero-eyebrow', {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: 'power3.out'
            })
            .from('.title-line', {
                opacity: 0,
                y: 40,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power3.out'
            }, '-=0.6')
            .from('.hero-subtitle', {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.4')
            .from('.hero-line', {
                scaleX: 0,
                duration: 0.8,
                ease: 'power2.inOut'
            }, '-=0.3')
            .from('.scroll-indicator', {
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.2');

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
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 15,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        document.querySelectorAll('.section-headline').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power3.out'
            });
        });

        document.querySelectorAll('.section-body').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.15,
                ease: 'power3.out'
            });
        });

        // Reveal elements
        document.querySelectorAll('[data-reveal]').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.9,
                ease: 'power3.out'
            });
        });

        // Glass cards stagger
        document.querySelectorAll('.cards-grid').forEach(grid => {
            const cards = grid.querySelectorAll('.glass-card');
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            });
        });

        // Pillar cards stagger
        const pillarCards = document.querySelectorAll('.pillar-card');
        if (pillarCards.length) {
            gsap.from(pillarCards, {
                scrollTrigger: {
                    trigger: '.pillars-grid',
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 40,
                duration: 0.9,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // Service pills stagger
        const pills = document.querySelectorAll('.service-pill');
        if (pills.length) {
            gsap.from(pills, {
                scrollTrigger: {
                    trigger: '.service-pillars',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 20,
                scale: 0.9,
                duration: 0.6,
                stagger: 0.08,
                ease: 'back.out(1.7)'
            });
        }

        // Capability items stagger
        const capItems = document.querySelectorAll('.capability-item');
        if (capItems.length) {
            gsap.from(capItems, {
                scrollTrigger: {
                    trigger: '.capabilities-list',
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                x: -30,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out'
            });
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
            gsap.from(budgetRows, {
                scrollTrigger: {
                    trigger: '.budget-table',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                x: -20,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            });
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
            gsap.from(ctaButton, {
                scrollTrigger: {
                    trigger: ctaButton,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 20,
                scale: 0.95,
                duration: 0.8,
                ease: 'back.out(1.5)'
            });
        }

        // ---------- Engagement cards ----------
        const engCards = document.querySelectorAll('.engagement-card');
        if (engCards.length) {
            gsap.from(engCards, {
                scrollTrigger: {
                    trigger: '.engagement-options',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 40,
                duration: 0.9,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // ---------- Venue details stagger ----------
        const venueDetails = document.querySelectorAll('.venue-detail');
        if (venueDetails.length) {
            gsap.from(venueDetails, {
                scrollTrigger: {
                    trigger: '.venue-details',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 25,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }

        // ---------- Case studies ----------
        const caseCards = document.querySelectorAll('.case-card');
        if (caseCards.length) {
            gsap.from(caseCards, {
                scrollTrigger: {
                    trigger: '.case-studies-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 40,
                duration: 0.9,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // ---------- Partner cards ----------
        const partnerCards = document.querySelectorAll('.partner-card');
        if (partnerCards.length) {
            gsap.from(partnerCards, {
                scrollTrigger: {
                    trigger: '.partners-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 25,
                scale: 0.95,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }

        // ---------- Team cards ----------
        const teamCards = document.querySelectorAll('.team-card');
        if (teamCards.length) {
            gsap.from(teamCards, {
                scrollTrigger: {
                    trigger: '.team-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // ---------- Footer bar ----------
        const footerBar = document.querySelector('.footer-bar');
        if (footerBar) {
            gsap.from(footerBar, {
                scrollTrigger: {
                    trigger: footerBar,
                    start: 'top 95%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        }

        // ---------- Contact section icon spin ----------
        const contactIcon = document.querySelector('.contact-icon');
        if (contactIcon) {
            gsap.from(contactIcon, {
                scrollTrigger: {
                    trigger: contactIcon,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                rotation: -90,
                scale: 0.5,
                duration: 1.2,
                ease: 'back.out(1.5)'
            });
        }

        // ---------- Contact details ----------
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length) {
            gsap.from(contactItems, {
                scrollTrigger: {
                    trigger: '.contact-grid',
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 15,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out'
            });
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
    // If GSAP ticker freezes (hidden tab, power saving, etc), gsap.from()
    // leaves elements at opacity:0 permanently. This forces everything visible
    // after 8 seconds as an absolute last resort.
    setTimeout(function() {
        var stuck = document.querySelectorAll('.section-label, .section-headline, .section-body, [data-reveal], .glass-card, .pillar-card, .service-pill, .capability-item, .budget-row, .case-card, .partner-card, .team-card, .engagement-card, .venue-detail, .contact-item, .cta-button, .footer-bar, .contact-icon');
        stuck.forEach(function(el) {
            var op = getComputedStyle(el).opacity;
            if (op === '0' || parseFloat(op) < 0.1) {
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 8000);

})();

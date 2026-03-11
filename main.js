/* ============================================
   MADRONE STUDIOS — Smooth Scroll & Animations
   v5.0 — Lightweight CSS reveals + Lenis smooth scroll
   ============================================ */

(function () {
    'use strict';

    // ── Lenis Smooth Scroll ──────────────────────────────
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } catch (e) {
        console.warn('Lenis init skipped:', e.message);
    }

    // ── Preloader ────────────────────────────────────────
    const preloader = document.getElementById('preloader');

    function dismissPreloader() {
        if (!preloader) return;
        preloader.style.transition = 'opacity 0.6s ease';
        preloader.style.opacity = '0';
        setTimeout(function () {
            preloader.classList.add('is-hidden');
            preloader.style.display = 'none';
            preloader.style.visibility = 'hidden';
            preloader.style.pointerEvents = 'none';
            initReveals();
        }, 650);
    }

    if (document.readyState === 'complete') {
        setTimeout(dismissPreloader, 300);
    } else {
        window.addEventListener('load', function () { setTimeout(dismissPreloader, 300); });
        // Safety: dismiss after 3s no matter what
        setTimeout(dismissPreloader, 3000);
    }

    // ── Cursor Glow ──────────────────────────────────────
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX, glowY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function updateCursorGlow() {
            glowX += (mouseX - glowX) * 0.05;
            glowY += (mouseY - glowY) * 0.05;
            cursorGlow.style.transform = 'translate(' + glowX + 'px, ' + glowY + 'px)';
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

    // ── Mobile Menu ──────────────────────────────────────
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('is-open');
            hamburger.classList.toggle('is-open');
            hamburger.setAttribute('aria-expanded', isOpen);
            if (lenis) { isOpen ? lenis.stop() : lenis.start(); }
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                if (lenis) lenis.start();
                document.body.style.overflow = '';
            });
        });

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

    // ── Navigation Dots ──────────────────────────────────
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

    // ── CSS-Based Reveal System ──────────────────────────
    // Instead of dozens of GSAP ScrollTriggers, we use ONE
    // IntersectionObserver that adds a `.is-visible` class.
    // All animation is handled by CSS transitions — much smoother.

    function initReveals() {
        // Hero entrance — simple CSS class, no GSAP needed
        requestAnimationFrame(() => {
            document.body.classList.add('hero-ready');
        });

        // Single IntersectionObserver for ALL reveal elements
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -60px 0px'
        });

        // Observe all revealable elements
        const revealSelectors = [
            '.section-label',
            '.section-headline',
            '.section-body',
            '[data-reveal]',
            '.glass-card',
            '.pillar-card',
            '.service-pill',
            '.capability-item',
            '.budget-row',
            '.case-card',
            '.partner-card',
            '.team-card',
            '.engagement-card',
            '.venue-detail',
            '.contact-item',
            '.contact-icon',
            '.cta-button',
            '.footer-bar',
            '.stat-card',
            '.client-logos',
            '.framework-visual'
        ];

        document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
            const rect = el.getBoundingClientRect();
            const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

            if (inViewport) {
                // Already visible — add both classes in one frame to prevent flicker
                el.classList.add('reveal', 'is-visible');
            } else {
                el.classList.add('reveal');
                revealObserver.observe(el);
            }
        });

        // Add stagger delays to grouped children
        addStaggerDelays('.cards-grid', '.glass-card', 0.08);
        addStaggerDelays('.pillars-grid', '.pillar-card', 0.1);
        addStaggerDelays('.service-pillars', '.service-pill', 0.04);
        addStaggerDelays('.capabilities-list', '.capability-item', 0.05);
        addStaggerDelays('.budget-table', '.budget-row', 0.04);
        addStaggerDelays('.case-studies-grid', '.case-card', 0.12);
        addStaggerDelays('.partners-grid', '.partner-card', 0.06);
        addStaggerDelays('.team-grid', '.team-card', 0.1);
        addStaggerDelays('.engagement-options', '.engagement-card', 0.12);
        addStaggerDelays('.venue-details', '.venue-detail', 0.08);
        addStaggerDelays('.contact-grid', '.contact-item', 0.06);
        addStaggerDelays('.why-stats-row', '.stat-card', 0.1);

        // Animated counters — keep these as JS since they need counting logic
        initCounters();

        // Background parallax — simple transform on scroll, no GSAP needed
        initParallax();

        // Safety net: after 8 seconds, reveal anything still hidden
        // but only if it's near the visible area (not far below fold)
        setTimeout(function () {
            document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
                var rect = el.getBoundingClientRect();
                // Only force-show elements within 2x viewport of current scroll
                if (rect.top < window.innerHeight * 2) {
                    el.classList.add('is-visible');
                }
            });
        }, 8000);
    }

    function addStaggerDelays(parentSelector, childSelector, delayStep) {
        document.querySelectorAll(parentSelector).forEach(parent => {
            parent.querySelectorAll(childSelector).forEach((child, i) => {
                child.style.transitionDelay = (i * delayStep) + 's';
            });
        });
    }

    // ── Animated Counters ────────────────────────────────
    function initCounters() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('[data-count]').forEach(el => {
            counterObserver.observe(el);
        });
    }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ── Parallax (lightweight, no GSAP) ──────────────────
    function initParallax() {
        const bgImages = document.querySelectorAll('.bg-image');
        if (!bgImages.length) return;

        let scrollY = window.scrollY;
        let ticking = false;

        function updateParallax() {
            bgImages.forEach(img => {
                const section = img.closest('.section');
                if (!section) return;
                const rect = section.getBoundingClientRect();
                const viewH = window.innerHeight;

                // Only calculate if section is near viewport
                if (rect.bottom < -100 || rect.top > viewH + 100) return;

                const progress = (viewH - rect.top) / (viewH + rect.height);
                const yOffset = (progress - 0.5) * -50;
                const scale = 1 + progress * 0.06;
                img.style.transform = 'translate3d(0,' + yOffset + 'px,0) scale(' + scale + ')';
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateParallax();
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

    // ── Tab Visibility Safety ────────────────────────────
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            // If user returns to tab, make sure everything visible is shown
            setTimeout(function () {
                document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        el.classList.add('is-visible');
                    }
                });
            }, 300);
        }
    });

    // ── Leadership Canvas — Animated Particle Network ────
    const leadershipCanvas = document.getElementById('leadershipCanvas');
    if (leadershipCanvas) {
        const ctx = leadershipCanvas.getContext('2d');
        let particles = [];
        let canvasW, canvasH;
        const PARTICLE_COUNT = 60;
        const CONNECTION_DIST = 120;
        const accentColor = [225, 163, 119];

        function resizeCanvas() {
            const section = leadershipCanvas.closest('.section');
            if (!section) return;
            canvasW = section.offsetWidth;
            canvasH = section.offsetHeight;
            leadershipCanvas.width = canvasW * (window.devicePixelRatio || 1);
            leadershipCanvas.height = canvasH * (window.devicePixelRatio || 1);
            leadershipCanvas.style.width = canvasW + 'px';
            leadershipCanvas.style.height = canvasH + 'px';
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * canvasW,
                    y: Math.random() * canvasH,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.4 + 0.1
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvasW, canvasH);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(' + accentColor.join(',') + ',' + opacity + ')';
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + accentColor.join(',') + ',' + p.alpha + ')';
                ctx.fill();
            });
        }

        function updateParticles() {
            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvasW) p.vx *= -1;
                if (p.y < 0 || p.y > canvasH) p.vy *= -1;
            });
        }

        let canvasRunning = false;
        function animateCanvas() {
            if (!canvasRunning) return;
            updateParticles();
            drawParticles();
            requestAnimationFrame(animateCanvas);
        }

        // Only animate when section is near viewport
        const canvasObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !canvasRunning) {
                    canvasRunning = true;
                    animateCanvas();
                } else if (!entry.isIntersecting) {
                    canvasRunning = false;
                }
            });
        }, { rootMargin: '200px' });

        resizeCanvas();
        initParticles();
        canvasObserver.observe(leadershipCanvas.closest('.section'));

        window.addEventListener('resize', function () {
            resizeCanvas();
            initParticles();
        });
    }

})();

/* ============================================
   MADRONE STUDIOS — Scroll Animations & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ---------- Preloader ----------
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                preloader.classList.add('is-hidden');
                initAnimations();
            }
        });
    });

    // Fallback in case load fires before DOMContentLoaded listener
    if (document.readyState === 'complete') {
        setTimeout(() => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: () => {
                    preloader.classList.add('is-hidden');
                    initAnimations();
                }
            });
        }, 800);
    }

    // ---------- Cursor Glow ----------
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursorGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(updateCursorGlow);
    }
    updateCursorGlow();

    // ---------- Progress Bar ----------
    const progressBar = document.getElementById('progressBar');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    });

    // ---------- Navigation ----------
    const nav = document.getElementById('mainNav');
    const sections = document.querySelectorAll('.section');
    const navDotsContainer = document.getElementById('navDots');

    // Create nav dots
    sections.forEach((section, i) => {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        navDotsContainer.appendChild(dot);
    });

    const navDots = document.querySelectorAll('.nav-dot');

    // Scroll handler for nav
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;

        // Nav background
        if (scrollTop > 100) {
            nav.classList.add('is-scrolled');
        } else {
            nav.classList.remove('is-scrolled');
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

        lastScroll = scrollTop;
    });

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

        // Section labels and headlines - scroll triggered
        document.querySelectorAll('.section-label').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
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
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
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
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out'
            });
        });

        // Reveal elements with stagger
        document.querySelectorAll('[data-reveal]').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none reverse'
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
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
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
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
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
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
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

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        innerText: target,
                        duration: 2,
                        ease: 'power2.out',
                        snap: { innerText: 1 },
                        onUpdate: function() {
                            el.innerText = Math.ceil(parseFloat(el.innerText));
                        }
                    });
                }
            });
        });

        // ---------- Budget Bars ----------
        document.querySelectorAll('.budget-fill').forEach(fill => {
            const targetWidth = fill.getAttribute('data-width');
            fill.style.setProperty('--target-width', targetWidth);

            ScrollTrigger.create({
                trigger: fill,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    fill.classList.add('is-visible');
                }
            });
        });

        // ---------- Background Parallax ----------
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

        // ---------- Contact CTA hover effect ----------
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            gsap.from(ctaButton, {
                scrollTrigger: {
                    trigger: ctaButton,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
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
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // ---------- Footer bar ----------
        gsap.from('.footer-bar', {
            scrollTrigger: {
                trigger: '.footer-bar',
                start: 'top 95%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
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
});

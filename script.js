/* NextGen Coder â€” cleaned portfolio interactions */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Loading screen
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (!loader) return;

    window.setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      window.setTimeout(() => loader.remove(), 700);
    }, 650);
  });

  // Scroll progress and header state
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const header = $('#header');
  const navLinks = $('.nav-links');
  const menuButton = $('#mobile-menu');
  const navItems = $$('.nav-links a');
  const sections = $$('main section[id]');

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;

    progress.style.width = `${scrollable > 0 ? (scrollTop / scrollable) * 100 : 0}%`;
    if (header) header.classList.toggle('scrolled', scrollTop > 24);

    let current = '';
    sections.forEach(section => {
      if (scrollTop >= section.offsetTop - 180) current = section.id;
    });

    navItems.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);
  updateScrollUI();

  // Mobile navigation
  if (menuButton && navLinks) {
    navLinks.id ||= 'primary-navigation';
    menuButton.setAttribute('aria-label', 'Toggle navigation menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', navLinks.id);

    const closeMenu = () => {
      navLinks.classList.remove('active');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuButton.classList.toggle('open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    navItems.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // Reveal animations
  const revealTargets = $$('.section-header, .timeline-item, .skill-node, .network-node, .project-card, .stat-box, .review-card, .contact-left, .contact-right');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal');
      if (element.classList.contains('skill-node') || element.classList.contains('network-node')) {
        element.style.transitionDelay = `${(index % 5) * 70}ms`;
      }
    });

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    revealTargets.forEach(element => revealObserver.observe(element));
  }

  // Project details modal â€” reads the data attributes already present in HTML.
  const modal = $('#project-modal');
  const modalTitle = $('#modal-title', modal || document);
  const modalDescription = $('#modal-description', modal || document);
  const modalTag = $('.modal-tag', modal || document);
  const modalBadges = $('#modal-badges', modal || document);
  const closeModalButton = $('.close-modal', modal || document);
  let previouslyFocusedElement = null;

  function openProject(card) {
    if (!modal) return;

    const title = card.dataset.title || $('h3', card)?.textContent?.trim() || 'Project';
    const description = card.dataset.description || $('p', card)?.textContent?.trim() || '';
    const tech = (card.dataset.tech || '').split(',').map(item => item.trim()).filter(Boolean);
    const category = $('.project-info > span', card)?.textContent?.split('/').slice(1).join('/').trim();

    if (modalTitle) modalTitle.textContent = title;
    if (modalDescription) modalDescription.textContent = description;
    if (modalTag) modalTag.textContent = category || 'FEATURED PROJECT';

    if (modalBadges) {
      modalBadges.replaceChildren();
      tech.forEach(label => {
        const badge = document.createElement('span');
        badge.textContent = label;
        modalBadges.appendChild(badge);
      });
    }

    previouslyFocusedElement = document.activeElement;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-visible'));
    closeModalButton?.focus();
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    window.setTimeout(() => {
      if (!modal.classList.contains('is-visible')) modal.style.display = 'none';
      previouslyFocusedElement?.focus?.();
    }, 280);
  }

  $$('.project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View project details: ${card.dataset.title || $('h3', card)?.textContent || 'project'}`);

    card.addEventListener('click', () => openProject(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject(card);
      }
    });
  });

  closeModalButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('is-visible')) closeModal();
  });

  // Contact form demo behaviour. A backend/form service is needed to send real messages.
  const contactForm = $('#contact-form');

  if (contactForm) {
    const contactField = $('#number', contactForm);
    if (contactField) {
      contactField.setAttribute('type', 'text');
      contactField.setAttribute('autocomplete', 'email');
      contactField.setAttribute('aria-label', 'Email or phone');
    }

    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const submitButton = $('button[type="submit"]', contactForm);
      const previousText = submitButton?.innerHTML;

      if (submitButton) {
        submitButton.textContent = 'Message Ready âœ“';
        submitButton.disabled = true;
      }

      window.setTimeout(() => {
        window.alert('Thank you! Your message has been received in this demo. Connect a backend or form service to send messages.');
        contactForm.reset();

        if (submitButton) {
          submitButton.innerHTML = previousText || 'SEND MESSAGE';
          submitButton.disabled = false;
        }
      }, 180);
    });
  }

  // Pointer glow for mouse/trackpad users only
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let frame = 0;
    document.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
      });
    }, { passive: true });
  }

  // Draw SVG links between the connected skill nodes.
  const network = $('#skills-network-map');
  const svg = $('#skills-connections');

  if (network && svg) {
    const connections = [
      ['HTML5', 'CSS3'], ['CSS3', 'JavaScript'], ['JavaScript', 'Python'],
      ['JavaScript', 'React'], ['Python', 'TypeScript'], ['TypeScript', 'React'],
      ['React', 'Next.js'], ['Next.js', 'Tailwind CSS'], ['React', 'GSAP'],
      ['Python', 'Git & GitHub'], ['Git & GitHub', 'GSAP'],
      ['Tailwind CSS', 'GSAP'], ['HTML5', 'TypeScript']
    ];

    function drawConnections() {
      const networkRect = network.getBoundingClientRect();
      if (!networkRect.width || !networkRect.height) return;

      svg.setAttribute('viewBox', `0 0 ${network.clientWidth} ${network.clientHeight}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.replaceChildren();

      connections.forEach(([fromSkill, toSkill], index) => {
        const from = network.querySelector(`[data-skill="${fromSkill}"]`);
        const to = network.querySelector(`[data-skill="${toSkill}"]`);
        if (!from || !to) return;

        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();
        const x1 = fromRect.left + fromRect.width / 2 - networkRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - networkRect.top;
        const x2 = toRect.left + toRect.width / 2 - networkRect.left;
        const y2 = toRect.top + toRect.height / 2 - networkRect.top;
        const dx = x2 - x1;
        const curve = Math.min(70, Math.abs(dx) * 0.18);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx * 0.35} ${y1 - curve}, ${x1 + dx * 0.7} ${y2 - curve}, ${x2} ${y2}`);
        path.classList.add('skill-connection');

        if (prefersReducedMotion) {
          path.style.animation = 'none';
          path.style.strokeDashoffset = '0';
        } else {
          path.style.animationDelay = `${index * 100}ms`;
        }

        svg.appendChild(path);
      });
    }

    let resizeTimer;
    const scheduleRedraw = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => requestAnimationFrame(drawConnections), 120);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', drawConnections, { once: true });
    } else {
      drawConnections();
    }

    window.addEventListener('load', drawConnections);
    window.addEventListener('resize', scheduleRedraw);

    if ('ResizeObserver' in window) {
      const networkObserver = new ResizeObserver(scheduleRedraw);
      networkObserver.observe(network);
    }
  }
})();

// Cinematic section motion. The portrait image is intentionally not animated
// because the current design uses it as a background/hidden foreground layer.
window.addEventListener('load', () => {
  if (!window.gsap || !window.ScrollTrigger ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const laptop = document.querySelector('.laptop-hero');
  const hello = document.querySelector('.hello-word');
  const copyItems = document.querySelectorAll('.laptop-copy h2, .laptop-copy p, .laptop-copy .btn-primary');

  if (laptop && hello) {
    gsap.from(hello, {
      x: -80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: laptop, start: 'top 68%', once: true }
    });
  }

  if (laptop && copyItems.length) {
    gsap.from(copyItems, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: { trigger: laptop, start: 'top 62%', once: true }
    });
  }
});

/* ==========================================
   NEW PORTFOLIO ANIMATIONS
   Social links + Certificate gallery
========================================== */
(() => {
    'use strict';

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    const initPortfolioAdditions = () => {
        const animatedItems = [
            ...document.querySelectorAll('.profile-link-card'),
            ...document.querySelectorAll('.certificate-card')
        ];

        if (!animatedItems.length) return;

        // Keep the interface fully visible when motion is disabled.
        if (reducedMotion) {
            animatedItems.forEach(item => {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
            return;
        }

        // Use the existing GSAP library when it is available.
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            gsap.set(animatedItems, {
                opacity: 0,
                y: 28
            });

            animatedItems.forEach((item, index) => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    delay: (index % 3) * 0.08,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 92%',
                        once: true
                    }
                });
            });

            return;
        }

        // Fallback if GSAP is unavailable.
        if ('IntersectionObserver' in window) {
            animatedItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(28px)';
                item.style.transition =
                    'opacity 650ms ease, transform 650ms ease';
            });

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -30px 0px'
            });

            animatedItems.forEach(item => observer.observe(item));
        } else {
            animatedItems.forEach(item => {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initPortfolioAdditions,
            { once: true }
        );
    } else {
        initPortfolioAdditions();
    }
})();


/* =========================================
   PREMIUM PORTFOLIO MOTION
   Add after the existing JavaScript
========================================= */

(() => {
    'use strict';

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    // Back to Top button
    let backToTop = document.querySelector('.back-to-top');

    if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.type = 'button';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.title = 'Back to top';
        backToTop.textContent = '↑';
        document.body.appendChild(backToTop);
    }

    const updateBackToTop = () => {
        backToTop.classList.toggle(
            'is-visible',
            window.scrollY > 450
        );
    };

    window.addEventListener('scroll', updateBackToTop, {
        passive: true
    });

    updateBackToTop();

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? 'instant' : 'smooth'
        });
    });

    // Avoid animation conflicts if GSAP is unavailable.
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
        return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    // Animate the existing brand logo on initial page load.
    const logo = document.querySelector('.logo');

    if (logo && !logo.dataset.premiumAnimated) {
        logo.dataset.premiumAnimated = 'true';

        gsap.fromTo(
            logo,
            {
                opacity: 0,
                y: -10
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power2.out',
                clearProps: 'opacity,transform'
            }
        );
    }

    // Animate selected headings as they enter the viewport.
    // Existing content and section layout remain unchanged.
    const headings = document.querySelectorAll(
        '.section-header h2, ' +
        '.connected-skills-header h2, ' +
        '.reviews-header h2, ' +
        '.contact-left h2'
    );

    headings.forEach((heading) => {
        if (heading.dataset.premiumAnimated) return;

        heading.dataset.premiumAnimated = 'true';

        gsap.fromTo(
            heading,
            {
                opacity: 0,
                y: 22
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power2.out',
                clearProps: 'opacity,transform',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 88%',
                    once: true
                }
            }
        );
    });

    // Refresh measurements after images and layout have loaded.
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    }, { once: true });

})();

/* ======================================
   PROFESSIONAL LIGHT / DARK MODE
====================================== */

(() => {
    'use strict';

    const lightButton = document.getElementById('light-mode');
    const darkButton = document.getElementById('dark-mode');

    if (!lightButton || !darkButton) return;

    const buttons = [lightButton, darkButton];

    function setTheme(theme) {
        const isLight = theme === 'light';

        document.body.classList.toggle('light-theme', isLight);

        lightButton.classList.toggle('active', isLight);
        darkButton.classList.toggle('active', !isLight);

        lightButton.setAttribute(
            'aria-pressed', String(isLight)
        );

        darkButton.setAttribute(
            'aria-pressed', String(!isLight)
        );

        document.documentElement.style.colorScheme = theme;

        try {
            localStorage.setItem('nextgen-theme', theme);
        } catch (error) {
            // Theme still works if browser storage is unavailable.
        }
    }

    lightButton.addEventListener('click', () => {
        setTheme('light');
    });

    darkButton.addEventListener('click', () => {
        setTheme('dark');
    });

    let savedTheme = 'dark';

    try {
        savedTheme = localStorage.getItem('nextgen-theme') || 'dark';
    } catch (error) {
        // Use dark mode by default.
    }

    setTheme(savedTheme);
})();

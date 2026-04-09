document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lenis
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth ease
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  })

  // Expose globally for product showcase nav
  window.__lenis = lenis;

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)

  // Sync GSAP with Lenis
  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time)=>{
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)


  // 2. Header scroll effect
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 3. Hero Entrance Animations
  const heroTl = gsap.timeline();
  
  // Animate lines if they exist
  const revealLines = document.querySelectorAll('.reveal-line');
  if(revealLines.length > 0) {
    heroTl.to(revealLines, {
      y: '0%',
      opacity: 1,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out',
      delay: 0.2
    });
  }

  // Animate other hero actions
  const heroActions = document.querySelectorAll('.hero-actions.gsap-reveal');
  if(heroActions.length > 0) {
    heroTl.fromTo(heroActions, 
      { opacity: 0, y: 20, visibility: 'hidden' }, 
      {
        opacity: 1,
        y: 0,
        visibility: 'visible',
        duration: 1,
        ease: 'power3.out'
      }, 
    "-=0.8");
  }

  // 4. Parallax effect for hero image
  const heroImg = document.getElementById('hero-img');
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 15, // Move image down slightly as we scroll down
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      } 
    });
  }

  // 5. Scroll Reveals for all .gsap-reveal elements
  const revealElements = document.querySelectorAll('.gsap-reveal:not(.hero-actions)');
  
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      {
        opacity: 0,
        y: 40,
        visibility: 'hidden'
      },
      {
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Trigger when element is 85% down the viewport
          toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        visibility: 'visible',
        duration: 1,
        ease: "power3.out"
      }
    );
  });
  
  // Legacy support for cards if any are missed
  const legacyElements = document.querySelectorAll(
    ".product-card:not(.gsap-reveal), .team-card:not(.gsap-reveal), .page-link-card:not(.gsap-reveal), .calendar-visual img:not(.gsap-reveal), .customerpersona img:not(.gsap-reveal)"
  );
  legacyElements.forEach(el => {
      gsap.fromTo(el, 
      {
        opacity: 0,
        y: 40
      },
      {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }
    );
  })

  // ─── CUSTOM CURSOR (Premium) ────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    const LERP = 0.14; // lower = more lag on ring

    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      // dot follows instantly via GSAP set
      gsap.set(dot, { left: mx, top: my });
    });

    // Ring follows with inertia
    function cursorLoop() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      gsap.set(ring, { left: rx, top: ry });
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .button, .progress-dot, input, .signature-card, .page-link-card, .product-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Click visual
    window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    window.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    // Image hover — switch to dark mocha theme
    const imgTargets = document.querySelectorAll('img, .slide-image-wrap, .team-card img, .hero-img');
    imgTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-image'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-image'));
    });

    // Button hover — switch to bright amber theme
    const btnTargets = document.querySelectorAll('a, button, .button');
    btnTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-button'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-button'));
    });
  }

  // ─── MAGNETIC BUTTONS ───────────────────────────────────────
  const magneticBtns = document.querySelectorAll('.button');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
});

// Prevent browser from restoring previous scroll position on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lenis
  const lenis = new Lenis({
    duration: 1.0, // tightened for premium direct feel
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

  // 2.5 General Reveal Animations (for non-canvas heroes)
  const revealLines = document.querySelectorAll('.reveal-line');
  if (revealLines.length > 0) {
    gsap.to(revealLines, {
      y: '0%',
      opacity: 1,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out',
      delay: 0.2
    });
  }

  const heroActions = document.querySelectorAll('.hero-actions.gsap-reveal');
  if (heroActions.length > 0) {
    gsap.fromTo(heroActions, 
      { opacity: 0, y: 20, visibility: 'hidden' }, 
      {
        opacity: 1,
        y: 0,
        visibility: 'visible',
        duration: 1,
        delay: 0.6,
        ease: 'power3.out'
      }
    );
  }


  // 3. Canvas Image Sequence Animation
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    // Disable right-click options (Save image as)
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    const context = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    });

    const frameCount = 300;
    const currentFrame = index => (
      `assets/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const imageSeq = { frame: 0 };

    // ─── LOADER ELEMENTS ──────────────────────────────────────
    const pageLoader = document.getElementById('pageLoader');
    const loaderFill = document.getElementById('loaderFill');
    const loaderPercent = document.getElementById('loaderPercent');
    let loadedCount = 0;
    let actualPct = 0;
    let loaderFinished = false;

    // We use a dummy object to tween from 0 to 100 over 2.5s.
    // This ensures that even if images load instantly from cache, 
    // the user still sees a smooth 0-100% progress animation.
    const loaderState = { visualPct: 0 };

    function dismissLoader() {
      if (loaderFinished) return;
      loaderFinished = true;
      render(); // Ensure first frame is painted
      
      if (pageLoader) pageLoader.classList.add('loaded');
      setTimeout(() => { if (pageLoader) pageLoader.remove(); }, 900);
    }

    // Check if user has already seen the loader in this session
    if (sessionStorage.getItem('brewverse_loaded')) {
      if (pageLoader) {
        pageLoader.style.display = 'none';
        pageLoader.remove();
      }
      loaderFinished = true;
    } else {
      gsap.to(loaderState, {
        visualPct: 100,
        duration: 2.5,
        ease: "power1.inOut",
        onUpdate: () => {
          // The displayed percentage is the minimum of the animated value and the actual loaded value.
          // If actual loaded is 100 instantly, it follows the 2.5s animation smoothing.
          // If animation is faster than loading, it waits for actualPct.
          const displayVal = Math.floor(Math.min(actualPct, loaderState.visualPct));
          
          if (loaderFill) loaderFill.style.width = displayVal + '%';
          if (loaderPercent) loaderPercent.textContent = displayVal + '%';

          // Once both real loading and visual animation hit 100, we dismiss
          if (displayVal === 100 && actualPct === 100) {
             sessionStorage.setItem('brewverse_loaded', 'true');
             // brief pause at 100 for premium feel
             setTimeout(dismissLoader, 200); 
          }
        }
      });
    }

    function onFrameLoaded() {
      loadedCount++;
      // If loader is already bypassed, ensure the first frame draws as soon as it loads
      if (loaderFinished && loadedCount === 1) {
        render();
      }
      actualPct = (loadedCount / frameCount) * 100;
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = onFrameLoaded;
      img.onerror = onFrameLoaded; // Don't stall on broken frames
      img.src = currentFrame(i);
      images.push(img);
    }

    function render() {
      // Use Math.round to get nearest frame instead of GSAP's snap feature,
      // which eliminates the conflict between Lenis smoothing and GSAP snapping
      // at the very end of the scroll interactions.
      const fIndex = Math.round(imageSeq.frame);
      
      if(images[fIndex]) {
        const img = images[fIndex];
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height) || 1;
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (img.complete) {
            context.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
      }
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".canvas-hero",
        start: "top top",
        end: "+=400%",
        scrub: true, // true gives instant 1:1 sync with Lenis (since Lenis handles the smoothing, we don't want GSAP to add its own drag delay on top)
        pin: true
      }
    });

    // Animate the image sequence frames
    tl.to(imageSeq, {
      frame: frameCount - 1,
      ease: "none",
      onUpdate: render,
      duration: 100
    }, 0);

    // 4. Text Overlay Checkpoint Animations
    const texts = document.querySelectorAll(".canvas-text-section");
    
    // Set initial states
    gsap.set(texts, { autoAlpha: 0, y: 30 });
    gsap.set(texts[0], { autoAlpha: 1, y: 0 }); // First text visible immediately

    texts.forEach((text, index) => {
      let startTime, exitTime;
      // Checkpoints: 0%, 33%, 66%, 90%
      if (index === 0)      { startTime = 0;  exitTime = 25; }
      else if (index === 1) { startTime = 33; exitTime = 58; }
      else if (index === 2) { startTime = 66; exitTime = 85; }
      else                  { startTime = 90; exitTime = 100; }

      // Enter animation (skip first as it's already visible)
      if (index > 0) {
        tl.to(text, { autoAlpha: 1, y: 0, duration: 5, ease: "power2.out" }, startTime);
      }
      
      // Exit animation (skip last so it stays visible)
      if (index < texts.length - 1) {
        tl.to(text, { autoAlpha: 0, y: -30, duration: 5, ease: "power2.in" }, exitTime);
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

  // ─── FAQ ACCORDION ──────────────────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    // Add hover state targets for custom cursor
    if (question && window.matchMedia('(hover: hover)').matches) {
      question.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      question.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    }

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    }
  });

});

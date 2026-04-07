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
});

/* ============================================================
   NeuroPod — main.js
   Pre-launch 1-pager | myneuropod.com
   ============================================================ */

/* --- Nav scroll behaviour --------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


/* --- Scroll reveal ---------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});


/* --- Toast helper ----------------------------------------- */
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
let toastTimer;

function showToast(message, duration = 4000) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* --- Email form validation -------------------------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* --- Waitlist form submission ----------------------------- */
// Cloudflare Worker endpoint for waitlist subscriptions.
// Once the Worker is deployed and a custom route is configured at
// waitlist.myneuropod.com, this URL will be live.
const WAITLIST_ENDPOINT = 'https://waitlist.myneuropod.com/subscribe';

async function handleFormSubmit(form) {
  const emailInput = form.querySelector('input[type="email"]');
  const honeypot   = form.querySelector('input[name="website"]');
  const button     = form.querySelector('button[type="submit"]');
  const email      = emailInput.value.trim();

  // Honeypot check — bots fill this field, humans don't see it
  if (honeypot && honeypot.value) {
    emailInput.value = '';
    showToast("You're on the waitlist. We'll be in touch soon.");
    return;
  }

  if (!isValidEmail(email)) {
    emailInput.focus();
    emailInput.style.borderColor = '#ef4444';
    setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
    showToast('Please enter a valid email address.');
    return;
  }

  const originalText = button.textContent;
  button.textContent = 'Sending...';
  button.disabled = true;

  try {
    let response;
    try {
      response = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({
          email,
          source: 'website',
          honeypot: honeypot ? honeypot.value : ''
        })
      });
    } catch {
      // Network error — Worker not yet deployed, fall back to demo mode
      await new Promise(resolve => setTimeout(resolve, 800));
      emailInput.value = '';
      showToast("You're on the waitlist. We'll be in touch soon.");
      return;
    }

    emailInput.value = '';

    if (response.ok) {
      showToast("You're on the waitlist. We'll be in touch soon.");
    } else if (response.status === 409) {
      showToast("You're already on the waitlist. We'll be in touch soon.");
    } else if (response.status === 429) {
      showToast('Too many requests. Please try again in a moment.');
    } else {
      showToast('Something went wrong. Please try again.');
    }

  } catch {
    showToast('Something went wrong. Please try again.');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Hero form
const heroForm = document.getElementById('hero-form');
if (heroForm) {
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(heroForm);
  });
}

// CTA form
const ctaForm = document.getElementById('cta-form');
if (ctaForm) {
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(ctaForm);
  });
}


/* --- Hamburger / mobile menu ------------------------------ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) closeMobileMenu();
});


/* --- Scrollspy -------------------------------------------- */
const sections = ['problem', 'solution', 'how-it-works', 'science', 'who', 'cta'];
const navLinks = document.querySelectorAll('.nav-link');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === id);
      });
    }
  });
}, {
  rootMargin: '-30% 0px -60% 0px',
  threshold: 0
});

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) spyObserver.observe(el);
});


/* --- Smooth scroll for nav links -------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* --- Discipline score gauge animation -------------------- */
const gaugeArc   = document.getElementById('gaugeArc');
const gaugeScore = document.getElementById('gaugeScore');
const gaugeGlow  = gaugeArc ? gaugeArc.previousElementSibling : null;

if (gaugeArc) {
  const targetScore   = 78;

  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gaugeArc.classList.add('run');
        if (gaugeGlow) gaugeGlow.classList.add('run');

        const duration = 2200;
        const start    = performance.now();
        function countUp(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          gaugeScore.textContent = Math.round(eased * targetScore);
          if (progress < 1) requestAnimationFrame(countUp);
        }
        requestAnimationFrame(countUp);
        gaugeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  gaugeObserver.observe(document.getElementById('hero'));
}


/* --- Animate stat card numbers on scroll ----------------- */
function animateCounter(el, target, suffix = '') {
  const duration = 1600;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (raw) animateCounter(el, parseInt(raw), suffix);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));


/* --- Dynamic footer year ---------------------------------- */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

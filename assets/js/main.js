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


/* --- Form submission -------------------------------------- */
// NOTE: Replace the ZOHO_LIST_ID and ZOHO_API_ENDPOINT below
// with your actual Zoho Campaigns values when ready.
// Until then, the form will show a success toast (demo mode).
const ZOHO_ENDPOINT = null; // e.g. 'https://campaigns.zoho.com/api/v1.1/json/listsubscribe'

async function handleFormSubmit(form, buttonText) {
  const emailInput = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    emailInput.focus();
    emailInput.style.borderColor = '#ef4444';
    setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
    showToast('Please enter a valid email address.');
    return;
  }

  // Loading state
  const originalText = button.textContent;
  button.textContent = 'Sending...';
  button.disabled = true;

  try {
    if (ZOHO_ENDPOINT) {
      // Live Zoho submission
      const response = await fetch(ZOHO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error('Submission failed');
    } else {
      // Demo mode — simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    emailInput.value = '';
    showToast("You're on the waitlist. We'll be in touch soon.");

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
    handleFormSubmit(heroForm, 'Join the Waitlist');
  });
}

// CTA form
const ctaForm = document.getElementById('cta-form');
if (ctaForm) {
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(ctaForm, 'Secure My Founding Member Spot');
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

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close on outside click
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
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* --- Animate stat card numbers on scroll ----------------- */
function animateCounter(el, target, suffix = '') {
  const duration = 1600;
  const start = performance.now();
  const from = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.round(from + (target - from) * eased);
    el.textContent = value + suffix;
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

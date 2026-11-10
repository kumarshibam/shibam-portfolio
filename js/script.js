// Audio feedback
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playHapticSound(type = 'tap') {
  if (!soundEnabled) return;

  try {
    initAudio();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'action') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (error) {
    // Audio may be unavailable in some browsers.
  }
}

// Sound toggle
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundLabel = document.getElementById('soundLabel');

if (soundToggleBtn && soundLabel) {
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.classList.toggle('active', soundEnabled);
    soundToggleBtn.querySelector('span:first-child').textContent =
      soundEnabled ? '🔊' : '🔇';
    soundLabel.textContent = soundEnabled ? 'Haptics: On' : 'Haptics: Off';

    if (soundEnabled) playHapticSound('action');
  });
}

document.querySelectorAll('[data-sound]').forEach(element => {
  element.addEventListener('click', () => {
    playHapticSound(element.getAttribute('data-sound') || 'tap');
  });
});

// Dynamic Island clock
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const clockEl = document.getElementById('islandClock');

  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}`;
  }
}

updateClock();
setInterval(updateClock, 1000);

// Mobile navigation drawer
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');

function openMobileMenu() {
  if (!mobileDrawer) return;

  mobileDrawer.classList.add('open');
  document.body.classList.add('menu-open');
  mobileMenuBtn?.setAttribute('aria-expanded', 'true');

  playHapticSound('tap');
}

function closeMobileMenu() {
  if (!mobileDrawer) return;

  mobileDrawer.classList.remove('open');
  document.body.classList.remove('menu-open');
  mobileMenuBtn?.setAttribute('aria-expanded', 'false');
}

mobileMenuBtn?.addEventListener('click', openMobileMenu);
closeDrawerBtn?.addEventListener('click', () => {
  closeMobileMenu();
  playHapticSound('tap');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close menu with Escape key
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
});
// Highlight the active navigation link while scrolling
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.dock-link');

window.addEventListener('scroll', () => {
  let current = '';
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 140;
    const sectionHeight = section.offsetHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// Spotlight effect on cards
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', event => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// Animated background particles
const canvas = document.getElementById('mesh-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
  let width;
  let height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particles = Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 2 + 1,
    color: Math.random() > 0.5
      ? 'rgba(41, 151, 255, 0.4)'
      : 'rgba(191, 90, 242, 0.35)'
  }));

  function animateMesh() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });

    requestAnimationFrame(animateMesh);
  }

  animateMesh();
}

// Contact form validation
const contactForm = document.getElementById('portfolioContactForm');
const formFeedback = document.getElementById('formFeedback');
const iosToast = document.getElementById('iosToast');

function showToast(message) {
  const msgEl = document.getElementById('toastMessage');

  if (msgEl && iosToast) {
    msgEl.textContent = message;
    iosToast.classList.add('show');
    playHapticSound('action');

    setTimeout(() => {
      iosToast.classList.remove('show');
    }, 4500);
  }
}

if (contactForm && formFeedback) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const subject = document.getElementById('userSubject').value.trim();
    const message = document.getElementById('userMessage').value.trim();

    const showError = text => {
      formFeedback.style.display = 'block';
      formFeedback.className = 'form-feedback';
      formFeedback.style.color = '#ff453a';
      formFeedback.style.background = 'rgba(255, 69, 58, 0.12)';
      formFeedback.style.border = '1px solid rgba(255, 69, 58, 0.3)';
      formFeedback.textContent = text;
      playHapticSound('tap');
    };

    if (!name || !email || !subject || !message) {
      showError('Please fill out all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    formFeedback.style.display = 'none';
    contactForm.reset();
    showToast('Message ready! Opening client or sent successfully.');

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    )}`;

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 800);
  });
}

// Reveal sections and cards as they enter the viewport
const revealElements = document.querySelectorAll(
  '.section-eyebrow, .section-title, .section-desc, .bento-card, .experience-wallet-card'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(element => {
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(element => element.classList.add('active'));
}

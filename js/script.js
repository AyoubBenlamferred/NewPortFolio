// -------------------------------
// PORTFOLIO JS COMPLET
// -------------------------------

document.addEventListener('DOMContentLoaded', function() {

  // --- TITRE UNIQUE POUR TOUT LE SITE ---
  document.title = "Ayoub Benlamferred — Portfolio";

  // --- CANVAS RÉSEAU OPTIMISÉ QHD AVEC EXPLOSIONS ---
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let nodes = [];
  let explosions = [];
  let width, height;
  let resizeTimeout;

  function initCanvas() {
    width = window.innerWidth;
    height = window.innerWidth <= 480 ? 120 : 180;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: 1 + Math.random() * 1.5,
    }));
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initCanvas();
      explosions.forEach(exp => {
        exp.x = Math.min(exp.x, width);
        exp.y = Math.min(exp.y, height);
      });
    }, 200);
  });

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 2 + Math.random() * 3;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.alpha = 1;
      this.life = 40 + Math.random() * 40;
      this.color = `hsla(${180 + Math.random() * 30}, 100%, 70%, ${this.alpha})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 1 / this.life;
      this.radius *= 0.97;
      this.color = `hsla(${180 + Math.random() * 30}, 100%, 70%, ${this.alpha})`;
    }
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15 * (this.alpha * 2);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Ring {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 60 + Math.random() * 40;
      this.lineWidth = 2;
      this.alpha = 1;
      this.growthSpeed = 3 + Math.random() * 3;
    }
    update() {
      this.radius += this.growthSpeed;
      this.alpha -= 0.015;
      this.lineWidth = Math.max(0.5, this.lineWidth * 0.98);
    }
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.7;
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 25 * this.alpha;
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestNode = nodes.reduce((closest, node) => {
      const d = Math.hypot(node.x - mouseX, node.y - mouseY);
      return d < 25 && d < (closest.d || Infinity) ? { node, d } : closest;
    }, {}).node;

    if (closestNode) {
      explosions.push({
        x: closestNode.x,
        y: closestNode.y,
        rings: [new Ring(closestNode.x, closestNode.y)],
        particles: Array.from({ length: 30 }, () => new Particle(closestNode.x, closestNode.y)),
        createdAt: Date.now()
      });
    }
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, '#001a2a');
    gradient.addColorStop(1, '#000913');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = 1 - dist / 150;
          ctx.strokeStyle = `hsla(180, 100%, 70%, ${alpha * 0.3})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.save();
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    explosions.forEach(exp => {
      if (Date.now() - exp.createdAt > exp.rings.length * 200 && exp.rings.length < 3) {
        exp.rings.push(new Ring(exp.x, exp.y));
      }

      exp.rings.forEach(r => { r.update(); r.draw(); });
      exp.particles.forEach(p => { p.update(); p.draw(); });
      exp.particles = exp.particles.filter(p => p.alpha > 0.05);
    });

    explosions = explosions.filter(exp =>
      exp.particles.length > 0 || exp.rings.some(r => r.alpha > 0)
    );

    requestAnimationFrame(animate);
  }

  initCanvas();
  animate();

  // --- MENU HAMBURGER ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('nav ul');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', navToggle.classList.contains('active'));
      document.body.classList.toggle('menu-open', navMenu.classList.contains('active'));
    });
  }

  // --- ANIMATION SCROLL ---
  function checkSections() {
    const triggerBottom = window.innerHeight * 0.85;
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      section.classList.toggle('visible', sectionTop < triggerBottom);
    });
  }

  window.addEventListener('scroll', checkSections);
  window.addEventListener('load', checkSections);
  checkSections();

  // --- ANNEE COURANTE FOOTER ---
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});

// theme.js - Système de thème (lune en sombre, soleil en clair)
// ============================================

// Fonction pour appliquer le thème au chargement
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Par défaut: sombre
  let theme = 'dark'; 
  
  if (savedTheme) {
    theme = savedTheme;
  } else if (!prefersDarkScheme.matches) {
    theme = 'light';
  }
  
  // Appliquer le thème
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

// Fonction pour changer le thème
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  const icon = themeToggle.querySelector('i');
  if (icon) {
    // LOGIQUE QUE VOUS VOULEZ :
    // - Si on est en DARK (sombre) → montre LUNE
    // - Si on est en LIGHT (clair) → montre SOLEIL
    if (theme === 'dark') {
      // Mode sombre → icône LUNE
      icon.className = 'fas fa-moon';
      themeToggle.setAttribute('aria-label', 'Passer en mode clair');
    } else {
      // Mode clair → icône SOLEIL
      icon.className = 'fas fa-sun';
      themeToggle.setAttribute('aria-label', 'Passer en mode sombre');
    }
  }
}

// Bouton retour en haut
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;
  
  backToTopBtn.style.display = 'none';
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'flex';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });
  
  if (window.scrollY > 300) {
    backToTopBtn.style.display = 'flex';
  }
}

// Année du footer
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Système de thème initialisé');
  
  // 1. Appliquer le thème sauvegardé
  applySavedTheme();
  
  // 2. Configurer le bouton thème
  setupThemeToggle();
  
  // 3. Bouton retour en haut
  initBackToTop();
  
  // 4. Année du footer
  initFooterYear();
});


// ============================================
// CURSEUR NEON FUTURISTE - À AJOUTER À LA FIN
// ============================================

// Création des éléments curseur
const cursorOuter = document.createElement('div');
const cursorInner = document.createElement('div');
cursorOuter.className = 'cursor-outer';
cursorInner.className = 'cursor-inner';
document.body.appendChild(cursorOuter);
document.body.appendChild(cursorInner);

// Variables d'animation
let mouseX = 0, mouseY = 0;
let outerX = 0, outerY = 0;
let innerX = 0, innerY = 0;
const outerSpeed = 0.1;
const innerSpeed = 0.3;

// Suivre la souris
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animation fluide
function updateCursor() {
  outerX += (mouseX - outerX) * outerSpeed;
  outerY += (mouseY - outerY) * outerSpeed;
  
  innerX += (mouseX - innerX) * innerSpeed;
  innerY += (mouseY - innerY) * innerSpeed;
  
  cursorOuter.style.transform = `translate(${outerX}px, ${outerY}px)`;
  cursorInner.style.transform = `translate(${innerX}px, ${innerY}px)`;
  
  requestAnimationFrame(updateCursor);
}

// Effets au survol des éléments interactifs
document.addEventListener('DOMContentLoaded', () => {
  const hoverElements = document.querySelectorAll(
    'a, button, .project-card, .nav-toggle, input, textarea, .control-btn'
  );
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOuter.style.width = '40px';
      cursorOuter.style.height = '40px';
      cursorOuter.style.borderColor = '#00ffff';
      cursorOuter.style.boxShadow = '0 0 20px #00ffff, inset 0 0 10px #00ffff';
      
      cursorInner.style.width = '10px';
      cursorInner.style.height = '10px';
      cursorInner.style.backgroundColor = '#00ffff';
      cursorInner.style.boxShadow = '0 0 15px #00ffff';
    });
    
    el.addEventListener('mouseleave', () => {
      cursorOuter.style.width = '30px';
      cursorOuter.style.height = '30px';
      cursorOuter.style.borderColor = '#22d8f8';
      cursorOuter.style.boxShadow = '0 0 10px #22d8f8';
      
      cursorInner.style.width = '6px';
      cursorInner.style.height = '6px';
      cursorInner.style.backgroundColor = '#22d8f8';
      cursorInner.style.boxShadow = '0 0 8px #22d8f8';
    });
  });
  
  // Masquer/Afficher curseur
  document.addEventListener('mouseleave', () => {
    cursorOuter.style.opacity = '0';
    cursorInner.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursorOuter.style.opacity = '1';
    cursorInner.style.opacity = '1';
  });
  
  // Lancer l'animation
  updateCursor();
});

// Désactiver le curseur par défaut
document.querySelectorAll('*').forEach(el => {
  el.style.cursor = 'none';
});    






























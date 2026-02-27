// ========================================
// CURSOR PERSONALIZADO ANIMADO
// ========================================

(function initCustomCursor() {
  // Solo en desktop
  if (window.innerWidth <= 1024) return;
  
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  if (!cursorDot || !cursorOutline) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;
  let trailTimer = null;
  
  // Actualizar posición del cursor
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Mover el punto inmediatamente
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    
    // Crear trail (rastro) ocasionalmente
    if (Math.random() > 0.85) {
      createTrail(mouseX, mouseY);
    }
  });
  
  // Animar el contorno con suavidad
  function animateOutline() {
    const speed = 0.15;
    outlineX += (mouseX - outlineX) * speed;
    outlineY += (mouseY - outlineY) * speed;
    
    cursorOutline.style.left = outlineX + 'px';
    cursorOutline.style.top = outlineY + 'px';
    
    requestAnimationFrame(animateOutline);
  }
  animateOutline();
  
  // Crear rastro del cursor
  function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 500);
  }
  
  // Detectar hover en elementos interactivos
  const interactiveElements = document.querySelectorAll(
    'a, button, .btn, input, textarea, select, .social-link, .nav-link, .card, .project, .skill-chip, .hero-letter'
  );
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
  
  // Efecto de click
  document.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-click');
    createClickParticles(mouseX, mouseY);
  });
  
  document.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-click');
  });
  
  // Crear partículas al hacer click
  function createClickParticles(x, y) {
    const particleCount = 8;
    const angleStep = (Math.PI * 2) / particleCount;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = angleStep * i;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 800);
    }
  }
  
  // Ocultar cursor al salir de la ventana
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorOutline.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorOutline.style.opacity = '1';
  });
  
  console.log('✨ Custom cursor initialized!');
})();

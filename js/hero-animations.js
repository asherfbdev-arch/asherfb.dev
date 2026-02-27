// ========================================
// ANIMACIONES ESPECTACULARES DEL HERO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  
  // Animación del nombre con efecto de escritura y brillo
  function animateHeroName() {
    const heroName = document.getElementById('hero-name');
    if (!heroName) return;
    
    const text = heroName.textContent;
    heroName.textContent = '';
    heroName.style.opacity = '1';
    
    // Crear cada letra con animación individual
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'hero-letter';
      span.style.setProperty('--index', index);
      span.style.animationDelay = `${index * 0.05}s`;
      
      // Agregar evento hover para efecto interactivo
      span.addEventListener('mouseenter', function() {
        this.style.animation = 'letterBounce 0.5s ease';
        setTimeout(() => {
          this.style.animation = '';
        }, 500);
      });
      
      heroName.appendChild(span);
    });
  }
  
  // Efecto de partículas al mover el mouse en el hero
  function initHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let particles = [];
    const maxParticles = 50;
    
    hero.addEventListener('mousemove', (e) => {
      if (particles.length < maxParticles && Math.random() > 0.9) {
        createParticle(e.clientX, e.clientY);
      }
    });
    
    function createParticle(x, y) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      const size = Math.random() * 4 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      document.body.appendChild(particle);
      particles.push(particle);
      
      setTimeout(() => {
        particle.remove();
        particles = particles.filter(p => p !== particle);
      }, 1000);
    }
  }
  
  // Efecto parallax suave en el hero
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const techItems = document.querySelectorAll('.tech-item');
    const orbs = document.querySelectorAll('.hero-gradient-orb');
    
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      // Mover elementos tecnológicos
      techItems.forEach((item, index) => {
        const speed = (index + 1) * 5;
        const x = xPercent * speed;
        const y = yPercent * speed;
        item.style.transform = `translate(${x}px, ${y}px)`;
      });
      
      // Mover orbes de gradiente
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const x = xPercent * speed;
        const y = yPercent * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
    
    hero.addEventListener('mouseleave', () => {
      techItems.forEach(item => {
        item.style.transform = '';
      });
      orbs.forEach(orb => {
        orb.style.transform = '';
      });
    });
  }
  
  // Contador animado para las estadísticas
  function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const text = target.textContent;
          const number = parseInt(text);
          
          if (!isNaN(number)) {
            animateNumber(target, 0, number, 1500);
          }
          
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
  }
  
  function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end + '+';
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + '+';
      }
    }, 16);
  }
  
  // Efecto de brillo en los botones
  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  
  // Animación del scroll indicator
  function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('#sobre-mi');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // Ocultar cuando se hace scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    });
  }
  
  // Inicializar todas las animaciones
  setTimeout(() => {
    animateHeroName();
    initHeroParticles();
    initHeroParallax();
    animateStats();
    initButtonEffects();
    initScrollIndicator();
  }, 100);
  
  console.log('✨ Hero animations loaded successfully!');
});

// Estilos CSS para las animaciones
const heroStyles = document.createElement('style');
heroStyles.textContent = `
  .hero-letter {
    display: inline-block;
    animation: letterReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
    transition: all 0.3s ease;
  }
  
  .hero-letter:hover {
    transform: translateY(-5px) scale(1.2);
    filter: drop-shadow(0 0 10px currentColor);
  }
  
  @keyframes letterReveal {
    from {
      opacity: 0;
      transform: translateY(20px) rotateX(-90deg);
      filter: blur(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0deg);
      filter: blur(0);
    }
  }
  
  @keyframes letterBounce {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-15px) scale(1.3);
    }
  }
  
  .hero-particle {
    position: fixed;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(46, 168, 255, 0.8), transparent);
    pointer-events: none;
    z-index: 9999;
    animation: particleFade 1s ease-out forwards;
  }
  
  @keyframes particleFade {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(var(--tx, 0), var(--ty, -50px)) scale(0);
    }
  }
  
  .btn-ripple {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    animation: rippleExpand 0.6s ease-out forwards;
    pointer-events: none;
  }
  
  @keyframes rippleExpand {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
  
  .scroll-indicator {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .scroll-indicator:hover {
    transform: translateX(-50%) translateY(5px);
  }
  
  .scroll-indicator:hover .scroll-arrow {
    border-color: var(--brand);
  }
`;
document.head.appendChild(heroStyles);

import { playSound } from './sound.js';

export async function transitionTo(oldSlide, newSlide, direction = 1) {
  // direction: 1 for next, -1 for prev
  
  if (oldSlide) {
    oldSlide.classList.remove('active');
    // Force immediate opacity 0 to prevent seeing the old slide during transition
    oldSlide.style.transition = 'none';
    oldSlide.style.opacity = '0';
  }

  const curtain = document.getElementById('transition-curtain');
  const canvas = document.getElementById('transition-canvas');
  
  if (!curtain || !canvas) {
    if (newSlide) newSlide.classList.add('active');
    return;
  }

  const ctx = canvas.getContext('2d');
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // Resize canvas to full viewport
  canvas.width = vw;
  canvas.height = vh;
  ctx.imageSmoothingEnabled = false;

  // Load sprite sheet
  const spriteSheet = new Image();
  spriteSheet.src = '../../assets/SproutLands-Sprites/Characters/Basic Charakter Spritesheet.png';
  
  await new Promise(resolve => {
    if (spriteSheet.complete) resolve();
    else spriteSheet.onload = resolve;
  });

  curtain.style.display = 'block';
  
  // Flash white effect (scene change anime/juego style)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, vw, vh);
  
  // Draw an immediate solid frame to cover any remnants of the old slide
  ctx.fillStyle = 'rgba(9, 12, 16, 0.98)';
  ctx.fillRect(0, 0, vw, vh);
  
  playSound('squick');

  const duration = 800; // ms
  const spriteSize = 48; // original frame size
  const scale = 2.5; // scale factor
  const drawSize = spriteSize * scale; // 120px
  
  // Animation frames
  // Row 2 (left): frames 8,9,10,11
  // Row 3 (right): frames 12,13,14,15
  const row = direction === 1 ? 3 : 2;
  const startX = direction === 1 ? -drawSize : vw + drawSize;
  const endX = direction === 1 ? vw + drawSize : -drawSize;
  
  // Particles array
  const particles = [];
  const speedLines = [];
  
  // Init speed lines
  for (let i = 0; i < 15; i++) {
    speedLines.push({
      x: Math.random() * vw,
      y: Math.random() * vh,
      width: Math.random() * 150 + 80,
      height: Math.random() * 2 + 1,
      speed: Math.random() * 600 + 300,
      opacity: 0,
      delay: Math.random() * 0.4
    });
  }

  function createDust(x, y) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 30 - (direction * 20),
        vy: -Math.random() * 20 - 5,
        life: 1.0,
        maxLife: 0.6 + Math.random() * 0.4,
        size: Math.random() * 6 + 3,
        color: `rgba(${180 + Math.random() * 40}, ${160 + Math.random() * 30}, ${120 + Math.random() * 20}`,
        type: 'dust'
      });
    }
  }

  let lastFrameIndex = -1;

  await new Promise(resolve => {
    let start = performance.now();
    
    function animate(time) {
      let t = (time - start) / duration;
      if (t > 1) t = 1;
      
      const dt = 1 / 60;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(9, 12, 16, 0.95)';
      ctx.fillRect(0, 0, vw, vh);
      
      // Calculate sprite position
      // Using linear movement for consistent running speed
      let easeT = t;
      const currentX = startX + (endX - startX) * easeT;
      const currentY = vh / 2 - drawSize / 2;
      
      // Determine animation frame (12fps = 83ms per frame)
      const frameIndex = Math.floor(t * duration / 83) % 4;
      const frame = frameIndex;
      
      // Draw speed lines first (behind sprite)
      speedLines.forEach(line => {
        if (t > line.delay) {
          const lineT = (t - line.delay) / (1 - line.delay);
          line.x += (direction === 1 ? -1 : 1) * line.speed * dt;
          if (direction === 1 && line.x < -line.width) line.x = vw + line.width;
          if (direction === -1 && line.x > vw + line.width) line.x = -line.width;
          
          const alpha = Math.sin(lineT * Math.PI) * 0.25;
          ctx.fillStyle = `rgba(255, 238, 136, ${alpha})`;
          ctx.fillRect(line.x, line.y, line.width, line.height);
        }
      });
      
      // Spawn dust behind the sprite
      if (t > 0.05 && t < 0.95 && frameIndex % 2 === 0 && frameIndex !== lastFrameIndex) {
        const dustX = direction === 1 ? currentX : currentX + drawSize;
        for (let i = 0; i < 10; i++) { // Spawn a bigger burst once per step
           createDust(dustX, currentY + drawSize * 0.75);
        }
      }
      lastFrameIndex = frameIndex;
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt / p.maxLife;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 30 * dt; // gravity
        p.size += dt * 8;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      
      // Draw sprite shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(currentX + drawSize / 2, currentY + drawSize * 0.85, drawSize * 0.35, drawSize * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw sprite frame
      const srcX = frame * spriteSize;
      const srcY = row * spriteSize;
      
      ctx.drawImage(
        spriteSheet,
        srcX, srcY, spriteSize, spriteSize,
        currentX, currentY, drawSize, drawSize
      );
      
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(animate);
  });
  
  curtain.style.display = 'none';
  ctx.clearRect(0, 0, vw, vh);

  // Restore old slide transition styles so future transitions work correctly
  if (oldSlide) {
    oldSlide.style.transition = '';
    oldSlide.style.opacity = '';
  }

  if (newSlide) {
    newSlide.classList.add('active');
    playSound('bip');
  }
}

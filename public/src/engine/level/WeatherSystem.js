/**
 * Sistema climatico reutilizable para escenas Phaser.
 * Soporta multiples efectos simultaneos: lluvia, nieve, polen, hojas, niebla,
 * polvo, viento, tormenta (particulas) y noche (overlay semitransparente).
 * Formato: { rain: 0.6, snow: 0, pollen: 0, leaves: 0, night: 0.5, ... }
 * Valor 0 = desactivado. Rango 0.0 - 1.0.
 */

export const WEATHER_TYPES = ['rain', 'snow', 'pollen', 'leaves', 'night', 'fog', 'dust', 'wind', 'storm'];

export const DEFAULT_WEATHER = {
  rain: 0,
  snow: 0,
  pollen: 0,
  leaves: 0,
  night: 0,
  fog: 0,
  dust: 0,
  wind: 0,
  storm: 0,
};

const COLORS = {
  rain: 0xddeeff,
  snow: 0xffffff,
  pollen: 0xfff0aa,
  leaves: 0x8b5a2b,
  night: 0x0a0a1a,
  fog: 0xcccccc,
  dust: 0xc2a374,
  wind: 0xddeeff,
  storm: 0x556677,
};

const LABELS = {
  rain: 'Rain',
  snow: 'Snow',
  pollen: 'Pollen',
  leaves: 'Leaves',
  night: 'Night',
  fog: 'Fog',
  dust: 'Dust',
  wind: 'Wind',
  storm: 'Storm',
};

export function getWeatherLabel(type) {
  return window.__t?.('weather.' + type) ?? LABELS[type] ?? type;
}

/** Limpia todos los efectos climaticos activos de la escena. */
export function destroyWeather(scene) {
  if (scene.__weatherEmitters) {
    for (const em of scene.__weatherEmitters) em.destroy();
    scene.__weatherEmitters = [];
  }
  if (scene.__weatherOverlays) {
    for (const ov of scene.__weatherOverlays) ov.destroy();
    scene.__weatherOverlays = [];
  }
  if (scene.__weatherTimers) {
    for (const tm of scene.__weatherTimers) tm.destroy();
    scene.__weatherTimers = [];
  }
  scene.__weatherActive = null;
}

/** Crea uno o mas efectos climaticos segun el objeto de configuracion. */
export function createWeather(scene, config = DEFAULT_WEATHER) {
  destroyWeather(scene);
  if (!config) return;

  scene.__weatherEmitters = [];
  scene.__weatherOverlays = [];
  scene.__weatherTimers = [];
  scene.__weatherActive = { ...config };

  const W = scene.cols * 16;
  const H = scene.rows * 16;

  for (const type of WEATHER_TYPES) {
    const intensity = config[type] ?? 0;
    if (intensity <= 0) continue;

    if (type === 'night') {
      const alpha = 0.25 + intensity * 0.55;
      const ov = scene.add.rectangle(0, 0, W, H, COLORS.night, alpha)
        .setOrigin(0)
        .setDepth(200)
        .setScrollFactor(0);
      scene.__weatherOverlays.push(ov);
    } else if (type === 'storm') {
      _createLightningTimer(scene, intensity, W, H);
    } else if (type === 'wind') {
      _createWindEffect(scene, intensity, W, H);
    } else {
      const cfg = _particleConfig(type, intensity, W, H);
      // El sistema de particulas de Phaser 3.60+ crea internamente un manager
      // en la display list, pero no expone una API estable para acceder a el.
      // Detectamos el objeto recien creado comparando la lista de hijos antes
      // y despues de crear el emitter.
      const before = scene.children.list.length;
      const emitter = scene.add.particles(0, 0, 'pixel', cfg);
      const after = scene.children.list.length;

      let target;
      if (after > before) {
        // El ultimo objeto anadido es el manager/contenedor real
        const manager = scene.children.list[after - 1];
        manager.setDepth(200);
        manager.setScrollFactor(0);
        target = manager;
      } else {
        emitter.setDepth(200);
        emitter.setScrollFactor(0);
        target = emitter;
      }
      scene.__weatherEmitters.push(target);
    }
  }
}

/** Timer de relampagos realistas con iluminacion local. Frecuencia proporcional a intensidad. */
function _createLightningTimer(scene, intensity, mapW, mapH) {
  const i = Math.max(0, Math.min(1, intensity));
  const baseDelay = 5000 - Math.floor(i * 3500); // 5000ms a 1500ms
  const variance = Math.floor(baseDelay * 0.5);

  const timer = scene.time.addEvent({
    delay: baseDelay,
    loop: true,
    callback: () => {
      _drawLightning(scene, i, mapW, mapH);
      // Variar el siguiente delay para efecto aleatorio
      timer.delay = baseDelay + (Math.random() * variance * 2 - variance);
    },
  });
  scene.__weatherTimers.push(timer);
}

/** Efecto de viento multicapa: bruma + viento lejano + viento cercano sincronizados. */
function _createWindEffect(scene, intensity, mapW, mapH) {
  const i = Math.max(0, Math.min(1, intensity));

  const layerDefs = [
    {
      key: 'haze', texture: 'wind_haze', depth: 15, poolSize: 4,
      baseScaleX: 1.0, scaleXVar: 0.4,
      baseScaleY: 1.0,
      baseAlpha: 0.05, alphaVar: 0.02,
      speedFactor: 1.5, durationBase: 550,
      hasWobble: false, wobbleAmp: 0,
      count: { min: 1, max: Math.max(1, Math.round(1 + i)) }
    },
    {
      key: 'far', texture: 'wind_streak', depth: 25, poolSize: 8,
      baseScaleX: 2.0, scaleXVar: 0.5,
      baseScaleY: 2.0,
      baseAlpha: 0.05, alphaVar: 0.02,
      speedFactor: 0.7, durationBase: 1400,
      hasWobble: true, wobbleAmp: 8,
      count: { min: 1, max: Math.max(1, Math.round(1 + i * 2)) }
    },
    {
      key: 'near', texture: 'wind_streak', depth: 210, poolSize: 12,
      baseScaleX: 0.9, scaleXVar: 0.3,
      baseScaleY: 2.0,
      baseAlpha: 0.14, alphaVar: 0.04,
      speedFactor: 1.3, durationBase: 850,
      hasWobble: true, wobbleAmp: 15,
      count: { min: 1, max: Math.max(1, Math.round(1 + i * 3)) }
    }
  ];

  const layers = layerDefs.map(def => {
    const pool = [];
    for (let p = 0; p < def.poolSize; p++) {
      const sprite = scene.add.sprite(-300, -300, def.texture)
        .setDepth(def.depth)
        .setScrollFactor(0)
        .setVisible(false)
        .setAlpha(0);
      pool.push({ sprite, active: false, tweens: [] });
    }

    return {
      ...def,
      pool,
      spawn() {
        const count = def.count.min + Math.floor(Math.random() * (def.count.max - def.count.min + 1));
        for (let c = 0; c < count; c++) {
          const item = this.pool.find(p => !p.active);
          if (!item) continue;

          item.active = true;
          item.tweens.forEach(t => t.stop());
          item.tweens = [];

          const startY = Math.random() * mapH;
          const scaleX = def.baseScaleX * (1 - def.scaleXVar / 2 + Math.random() * def.scaleXVar);
          const duration = def.durationBase / def.speedFactor * (0.85 + Math.random() * 0.3);
          const alpha = def.baseAlpha + (Math.random() - 0.5) * def.alphaVar * 2;

          const sprite = item.sprite;
          sprite.setPosition(-180 - Math.random() * 80, startY);
          sprite.setVisible(true);
          sprite.setAlpha(0);
          sprite.setScale(scaleX, def.baseScaleY);
          sprite.setAngle((Math.random() - 0.5) * 8);

          // Tween horizontal principal
          const t1 = scene.tweens.add({
            targets: sprite,
            x: mapW + 180 + Math.random() * 80,
            duration,
            ease: 'Linear',
            onComplete: () => {
              sprite.setVisible(false);
              item.active = false;
            }
          });

          // Wobble Y
          if (def.hasWobble) {
            const t2 = scene.tweens.add({
              targets: sprite,
              y: startY + (Math.random() - 0.5) * def.wobbleAmp,
              duration: duration * 0.25,
              yoyo: true,
              repeat: 3,
              ease: 'Sine.easeInOut'
            });
            item.tweens.push(t2);
          }

          // Fade in
          const t3a = scene.tweens.add({
            targets: sprite,
            alpha: Math.max(0, alpha),
            duration: duration * 0.1,
            ease: 'Linear'
          });

          // Fade out
          const t3b = scene.tweens.add({
            targets: sprite,
            alpha: 0,
            duration: duration * 0.12,
            delay: Math.max(0, duration * 0.68),
            ease: 'Linear'
          });

          item.tweens.push(t1, t3a, t3b);
        }
      },
      destroy() {
        this.pool.forEach(item => {
          item.tweens.forEach(t => t.stop());
          item.sprite.destroy();
        });
      }
    };
  });

  // Timer maestro de rafagas sincronizadas
  const baseDelay = 1800 - Math.floor(i * 600);
  const variance = Math.floor(baseDelay * 0.5);

  const timer = scene.time.addEvent({
    delay: baseDelay,
    loop: true,
    callback: () => {
      layers.forEach(layer => layer.spawn());
      timer.delay = baseDelay + Math.floor(Math.random() * variance * 2 - variance);
    }
  });

  scene.__weatherTimers.push(timer);

  scene.__weatherEmitters.push({
    destroy() {
      layers.forEach(l => l.destroy());
    }
  });
}

/** Dibuja un relampago realista: overlay tenue + glow local + linea zigzag con ramas. */
function _drawLightning(scene, i, mapW, mapH) {
  const impactX = Math.random() * mapW;
  const impactY = (0.6 + Math.random() * 0.4) * mapH;
  const startX = impactX + (Math.random() * 40 - 20);
  const startY = 0;
  const segments = 6 + Math.floor(Math.random() * 5);
  const segH = (impactY - startY) / segments;

  // 1. Overlay ambiental tenue (depth 204)
  const ambient = scene.add.rectangle(0, 0, mapW, mapH, 0xffffff, 0.03 + i * 0.07)
    .setOrigin(0)
    .setDepth(204)
    .setScrollFactor(0);

  // 2. Circulo de luz difusa ADD (depth 205)
  const glowRadius = 60 + Math.floor(i * 60);
  const glow = scene.add.circle(impactX, impactY, glowRadius, 0xe0e8ff)
    .setDepth(205)
    .setScrollFactor(0)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setAlpha(0.2 + i * 0.3);

  // 3. Linea zigzag con ramas en container (depth 210)
  const container = scene.add.container(0, 0)
    .setDepth(210)
    .setScrollFactor(0)
    .setAlpha(0.9);

  const gfx = scene.add.graphics();
  container.add(gfx);
  gfx.lineStyle(3, 0xe0e8ff, 0.9);

  let currentX = startX;
  let currentY = startY;

  for (let s = 0; s < segments; s++) {
    const nextX = currentX + (Math.random() * 40 - 20);
    const nextY = currentY + segH;
    gfx.lineBetween(currentX, currentY, nextX, nextY);

    // Ramificacion (25% de probabilidad)
    if (Math.random() < 0.25) {
      const branchAngle = (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 90);
      const branchLen = 20 + Math.random() * 20;
      const rad = branchAngle * Math.PI / 180;
      const branchX = nextX + Math.cos(rad) * branchLen;
      const branchY = nextY + Math.sin(rad) * branchLen;
      gfx.lineBetween(nextX, nextY, branchX, branchY);
    }

    currentX = nextX;
    currentY = nextY;
  }

  // Fade-out simultaneo de todas las capas
  const fadeDuration = 100 + Math.floor(i * 100);
  scene.tweens.add({
    targets: [ambient, glow, container],
    alpha: 0,
    duration: fadeDuration,
    onComplete: () => {
      ambient.destroy();
      glow.destroy();
      container.destroy();
    },
  });
}

function _particleConfig(type, intensity, mapW, mapH) {
  const base = {
    x: { min: 0, max: mapW },
    lifespan: 800,
    scale: { start: 0.4, end: 0.4 },
    tint: COLORS[type],
    blendMode: 'NORMAL',
    quantity: 1,
    frequency: 100,
  };

  const i = Math.max(0, Math.min(1, intensity));

  switch (type) {
    case 'rain':
      return {
        ...base,
        y: -12,
        lifespan: 500 + Math.floor(i * 300),
        speedY: { min: 160 + i * 120, max: 220 + i * 160 },
        speedX: { min: 5 + i * 10, max: 15 + i * 25 },
        scaleX: { start: 0.3 + i * 0.2, end: 0.3 + i * 0.2 },
        scaleY: { start: 1.2 + i * 0.8, end: 1.2 + i * 0.8 },
        quantity: 2 + Math.floor(i * 5),
        frequency: 100 - Math.floor(i * 80),
        alpha: { start: 1.0, end: 0.85 },
      };

    case 'snow':
      return {
        ...base,
        y: -4,
        lifespan: 2000 + Math.floor(i * 2500),
        speedY: { min: 15 + i * 20, max: 35 + i * 40 },
        speedX: { min: -20 - i * 20, max: 20 + i * 20 },
        scale: { start: 0.25 + i * 0.2, end: 0.25 + i * 0.2 },
        quantity: 1 + Math.floor(i * 3),
        frequency: 250 - Math.floor(i * 220),
        alpha: { start: 0.8, end: 0.1 },
        rotate: { start: 0, end: 180 },
      };

    case 'pollen':
      return {
        ...base,
        x: { min: -10, max: mapW + 10 },
        y: { min: mapH - 20, max: mapH + 10 },
        lifespan: 1800 + Math.floor(i * 1500),
        speedY: { min: -10 - i * 15, max: -5 - i * 10 },
        speedX: { min: 8 + i * 10, max: 25 + i * 25 },
        scale: { start: 0.2 + i * 0.15, end: 0.2 + i * 0.15 },
        quantity: 1 + Math.floor(i * 3),
        frequency: 180 - Math.floor(i * 160),
        alpha: { start: 0.7, end: 0 },
      };

    case 'leaves':
      return {
        ...base,
        x: { min: -10, max: mapW + 10 },
        y: -4,
        lifespan: 1500 + Math.floor(i * 1500),
        speedY: { min: 30 + i * 30, max: 60 + i * 60 },
        speedX: { min: -30 - i * 30, max: 30 + i * 30 },
        scale: { start: 0.4 + i * 0.3, end: 0.4 + i * 0.3 },
        quantity: 1 + Math.floor(i * 3),
        frequency: 300 - Math.floor(i * 270),
        alpha: { start: 0.9, end: 0.2 },
        rotate: { start: 0, end: 360 },
        angle: { min: -20, max: 20 },
      };

    case 'fog':
      return {
        ...base,
        x: { min: -20, max: mapW + 20 },
        y: { min: -10, max: mapH + 10 },
        lifespan: 4000 + Math.floor(i * 2000),
        speedY: { min: -5 - i * 5, max: 5 + i * 5 },
        speedX: { min: 3 + i * 8, max: 10 + i * 15 },
        scale: { start: 0.8 + i * 0.4, end: 0.8 + i * 0.4 },
        quantity: 1 + Math.floor(i * 2),
        frequency: 300 - Math.floor(i * 250),
        alpha: { start: 0.1 + i * 0.15, end: 0.05 },
      };

    case 'dust':
      return {
        ...base,
        x: { min: -10, max: mapW + 10 },
        y: { min: -10, max: mapH * 0.6 },
        lifespan: 2000 + Math.floor(i * 1500),
        speedY: { min: 20 + i * 20, max: 40 + i * 40 },
        speedX: { min: 30 + i * 20, max: 50 + i * 30 },
        scale: { start: 0.3 + i * 0.2, end: 0.3 + i * 0.2 },
        quantity: 1 + Math.floor(i * 3),
        frequency: 180 - Math.floor(i * 150),
        alpha: { start: 0.5 + i * 0.3, end: 0.1 },
        rotate: { start: 0, end: 90 },
      };

    default:
      return base;
  }
}

export function getDefaultWeather() {
  return { ...DEFAULT_WEATHER };
}

/** Migra formato antiguo { type, intensity } al nuevo formato. */
export function migrateWeather(old) {
  if (!old) return getDefaultWeather();
  if (typeof old !== 'object' || Array.isArray(old)) return getDefaultWeather();
  // Si ya tiene las claves del formato nuevo, devolver copia
  if (WEATHER_TYPES.some(t => old[t] !== undefined)) {
    return { ...DEFAULT_WEATHER, ...old };
  }
  // Formato antiguo: { type, intensity }
  const migrated = getDefaultWeather();
  if (old.type && old.type !== 'none') {
    migrated[old.type] = old.intensity ?? 0.5;
  }
  return migrated;
}

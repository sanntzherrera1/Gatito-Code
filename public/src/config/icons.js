export const ICONS = {
  gato:     [3, 2],
  gatoFeliz:[3, 5],
  sprout:   [0, 12],
  manzana:  [0, 13],
  jardin:   [2, 12],
  control:  [0, 11],
  estrella: [4, 8],
  pregunta: [3, 7],
  pulgar:   [0, 9],
  check:    [0, 7],
};

export function ico(name) {
  const [c, r] = ICONS[name] || [0, 0];
  return `<i class="gico" style="--c:${c};--r:${r}"></i>`;
}

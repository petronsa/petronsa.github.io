// Dibuja un plano en SVG, con el mismo estilo que la app.
import { geometriaCota, limites } from './planos.js';

const NS = 'http://www.w3.org/2000/svg';
const nodo = (tipo, attrs = {}, padre) => {
  const n = document.createElementNS(NS, tipo);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (padre) padre.appendChild(n);
  return n;
};

let idPatron = 0;

/**
 * Pinta [elementos] dentro de [contenedor] ajustados a su tamaño.
 * [etiquetas]: texto por letra ("A  90"). [seleccion]: letra resaltada.
 */
export function pintarPlano(contenedor, elementos, etiquetas, seleccion, onSeleccion) {
  const ancho = Math.max(contenedor.clientWidth, 200);
  const alto = Math.max(contenedor.clientHeight, 200);
  const margen = 28;
  const lim = limites(elementos);
  const escala = Math.min((ancho - 2 * margen) / (lim.maxX - lim.minX), (alto - 2 * margen) / (lim.maxY - lim.minY));
  const ox = (ancho - (lim.maxX - lim.minX) * escala) / 2;
  const oy = (alto - (lim.maxY - lim.minY) * escala) / 2;
  const mapa = ([x, y]) => [ox + (x - lim.minX) * escala, oy + (lim.maxY - y) * escala];
  const ruta = (pts, cerrado) => pts.map((p, i) => (i ? 'L' : 'M') + mapa(p).map((v) => v.toFixed(2)).join(' ')).join('') + (cerrado ? 'Z' : '');

  contenedor.replaceChildren();
  const svg = nodo('svg', { width: ancho, height: alto, viewBox: `0 0 ${ancho} ${alto}`, class: 'plano-svg', role: 'img' }, contenedor);

  const patron = `rayado-${++idPatron}`;
  const defs = nodo('defs', {}, svg);
  const pat = nodo('pattern', { id: patron, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  nodo('rect', { width: 7, height: 7, class: 'macizo-fondo' }, pat);
  nodo('line', { x1: 0, y1: 0, x2: 0, y2: 7, class: 'macizo-raya' }, pat);

  for (const el of elementos.filter((e) => e.t === 'macizo')) {
    nodo('path', { d: el.p.map((c) => ruta(c, true)).join(''), 'fill-rule': 'evenodd', fill: `url(#${patron})`, class: 'macizo' }, svg);
  }
  for (const el of elementos.filter((e) => e.t === 'trazo')) {
    nodo('path', { d: ruta(el.p, el.c), class: `trazo ${el.e.toLowerCase()}` }, svg);
  }

  const cotas = elementos.filter((e) => e.t === 'cota').sort((a, b) => (a.l === seleccion) - (b.l === seleccion));
  for (const c of cotas) {
    const g = geometriaCota(c);
    const sel = c.l === seleccion;
    const grupo = nodo('g', { class: 'cota' + (sel ? ' seleccionada' : ''), tabindex: 0, role: 'button', 'aria-label': etiquetas[c.l] }, svg);
    const [a, b] = [mapa(g.ini), mapa(g.fin)];
    if (Math.abs(c.o) > 0.01) {
      for (const [origen, destino] of [[mapa(c.d), a], [mapa(c.h), b]]) {
        const v = [destino[0] - origen[0], destino[1] - origen[1]];
        const l = Math.hypot(...v);
        if (l > 0.5) nodo('line', { x1: origen[0], y1: origen[1], x2: destino[0] + (v[0] / l) * 4, y2: destino[1] + (v[1] / l) * 4, class: 'referencia' }, grupo);
      }
    }
    nodo('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'linea' }, grupo);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const m = [(d[0] - d[1]) * 2.8, (d[1] + d[0]) * 2.8];
    for (const p of [a, b]) nodo('line', { x1: p[0] - m[0], y1: p[1] - m[1], x2: p[0] + m[0], y2: p[1] + m[1], class: 'marca' }, grupo);

    const [cx, cy] = mapa(g.centro);
    const fondo = nodo('rect', { class: 'etiqueta-fondo', rx: 6 }, grupo);
    const texto = nodo('text', { x: cx, y: cy, class: 'etiqueta', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, grupo);
    texto.textContent = etiquetas[c.l] ?? c.l;
    const caja = texto.getBBox();
    fondo.setAttribute('x', caja.x - 5);
    fondo.setAttribute('y', caja.y - 2);
    fondo.setAttribute('width', caja.width + 10);
    fondo.setAttribute('height', caja.height + 4);

    const elegir = () => onSeleccion?.(sel ? null : c.l);
    grupo.addEventListener('click', elegir);
    grupo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
  }
}

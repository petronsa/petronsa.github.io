// Planos acotados de la app Chimenea, en JavaScript.
// Es una traducción fiel de core/planos (Kotlin). El test web/pruebas/paridad.mjs
// comprueba que ambos dibujan exactamente lo mismo.
//
// IMPORTANTE: la web es pública y la app es de pago. Aquí NO hay tabla de medidas ni
// cálculo: solo se dibujan medidas que ya vienen calculadas (en el enlace compartido).

/** Cotas en orden, con su grupo. */
export const COTAS = [
  { letra: 'A', grupo: 'BOCA' },
  { letra: 'B', grupo: 'BOCA' },
  { letra: 'C', grupo: 'HOGAR' },
  { letra: 'D', grupo: 'HOGAR' },
  { letra: 'E', grupo: 'HOGAR' },
  { letra: 'F', grupo: 'HOGAR' },
  { letra: 'G', grupo: 'REGISTRO' },
  { letra: 'H', grupo: 'REGISTRO' },
  { letra: 'J', grupo: 'REGISTRO' },
  { letra: 'L', grupo: 'CAMARA_HUMOS' },
  { letra: 'M', grupo: 'CAMARA_HUMOS' },
  { letra: 'N', grupo: 'CAMARA_HUMOS' },
  { letra: 'O', grupo: 'CAMARA_HUMOS', paso: 0.5, visible: false },
  { letra: 'P', grupo: 'CONDUCTO' },
  { letra: 'Q', grupo: 'CONDUCTO' },
  { letra: 'R', grupo: 'CONDUCTO' },
].map((c) => ({ paso: 1, visible: true, ...c }));

export const COTAS_VISIBLES = COTAS.filter((c) => c.visible);
export const GRUPOS = ['BOCA', 'HOGAR', 'REGISTRO', 'CAMARA_HUMOS', 'CONDUCTO'];
export const VISTAS = ['ALZADO', 'SECCION', 'PLANTA', 'CONDUCTO'];

// ---------------------------------------------------------------- Planos

export const MURO = 12.0;
export const PARED_CONDUCTO = 8.0;
export const ZOCALO_DIBUJO = 20.0;
export const VUELO_ZOCALO = 10.0;
export const TRAMO_CONDUCTO = 50.0;

const P = (x, y) => [x, y];
const rect = (x0, y0, x1, y1) => [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)];
const espejo = (pts) => pts.map(([x, y]) => P(-x, y));
const circulo = (cx, cy, r, lados = 64) =>
  Array.from({ length: lados }, (_, i) => {
    const a = (2 * Math.PI * i) / lados;
    return P(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });

const trazo = (p, cerrado = false, estilo = 'CONTORNO') => ({ t: 'trazo', p, c: cerrado, e: estilo });
const macizo = (contornos) => ({ t: 'macizo', p: contornos });
const cota = (letra, desde, hasta, desplazamiento = 0) => ({ t: 'cota', l: letra, d: desde, h: hasta, o: desplazamiento });

function variables(m) {
  const v = m.valores;
  const r = {
    a: v.A, b: v.B, c: v.C, d: v.D, e: v.E, f: v.F, g: v.G, h: v.H, j: v.J,
    l: v.L, mm: v.M, n: v.N, p: v.P, q: v.Q, r: v.R, s: ZOCALO_DIBUJO,
  };
  r.hR = r.e + r.f;
  r.hC = r.hR + r.n;
  r.hTope = r.hC + TRAMO_CONDUCTO;
  r.ext = r.l / 2 + MURO;
  r.zx = r.ext + VUELO_ZOCALO;
  return r;
}

function alzado(m) {
  const { a, b, d, e, f, h, l, n, q, s, hR, hC, hTope, ext, zx } = variables(m);
  const el = [];
  el.push(trazo(rect(-zx, -s, zx, 0), true));
  const ladoExt = [P(-ext, 0), P(-ext, hR), P(-(q / 2 + MURO), hC), P(-(q / 2 + MURO), hTope)];
  el.push(trazo(ladoExt));
  el.push(trazo(espejo(ladoExt)));
  el.push(trazo([P(-ext, hR), P(ext, hR)]));
  const ladoInt = [P(-l / 2, hR), P(-q / 2, hC), P(-q / 2, hTope)];
  el.push(trazo(ladoInt, false, 'OCULTO'));
  el.push(trazo(espejo(ladoInt), false, 'OCULTO'));
  el.push(trazo(rect(-a / 2, 0, a / 2, b), true));
  el.push(trazo([P(-d / 2, 0), P(-d / 2, e), P(d / 2, e), P(d / 2, 0)], false, 'INTERIOR'));
  const t = Math.min(Math.max((b - e) / f, 0), 1);
  const xCorte = d / 2 + t * (h / 2 - d / 2);
  const yCorte = e + t * f;
  el.push(trazo([P(-d / 2, e), P(-xCorte, yCorte)], false, 'INTERIOR'));
  el.push(trazo([P(d / 2, e), P(xCorte, yCorte)], false, 'INTERIOR'));
  el.push(trazo([P(-xCorte, yCorte), P(-h / 2, hR), P(h / 2, hR), P(xCorte, yCorte)], false, 'OCULTO'));

  el.push(cota('A', P(-a / 2, 0), P(a / 2, 0), -(s + 14)));
  el.push(cota('B', P(a / 2, b), P(a / 2, 0), ext - a / 2 + 16));
  el.push(cota('E', P(-ext, 0), P(-ext, e), 36));
  el.push(cota('F', P(-ext, e), P(-ext, hR), 36));
  el.push(cota('N', P(-ext, hR), P(-ext, hC), 36));
  el.push(cota('S', P(zx, -s), P(zx, 0), -12));
  el.push(cota('D', P(-d / 2, e * 0.45), P(d / 2, e * 0.45), 0));
  el.push(cota('H', P(-h / 2, hR), P(h / 2, hR), -13));
  el.push(cota('L', P(-l / 2, hR), P(l / 2, hR), 16));
  el.push(cota('Q', P(-q / 2, hC + TRAMO_CONDUCTO * 0.7), P(q / 2, hC + TRAMO_CONDUCTO * 0.7), 0));
  return el;
}

function seccion(m) {
  const { b, c, e, f, g, j, mm, p, s, hR, hC, hTope } = variables(m);
  const xConducto = -(mm - p);
  const el = [];
  el.push(trazo(rect(-mm - MURO, -s, MURO + VUELO_ZOCALO, 0), true));
  el.push(macizo([rect(-mm - MURO, 0, -mm, hTope)]));
  el.push(macizo([[P(-mm, 0), P(-c, 0), P(-c, e), P(-g, hR), P(-mm, hR)]]));
  el.push(macizo([[
    P(0, b), P(MURO, b), P(MURO, hR), P(xConducto + MURO, hC),
    P(xConducto + MURO, hTope), P(xConducto, hTope), P(xConducto, hC), P(0, hR),
  ]]));
  el.push(trazo(rect(0, 0, MURO, b), true));

  el.push(cota('C', P(-c, e * 0.4), P(0, e * 0.4), 0));
  el.push(cota('M', P(-mm, e + f * 0.45), P(0, e + f * 0.45), 0));
  el.push(cota('G', P(-g, hR), P(0, hR), -10));
  el.push(cota('J', P(-j, hR), P(0, hR), 14));
  el.push(cota('P', P(-mm, hC + TRAMO_CONDUCTO * 0.55), P(xConducto, hC + TRAMO_CONDUCTO * 0.55), 0));
  return el;
}

function planta(m) {
  const { a, c, d, l, mm, ext, zx } = variables(m);
  const el = [];
  el.push(trazo(rect(-zx, -20, zx, mm + MURO), true, 'INTERIOR'));
  el.push(macizo([[
    P(-ext, 0), P(-ext, mm + MURO), P(ext, mm + MURO), P(ext, 0),
    P(l / 2, 0), P(l / 2, mm), P(-l / 2, mm), P(-l / 2, 0),
  ]]));
  el.push(macizo([[
    P(-l / 2, 0), P(-a / 2, 0), P(-d / 2, c), P(d / 2, c),
    P(a / 2, 0), P(l / 2, 0), P(l / 2, mm), P(-l / 2, mm),
  ]]));
  el.push(trazo([P(-a / 2, 0), P(-d / 2, c), P(d / 2, c), P(a / 2, 0)], true));

  el.push(cota('L', P(-l / 2, mm), P(l / 2, mm), MURO + 12));
  el.push(cota('M', P(-l / 2, 0), P(-l / 2, mm), MURO + VUELO_ZOCALO + 12));
  el.push(cota('A', P(-a / 2, 0), P(a / 2, 0), -32));
  el.push(cota('D', P(-d / 2, c), P(d / 2, c), 9));
  el.push(cota('C', P(0, 0), P(0, c), 0));
  return el;
}

function conducto(m) {
  const { p, q, r } = variables(m);
  const w = PARED_CONDUCTO;
  const el = [];
  el.push(macizo([circulo(0, 0, r / 2 + w), circulo(0, 0, r / 2)]));
  const k = r / 2 / Math.sqrt(2);
  el.push(cota('R', P(-k, -k), P(k, k), 0));
  const cx = r / 2 + w + 40 + q / 2 + w;
  el.push(macizo([
    rect(cx - q / 2 - w, -p / 2 - w, cx + q / 2 + w, p / 2 + w),
    rect(cx - q / 2, -p / 2, cx + q / 2, p / 2),
  ]));
  el.push(cota('Q', P(cx - q / 2, -p / 2), P(cx + q / 2, -p / 2), -(w + 12)));
  el.push(cota('P', P(cx + q / 2, -p / 2), P(cx + q / 2, p / 2), -(w + 12)));
  return el;
}

const GENERADORES = { ALZADO: alzado, SECCION: seccion, PLANTA: planta, CONDUCTO: conducto };

/**
 * Elementos del plano [vista] a escala real (cm), eje Y hacia arriba.
 * [medidas] = { valores: { B: 75, C: 40, … }, zocalo: { min, max } }.
 */
export function dibujar(vista, medidas) {
  return GENERADORES[vista](medidas);
}

/** Geometría de una cota: línea desplazada, centro y longitud. */
export function geometriaCota(c) {
  const [dx, dy] = [c.h[0] - c.d[0], c.h[1] - c.d[1]];
  const len = Math.hypot(dx, dy);
  const n = [-dy / len, dx / len];
  const ini = [c.d[0] + n[0] * c.o, c.d[1] + n[1] * c.o];
  const fin = [c.h[0] + n[0] * c.o, c.h[1] + n[1] * c.o];
  return { ini, fin, centro: [(ini[0] + fin[0]) / 2, (ini[1] + fin[1]) / 2], longitud: len };
}

/** Todos los puntos de un plano (para calcular los límites). */
export function limites(elementos) {
  const pts = [];
  for (const el of elementos) {
    if (el.t === 'trazo') pts.push(...el.p);
    else if (el.t === 'macizo') el.p.forEach((c) => pts.push(...c));
    else {
      const g = geometriaCota(el);
      pts.push(el.d, el.h, g.ini, g.fin);
    }
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

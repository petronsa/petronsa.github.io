// Lectura de los enlaces que comparte la app:
// https://petronsa.github.io/Chimenea/p/#v=2&a=98&n=…&c=…&t=…&m=B75,C40,…&z=10,40
// Las medidas llegan ya calculadas por la app; la web no calcula nada.
import { COTAS_VISIBLES } from './planos.js';

const MAX_TEXTO = 2000;
const NECESARIAS = COTAS_VISIBLES.map((c) => c.letra).filter((l) => l !== 'A');

/**
 * Devuelve { nombre, cliente, notas, ancho, medidas } o
 * { antiguo: true } para enlaces v1 (solo ancho, sin medidas), o null si no es válido.
 */
export function leerEnlace(enlace) {
  const i = enlace.indexOf('#');
  const fragmento = i >= 0 ? enlace.slice(i + 1) : enlace;
  const v = {};
  for (const par of fragmento.split('&')) {
    const k = par.indexOf('=');
    if (k <= 0) continue;
    try {
      v[par.slice(0, k)] = decodeURIComponent(par.slice(k + 1).replace(/\+/g, ' ')).slice(0, MAX_TEXTO);
    } catch {
      /* fragmento malformado: se ignora */
    }
  }

  const ancho = /^\d+$/.test(v.a ?? '') ? Number(v.a) : NaN;
  if (!Number.isInteger(ancho) || ancho < 20 || ancho > 400) return null;
  if (!v.m) return { antiguo: true, ancho };

  const valores = { A: ancho };
  for (const item of v.m.split(',')) {
    const m = /^([A-Z])(\d+(?:\.\d+)?)$/.exec(item.trim());
    if (m) valores[m[1]] = Number(m[2]);
  }
  if (!NECESARIAS.every((l) => Number.isFinite(valores[l]) && valores[l] > 0 && valores[l] < 1000)) return null;

  const z = (v.z ?? '10,40').split(',').map(Number);
  const zocalo = z.length === 2 && z.every(Number.isFinite) ? { min: z[0], max: z[1] } : { min: 10, max: 40 };

  return {
    nombre: (v.n ?? '').trim(),
    cliente: (v.c ?? '').trim(),
    notas: (v.t ?? '').trim(),
    ancho,
    medidas: { ancho, valores, zocalo },
  };
}

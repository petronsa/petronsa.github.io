// Visor de una chimenea: planos acotados + lista de medidas, enlazados.
// Recibe las medidas ya calculadas (la web no tiene la tabla).
import { COTAS_VISIBLES, GRUPOS, VISTAS, dibujar } from './planos.js';
import { pintarPlano } from './dibujo.js';
import { num, t } from './i18n.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CANDADO = '🔒';

/**
 * Monta el visor en [raiz].
 * - medidas: { valores: {A, B, …}, zocalo: {min, max} }
 * - ocultas: letras que no se muestran (demo): salen con candado.
 * - vistas: pestañas disponibles (por defecto, todas).
 */
export function montarVisor(raiz, { medidas, ocultas = [], vistas = VISTAS }) {
  const oculta = new Set(ocultas);
  const estado = { vista: vistas[0], seleccion: null };

  raiz.classList.add('visor');
  raiz.innerHTML = `
    <section class="tarjeta plano-tarjeta">
      <div class="pestanas" role="tablist">
        ${VISTAS.map((v) => vistas.includes(v)
          ? `<button role="tab" data-vista="${v}">${t.vistas[v]}</button>`
          : `<button role="tab" disabled title="${t.enLaApp}">${CANDADO} ${t.vistas[v]}</button>`).join('')}
      </div>
      <div class="plano"></div>
      <p class="pista">${oculta.size ? t.demoPista : t.cotasCm}</p>
    </section>
    <section class="lateral">
      <div class="medidas"></div>
      <p class="aviso">${t.aviso}</p>
    </section>`;

  const plano = raiz.querySelector('.plano');
  const medidasEl = raiz.querySelector('.medidas');
  const valor = (l) => (l === 'S' ? `${num(medidas.zocalo.min)}–${num(medidas.zocalo.max)}` : num(medidas.valores[l]));

  function etiquetas() {
    const e = {};
    for (const l of [...COTAS_VISIBLES.map((c) => c.letra), 'S']) e[l] = `${l}  ${oculta.has(l) ? CANDADO : valor(l)}`;
    return e;
  }

  const fila = (l) => `<button class="medida${oculta.has(l) ? ' bloqueada' : ''}" data-letra="${l}">
      <span class="letra">${l}</span><span class="nombre">${esc(t.cotas[l])}</span>
      <span class="valor">${oculta.has(l) ? `${CANDADO} ${t.enLaApp}` : `${valor(l).replace('–', ' – ')} cm`}</span>
    </button>`;

  function filasMedidas() {
    let html = '';
    for (const g of GRUPOS) {
      html += `<h3>${t.grupos[g]}</h3>`;
      for (const c of COTAS_VISIBLES.filter((x) => x.grupo === g)) html += fila(c.letra);
    }
    return html + `<h3>${t.grupos.ZOCALO}</h3>` + fila('S');
  }

  const vistaDe = (letra) => vistas.find((v) => dibujar(v, medidas).some((e) => e.t === 'cota' && e.l === letra));

  function render() {
    pintarPlano(plano, dibujar(estado.vista, medidas), etiquetas(), estado.seleccion, (letra) => {
      estado.seleccion = letra;
      render();
      if (letra) medidasEl.querySelector(`[data-letra="${letra}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    plano.querySelector('svg')?.setAttribute('aria-label', t.vistas[estado.vista]);
    raiz.querySelectorAll('[data-vista]').forEach((b) => b.setAttribute('aria-selected', b.dataset.vista === estado.vista));

    medidasEl.innerHTML = filasMedidas();
    medidasEl.querySelectorAll('.medida').forEach((b) => {
      b.classList.toggle('seleccionada', b.dataset.letra === estado.seleccion);
      b.addEventListener('click', () => {
        const l = b.dataset.letra;
        estado.seleccion = estado.seleccion === l ? null : l;
        if (estado.seleccion && !dibujar(estado.vista, medidas).some((e) => e.t === 'cota' && e.l === l)) {
          estado.vista = vistaDe(l) ?? estado.vista;
        }
        render();
      });
    });
  }

  raiz.querySelectorAll('[data-vista]').forEach((b) => b.addEventListener('click', () => { estado.vista = b.dataset.vista; render(); }));
  new ResizeObserver(() => render()).observe(plano);
  render();
}

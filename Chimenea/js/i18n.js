// Textos de la web en español e inglés (mismos nombres que en la app).

const TEXTOS = {
  es: {
    cotas: {
      A: 'Ancho de boca', B: 'Alto de boca', C: 'Fondo del hogar', D: 'Ancho del fondo', E: 'Alto del fondo',
      F: 'Alto del plano inclinado', G: 'Ancho del registro', H: 'Largo del registro', J: 'Ancho de la garganta',
      L: 'Ancho de la cámara de humos', M: 'Profundidad de la cámara de humos', N: 'Alto de la cámara de humos',
      P: 'Fondo de la subida de humos', Q: 'Ancho de la subida de humos', R: 'Diámetro del conducto circular',
      S: 'Altura del zócalo',
    },
    grupos: {
      BOCA: 'Boca', HOGAR: 'Hogar', REGISTRO: 'Registro y garganta', CAMARA_HUMOS: 'Cámara de humos',
      CONDUCTO: 'Subida de humos', ZOCALO: 'Zócalo',
    },
    vistas: { ALZADO: 'Alzado', SECCION: 'Sección', PLANTA: 'Planta', CONDUCTO: 'Conducto' },
    ancho: 'Ancho de boca (A)',
    exacta: 'Medida probada de la tabla',
    interpolada: 'Calculada a partir de las medidas más cercanas de la tabla',
    rango: (a, b) => `De ${a} a ${b} cm`,
    cotasCm: 'Cotas en cm · toca una cota o una medida para resaltarla',
    medidas: 'Medidas',
    aviso: 'Es una guía: variar una medida ±5 cm no afecta al tiro. La salida de humos siempre por encima de la cumbrera del tejado.',
    sinNombre: (a) => `Chimenea de ${a} cm`,
    cliente: 'Cliente u obra',
    notas: 'Notas',
    compartidoCon: 'Proyecto compartido con la app Chimenea',
    enlaceInvalido: 'Este enlace no contiene un proyecto válido.',
    abrirApp: 'Abrir en la app',
    conseguirApp: 'Consigue la app',
    imprimir: 'Imprimir',
    inicio: 'Inicio',
    privacidad: 'Privacidad',
    enLaApp: 'En la app',
    demoPista: 'Ejemplo orientativo de 90 cm · las medidas con 🔒 están en la app',
    enlaceAntiguo: 'Este enlace es de una versión anterior de la app. Ábrelo con la app Chimenea para ver la chimenea.',
  },
  en: {
    cotas: {
      A: 'Opening width', B: 'Opening height', C: 'Firebox depth', D: 'Back wall width', E: 'Back wall height',
      F: 'Sloped back height', G: 'Damper width', H: 'Damper length', J: 'Throat width',
      L: 'Smoke chamber width', M: 'Smoke chamber depth', N: 'Smoke chamber height',
      P: 'Rectangular flue depth', Q: 'Rectangular flue width', R: 'Round flue diameter', S: 'Plinth height',
    },
    grupos: {
      BOCA: 'Opening', HOGAR: 'Firebox', REGISTRO: 'Damper and throat', CAMARA_HUMOS: 'Smoke chamber',
      CONDUCTO: 'Flue', ZOCALO: 'Base',
    },
    vistas: { ALZADO: 'Front', SECCION: 'Section', PLANTA: 'Plan', CONDUCTO: 'Flue' },
    ancho: 'Opening width (A)',
    exacta: 'Tested size from the table',
    interpolada: 'Calculated from the nearest sizes in the table',
    rango: (a, b) => `From ${a} to ${b} cm`,
    cotasCm: 'Dimensions in cm · tap a dimension or a measurement to highlight it',
    medidas: 'Measurements',
    aviso: 'This is a guide: a ±5 cm variation does not affect the draft. The chimney outlet must always be above the roof ridge.',
    sinNombre: (a) => `${a} cm fireplace`,
    cliente: 'Client or site',
    notas: 'Notes',
    compartidoCon: 'Project shared from the Fireplace Builder app',
    enlaceInvalido: 'This link does not contain a valid project.',
    abrirApp: 'Open in the app',
    conseguirApp: 'Get the app',
    imprimir: 'Print',
    inicio: 'Home',
    privacidad: 'Privacy',
    enLaApp: 'In the app',
    demoPista: 'Approximate 90 cm example · measurements with 🔒 are in the app',
    enlaceAntiguo: 'This link is from an older version of the app. Open it with the app to see the fireplace.',
  },
};

export const idioma = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
export const t = TEXTOS[idioma];

const formato = new Intl.NumberFormat(idioma, { maximumFractionDigits: 1 });
export const num = (v) => formato.format(v);

/** Aplica los textos a los elementos con data-es / data-en. */
export function traducirPagina() {
  document.documentElement.lang = idioma;
  document.querySelectorAll('[data-es]').forEach((el) => {
    const texto = el.dataset[idioma];
    if (texto != null) el.innerHTML = texto;
  });
  document.querySelectorAll(`[data-solo]`).forEach((el) => {
    el.hidden = el.dataset.solo !== idioma;
  });
}

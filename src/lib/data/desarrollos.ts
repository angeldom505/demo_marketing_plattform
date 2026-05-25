// HU Marketing Suite — shared data and types

export const REGION_COLORS: Record<string, string> = {
  'Quintana Roo': '#4A90D9',
  'Yucatán': '#1D9E75',
  'Querétaro': '#7F77DD',
  'Puebla': '#C47F1A',
  'Morelos': '#5B9A6B',
  'Hidalgo': '#9E8A5A',
  'Estado de México': '#6B87A1',
};

export interface Desarrollo {
  slug: string;
  nombre: string;
  region: string;
  ciudad: string;
  tipologia: string;
  unidades: number;
  logo?: string;
  ficha: boolean;
  storytelling: boolean;
  competencia: boolean;
  audiencias: boolean;
}

export const DESARROLLOS: Desarrollo[] = [
  { slug: 'aukena', nombre: 'Aukena', region: 'Quintana Roo', ciudad: 'Tulum', tipologia: 'Residencial premium', unidades: 84, logo: '/logos/aukena.png', ficha: true, storytelling: true, competencia: true, audiencias: true },
  { slug: 'turquesa', nombre: 'Turquesa', region: 'Quintana Roo', ciudad: 'Playa del Carmen', tipologia: 'Departamentos', unidades: 120, logo: '/logos/turquesa.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'meriden', nombre: 'Meriden', region: 'Yucatán', ciudad: 'Mérida Norte', tipologia: 'Residencial', unidades: 96, logo: '/logos/meriden.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'bonza', nombre: 'Bonza', region: 'Querétaro', ciudad: 'El Marqués', tipologia: 'Vertical', unidades: 142, logo: '/logos/bonza.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'trojes', nombre: 'Trojes', region: 'Puebla', ciudad: 'Cuautlancingo', tipologia: 'Horizontal', unidades: 210, logo: '/logos/trojes.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'santa-fe-xochitepec', nombre: 'Santa Fe Xochitepec', region: 'Morelos', ciudad: 'Xochitepec', tipologia: 'Residencial', unidades: 180, logo: '/logos/santa-fe.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'aquasol-ayala', nombre: 'Aquasol Ayala', region: 'Morelos', ciudad: 'Ayala', tipologia: 'Interés medio', unidades: 256, logo: '/logos/aquasol.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'abeto-tizayuca', nombre: 'Abeto Tizayuca', region: 'Hidalgo', ciudad: 'Tizayuca', tipologia: 'Horizontal', unidades: 312, logo: '/logos/abeto.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'basalto-pachuca', nombre: 'Basalto Pachuca', region: 'Hidalgo', ciudad: 'Pachuca', tipologia: 'Vertical', unidades: 168, logo: '/logos/basalto.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'ciudad-natura-ii', nombre: 'Ciudad Natura II', region: 'Hidalgo', ciudad: 'Mineral de la Reforma', tipologia: 'Mixto', unidades: 420, logo: '/logos/ciudad-natura.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'privadas-del-bosque', nombre: 'Privadas del Bosque', region: 'Estado de México', ciudad: 'Huehuetoca', tipologia: 'Residencial', unidades: 290, logo: '/logos/privadas-del-bosque.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'solares-zumpango', nombre: 'Solares Zumpango', region: 'Estado de México', ciudad: 'Zumpango', tipologia: 'Horizontal', unidades: 380, logo: '/logos/solares.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'sauz-toluca', nombre: 'Sauz Toluca', region: 'Estado de México', ciudad: 'Toluca', tipologia: 'Vertical', unidades: 156, logo: '/logos/sauz.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'cosmopol-coacalco', nombre: 'Cosmopol Coacalco', region: 'Estado de México', ciudad: 'Coacalco', tipologia: 'Mixto', unidades: 198, logo: '/logos/cosmopol.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
  { slug: 'central-park-bosque-real', nombre: 'Central Park Bosque Real', region: 'Estado de México', ciudad: 'Huixquilucan', tipologia: 'Premium', unidades: 72, logo: '/logos/central-park.png', ficha: true, storytelling: false, competencia: false, audiencias: false },
];

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'Home' },
  { id: 'desarrollos', label: 'Desarrollos', icon: 'Building2' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'contenido', label: 'Contenido', icon: 'FileText' },
  { id: 'social', label: 'Social Media', icon: 'Share2' },
  { id: 'paid', label: 'Paid Media', icon: 'Target' },
  { id: 'creativo', label: 'Creativo', icon: 'Palette' },
  { id: 'diseno', label: 'Diseño', icon: 'Layers' },
  { id: 'conversion', label: 'Conversión', icon: 'TrendingUp' },
  { id: 'atraccion', label: 'Atracción', icon: 'Magnet' },
  { id: 'seo', label: 'SEO', icon: 'Globe' },
  { id: 'video', label: 'Video', icon: 'Film' },
  { id: 'equipo', label: 'Equipo', icon: 'Users' },
];

export const TONOS = ['Cálido', 'Aspiracional', 'Cercano', 'Profesional', 'Provocador'];

export const AUDIENCIAS_OPTIONS = [
  'Familia joven CDMX',
  'Inversor patrimonial',
  'Nómada digital MX',
  'Primer crédito',
  'Segunda vivienda',
];

export const CONTENT_TYPES = [
  { id: 'post', icon: 'Instagram', label: 'Post Instagram' },
  { id: 'carrusel', icon: 'Carousel', label: 'Carrusel (5 slides)' },
  { id: 'blog', icon: 'BookOpen', label: 'Blog post' },
  { id: 'email', icon: 'Mail', label: 'Email marketing' },
  { id: 'ad', icon: 'Megaphone', label: 'Ad copy (Meta)' },
  { id: 'video', icon: 'Film', label: 'Script video 30s' },
];

// ── Historial local (localStorage) ──────────────────────────────────────────

export interface HistorialItem {
  id: string;
  tipo: string;
  tipoLabel: string;
  desarrollo: string;
  tono: string;
  audiencia: string;
  output: string;
  channel: string;
  createdAt: string;
}

export const HISTORIAL_KEY = 'hu_historial';
export const HISTORIAL_SEEDED_KEY = 'hu_historial_seeded_v1';

const DEMO_HISTORIAL: HistorialItem[] = [
  {
    id: "demo_1",
    tipo: "post",
    tipoLabel: "Post Instagram",
    desarrollo: "Aukena",
    tono: "Aspiracional",
    audiencia: "Millennials inversores CDMX",
    channel: "Instagram",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    output: `✨ Vivir frente al mar deja de ser un sueño cuando decides que es una realidad.\n\nAukena Residences nació para quienes entienden que el tiempo es el bien más valioso — y merece gastarse bien.\n\n🌊 Vista al mar desde tu ventana\n🏡 Diseño arquitectónico de primer nivel\n🔐 Comunidad privada con amenidades premium\n\nQuedan pocas unidades disponibles en la Fase 2. Agenda tu visita antes de que alguien más tome tu lugar.\n\n👉 Link en bio para más información.\n\n#AukenaResidences #VidaFrenteAlMar #CancúnLujo #InversionInmobiliaria #PlayaCaribe`,
  },
  {
    id: "demo_2",
    tipo: "email",
    tipoLabel: "Email / Newsletter",
    desarrollo: "Turquesa",
    tono: "Cálido",
    audiencia: "Familia joven CDMX",
    channel: "Mail",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    output: `Asunto: Tu familia merece Turquesa — y este es el momento\n\nHola,\n\nSabemos que buscar el hogar ideal puede sentirse abrumador. Por eso queremos simplificarte la decisión.\n\nTurquesa es el desarrollo que combina lo que más importa: diseño que enamora, espacios que respiran y una comunidad donde tus hijos pueden crecer seguros.\n\n¿Qué incluye tu nuevo hogar en Turquesa?\n\n• Cocina integral con islas\n• Cuartos amplios con iluminación natural\n• Patio trasero privado\n• Acceso a club de residentes: alberca, gimnasio y áreas verdes\n• Seguridad 24/7\n\nEsta semana tenemos visitas guiadas disponibles sin cita previa. Solo escríbenos y coordinamos.\n\nCon gusto,\nEquipo Turquesa`,
  },
  {
    id: "demo_3",
    tipo: "ad",
    tipoLabel: "Anuncio / Ad Copy",
    desarrollo: "Mériden",
    tono: "Directo",
    audiencia: "Inversionistas Monterrey",
    channel: "Megaphone",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    output: `📢 MÉRIDEN — El activo que tu portafolio necesitaba.\n\n**Headline:** Lujo en Mérida. Plusvalía garantizada. Entrega 2025.\n\n**Variante A:**\nMériden Cabo Norte | Departamentos premium en el corazón de Mérida.\nPreventa con precios de lanzamiento. Últimas unidades.\n→ Agenda tu asesoría\n\n**Variante B (retargeting):**\nSigues pensando en Mériden?\nEsta semana cerramos preventa de Fase 1.\nNo dejes pasar tu precio de entrada.\n→ Reserva hoy con $50,000\n\n**Variante C (awareness):**\nMérida es la ciudad del futuro de México.\nMériden es el lugar donde quieres estar cuando llegue ese futuro.\n→ Conoce el proyecto`,
  },
  {
    id: "demo_4",
    tipo: "carousel",
    tipoLabel: "Carrusel",
    desarrollo: "Bonza",
    tono: "Inspiracional",
    audiencia: "Parejas jóvenes Querétaro",
    channel: "Carousel",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    output: `— Slide 1 —\n5 razones para elegir Bonza como tu próximo hogar\n\n— Slide 2 —\n01. Diseño que respira\nCasas con ventilación cruzada, iluminación natural y espacios interiores que no te hacen sentir encerrado.\n\n— Slide 3 —\n02. Comunidad activa\nVecinos que se conocen, áreas comunes que se usan y una cultura de convivencia que hace la diferencia.\n\n— Slide 4 —\n03. Todo cerca\nEscuelas, supermercados, hospitales y entretenimiento a menos de 10 minutos.\n\n— Slide 5 —\n04. Inversión inteligente\nQuerétaro creció 18% en plusvalía el año pasado. Bonza está en el corazón de ese crecimiento.\n\n— Slide 6 —\n05. Financiamiento a tu medida\nTrabajas con cualquier banco, crédito Infonavit o Fovissste. Te acompañamos en el proceso.\n\n— Slide 7 —\n¿Listo para dar el paso?\nAgenda tu visita este fin de semana. Sin presión, sin compromisos.\nSolo tú, tu familia y tu futuro hogar.`,
  },
  {
    id: "demo_5",
    tipo: "blog",
    tipoLabel: "Blog / Artículo",
    desarrollo: "Central Park",
    tono: "Educativo",
    audiencia: "Primerizos compradores",
    channel: "BookOpen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    output: `# Cómo elegir tu primer hogar sin arrepentirte: guía para compradores primerizos\n\nComprar tu primera casa es una de las decisiones más importantes de tu vida. También puede ser una de las más confusas si no tienes claro qué buscar. Aquí te damos los criterios que realmente importan.\n\n## 1. Ubicación sobre todo lo demás\n\nEl diseño puede renovarse. La ubicación, no. Antes de enamorarte de una fachada, revisa qué tan cerca estás de tu trabajo, de las escuelas de tus hijos y de los servicios que usas a diario.\n\n## 2. Revisa el historial del desarrollador\n\nNo compres a un desarrollador que no puedas investigar. Busca proyectos anteriores, habla con residentes y verifica que las promesas de entrega se hayan cumplido.\n\n## 3. Entiende el financiamiento antes de visitar\n\nSaber cuánto puedes pagar te ahorra tiempo y expectativas frustradas. Habla con tu banco o asesor antes de visitar propiedades.\n\n## 4. Las amenidades no son extras — son parte del valor\n\nUn desarrollo con club de residentes, áreas verdes y seguridad privada no solo mejora tu calidad de vida: también aumenta la plusvalía de tu inversión.\n\n## Por qué Central Park es la opción ideal para primerizos\n\nCentral Park Bosque Real fue diseñado pensando en familias que compran su primer hogar. Proceso de compra transparente, asesoría personalizada y opciones de financiamiento flexibles para que tu primera experiencia sea positiva desde el inicio.`,
  },
];

export function getHistorial(): HistorialItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const seeded = localStorage.getItem(HISTORIAL_SEEDED_KEY);
    if (!seeded) {
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(DEMO_HISTORIAL));
      localStorage.setItem(HISTORIAL_SEEDED_KEY, '1');
      return DEMO_HISTORIAL;
    }
    const raw = localStorage.getItem(HISTORIAL_KEY);
    return raw ? (JSON.parse(raw) as HistorialItem[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistorial(
  item: Omit<HistorialItem, 'id' | 'createdAt'>
): HistorialItem {
  const full: HistorialItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const existing = getHistorial();
  localStorage.setItem(
    HISTORIAL_KEY,
    JSON.stringify([full, ...existing].slice(0, 100))
  );
  return full;
}

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

export function getHistorial(): HistorialItem[] {
  if (typeof window === 'undefined') return [];
  try {
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

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const MOCK_GEO = {
  by_pais: [
    { label: "México",          total: 8347, mqls: 1423, clientes: 277, calificados: 1700, tasa: 3.3 },
    { label: "Estados Unidos",  total: 312,  mqls: 67,   clientes: 18,  calificados: 85,   tasa: 5.8 },
    { label: "Canadá",          total: 98,   mqls: 21,   clientes: 6,   calificados: 27,   tasa: 6.1 },
  ],
  by_municipio_detail: [
    { label: "Benito Juárez, Q.Roo",  total: 987,  mqls: 198, sqls: 89,  clientes: 45,  calificados: 287, tasa: 4.6 },
    { label: "Mérida, Yucatán",        total: 743,  mqls: 156, sqls: 71,  clientes: 38,  calificados: 227, tasa: 5.1 },
    { label: "Miguel Hidalgo, CDMX",   total: 698,  mqls: 134, sqls: 58,  clientes: 29,  calificados: 192, tasa: 4.2 },
    { label: "Cuauhtémoc, CDMX",       total: 621,  mqls: 118, sqls: 52,  clientes: 24,  calificados: 170, tasa: 3.9 },
    { label: "Querétaro, Qro.",        total: 534,  mqls: 102, sqls: 44,  clientes: 21,  calificados: 146, tasa: 3.9 },
    { label: "San Pedro G.G., N.L.",   total: 498,  mqls: 95,  sqls: 41,  clientes: 19,  calificados: 136, tasa: 3.8 },
    { label: "Puebla de Z., Pue.",     total: 412,  mqls: 78,  sqls: 33,  clientes: 15,  calificados: 111, tasa: 3.6 },
    { label: "Ecatepec, Edo.Méx.",     total: 389,  mqls: 71,  sqls: 29,  clientes: 12,  calificados: 100, tasa: 3.1 },
    { label: "Tlaquepaque, Jal.",      total: 356,  mqls: 64,  sqls: 27,  clientes: 11,  calificados: 91,  tasa: 3.1 },
    { label: "Monterrey, N.L.",        total: 312,  mqls: 56,  sqls: 23,  clientes: 9,   calificados: 79,  tasa: 2.9 },
  ],
  by_genero: [
    { genero: "Hombre", lc: "lead",                   cnt: 1243 },
    { genero: "Mujer",  lc: "lead",                   cnt: 987  },
    { genero: "Hombre", lc: "marketingqualifiedlead",  cnt: 798  },
    { genero: "Mujer",  lc: "marketingqualifiedlead",  cnt: 625  },
    { genero: "Hombre", lc: "salesqualifiedlead",      cnt: 412  },
    { genero: "Mujer",  lc: "salesqualifiedlead",      cnt: 330  },
    { genero: "Hombre", lc: "opportunity",             cnt: 278  },
    { genero: "Mujer",  lc: "opportunity",             cnt: 220  },
    { genero: "Hombre", lc: "customer",                cnt: 156  },
    { genero: "Mujer",  lc: "customer",                cnt: 121  },
  ],
  by_genero_modelo: [
    { genero: "Hombre", modelo: "Casa",         cnt: 2341 },
    { genero: "Mujer",  modelo: "Casa",         cnt: 2480 },
    { genero: "Hombre", modelo: "Departamento", cnt: 1123 },
    { genero: "Mujer",  modelo: "Departamento", cnt: 1064 },
    { genero: "Hombre", modelo: "Townhouse",    cnt: 543  },
    { genero: "Mujer",  modelo: "Townhouse",    cnt: 444  },
    { genero: "Hombre", modelo: "Terreno",      cnt: 198  },
    { genero: "Mujer",  modelo: "Terreno",      cnt: 154  },
  ],
  by_genero_cap: [
    { genero: "Hombre", rango: "< $1M",       cnt: 412  },
    { genero: "Mujer",  rango: "< $1M",       cnt: 480  },
    { genero: "Hombre", rango: "$1M – $2M",   cnt: 1123 },
    { genero: "Mujer",  rango: "$1M – $2M",   cnt: 1218 },
    { genero: "Hombre", rango: "$2M – $3M",   cnt: 987  },
    { genero: "Mujer",  rango: "$2M – $3M",   cnt: 1000 },
    { genero: "Hombre", rango: "$3M – $4M",   cnt: 567  },
    { genero: "Mujer",  rango: "$3M – $4M",   cnt: 556  },
    { genero: "Hombre", rango: "$4M – $5M",   cnt: 212  },
    { genero: "Mujer",  rango: "$4M – $5M",   cnt: 220  },
    { genero: "Hombre", rango: "> $5M",       cnt: 58   },
    { genero: "Mujer",  rango: "> $5M",       cnt: 58   },
  ],
};

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase.rpc("get_hubspot_geo_breakdown");
    if (error || !data) return NextResponse.json({ ok: true, data: MOCK_GEO });
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: MOCK_GEO });
  }
}

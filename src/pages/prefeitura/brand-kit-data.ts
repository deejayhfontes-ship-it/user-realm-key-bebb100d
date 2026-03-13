/**
 * brand-kit-data.ts
 * Fonte única de verdade para o Brand Kit da Prefeitura.
 *
 * Preview  → arquivo local em /public/prefeitura-assets/ (serve do Vite/static)
 * Download → Google Drive (link direto para o usuário baixar)
 *
 * Para atualizar: troque o previewSrc ou downloadUrl do item.
 */

// ─── Base paths ───────────────────────────────────────────────────────────────
const BASE = '/prefeitura-assets/logosecretariasegoverno';
const SEC  = `${BASE}/SECRETARIAS E APLICAÇÕES`;

// ─── Helper Drive ─────────────────────────────────────────────────────────────
export const driveFolderUrl = (id: string) =>
  `https://drive.google.com/drive/folders/${id}`;

export const driveDown = (id: string) =>
  `https://drive.google.com/uc?export=download&id=${id}`;

// ─── IDs das pastas no Drive (para botão "Abrir no Drive") ───────────────────
export const FOLDER_IDS = {
  raiz:        '1IdRLk6_6QZvaaTl_h3BTW1fHtaRfqGg3',
  pasta00:     '170tq1mvbNvrP8bPv-_RvChzAgFO5HVQg',
  brasao:      '1Fcom-SaK2DG2k_nAquye8WzpuWneVnHd',
  logosGoverno:'1GNEvj3cnfjf9PvhDU53n1NCF_sdA-jpY',
  pasta01:     '1JOb-BEFlvDOd1mGIaRk2ZncnEuX4m66l',
  pasta02:     '1JPMNY8xpJNZvBgrPyTr6VcKBLpHG8aza',
  pasta03:     '1Jn6rOlrzRODHalkGtEufaqJ2JayrUTAH',
  pasta04:     '1KJcnotMRl02Gl0UPYhzFnnwceFrcjSEr',
  pasta05:     '1L4zLvaI93QL4-ys9YoZXenuitVwjRDJS',
  pasta06:     '1McNpRxMjv0Xu-IMosQrLuBs0S5TfxKun',
  pasta07:     '1N2kokzdgekw4V92n5vxZ5fuD-c9FLTmP',
  pasta08:     '18gE1KEE8RVd59DbnCYL6J_W4dyPX6Dfe',
  pasta09:     '1NTgNbkO8LTUX6_9mWJ10aw7SsZ_kS7zy',
} as const;

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface LogoItem {
  tipo: string;
  nome: string;
  previewSrc: string;       // caminho local para exibir o preview (PNG/JPG)
  downloadUrl: string;      // link para download (Drive ou local)
  driveFolder?: string;     // ID da pasta no Drive (fallback)
}

export interface SecretariaData {
  nome: string;
  pasta: string;
  folderId: string;
  iconeKey: string;
  cor: string;
  corBg: string;
  corTexto: string;
  corBorda: string;
  logos: LogoItem[];
}

// ─── 00 — PREFEITURA, BRASÃO & GOVERNO ───────────────────────────────────────
export const GOVERNO_LOGOS: LogoItem[] = [
  {
    tipo: 'Brasão Oficial',
    nome: 'Brasão da Prefeitura',
    previewSrc: `${SEC}/00 GOVERNO LOGOS DA PREFEITURA/BRASÃO/BRASÃO-300X450.jpg`,
    downloadUrl: driveFolderUrl(FOLDER_IDS.brasao),
    driveFolder: FOLDER_IDS.brasao,
  },
  {
    tipo: 'Logo Governo — Colorida',
    nome: 'Logo Horizontal Colorida',
    previewSrc: `${SEC}/00 GOVERNO LOGOS DA PREFEITURA/LOGOS GOVERNO/OUTLINES_BRANCA_HELIODORA.png`,
    downloadUrl: driveFolderUrl(FOLDER_IDS.logosGoverno),
    driveFolder: FOLDER_IDS.logosGoverno,
  },
  {
    tipo: 'Logo Governo — Mono Branca',
    nome: 'Logo Monocromática Branca',
    previewSrc: `${SEC}/00 GOVERNO LOGOS DA PREFEITURA/LOGOS GOVERNO/MONOOUTLINES_BRANCA_HELIODORA.png`,
    downloadUrl: driveFolderUrl(FOLDER_IDS.logosGoverno),
    driveFolder: FOLDER_IDS.logosGoverno,
  },
];

// ─── SECRETARIAS ──────────────────────────────────────────────────────────────
export const SECRETARIAS: SecretariaData[] = [
  {
    nome: 'Secretaria de Educação',
    pasta: '01 EDUCACAO',
    folderId: FOLDER_IDS.pasta01,
    iconeKey: 'GraduationCap',
    cor: 'from-blue-500 to-blue-700',
    corBg: 'bg-blue-500/10',
    corTexto: 'text-blue-400',
    corBorda: 'border-blue-500/20 hover:border-blue-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Educação Colorida',
        previewSrc: `${BASE}/01 EDUCACAO/01_LOGO PREFEITURA HELIODORA COR_SECRETARIA DE EDUCAÇÃO .png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta01),
        driveFolder: FOLDER_IDS.pasta01,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Educação Mono',
        previewSrc: `${BASE}/01 EDUCACAO/01_LOGO PREFEITURA HELIODORA _SECRETARIA DE EDUCAÇÃO _MONO 001.svg`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta01),
        driveFolder: FOLDER_IDS.pasta01,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Educação Negativa',
        previewSrc: `${BASE}/01 EDUCACAO/01_LOGO PREFEITURA HELIODORA _SECRETARIA DE EDUCAÇÃO _NEGATIVA.svg`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta01),
        driveFolder: FOLDER_IDS.pasta01,
      },
    ],
  },
  {
    nome: 'Secretaria de Saúde',
    pasta: '02 SAUDE',
    folderId: FOLDER_IDS.pasta02,
    iconeKey: 'Heart',
    cor: 'from-red-500 to-rose-600',
    corBg: 'bg-red-500/10',
    corTexto: 'text-red-400',
    corBorda: 'border-red-500/20 hover:border-red-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Saúde Colorida',
        previewSrc: `${BASE}/02 SAUDE/02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAÚDE_COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta02),
        driveFolder: FOLDER_IDS.pasta02,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Saúde Mono',
        previewSrc: `${BASE}/02 SAUDE/02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAÚDE_MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta02),
        driveFolder: FOLDER_IDS.pasta02,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Saúde Negativa',
        previewSrc: `${BASE}/02 SAUDE/02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAÚDE_NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta02),
        driveFolder: FOLDER_IDS.pasta02,
      },
    ],
  },
  {
    nome: 'Secretaria de Obras',
    pasta: '03 OBRAS',
    folderId: FOLDER_IDS.pasta03,
    iconeKey: 'Hammer',
    cor: 'from-amber-500 to-orange-600',
    corBg: 'bg-amber-500/10',
    corTexto: 'text-amber-400',
    corBorda: 'border-amber-500/20 hover:border-amber-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Obras Colorida',
        previewSrc: `${BASE}/03 OBRAS/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta03),
        driveFolder: FOLDER_IDS.pasta03,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Obras Mono',
        previewSrc: `${BASE}/03 OBRAS/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta03),
        driveFolder: FOLDER_IDS.pasta03,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Obras Negativa',
        previewSrc: `${BASE}/03 OBRAS/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta03),
        driveFolder: FOLDER_IDS.pasta03,
      },
    ],
  },
  {
    nome: 'Secretaria de Agricultura',
    pasta: '04 AGRICULTURA',
    folderId: FOLDER_IDS.pasta04,
    iconeKey: 'Sprout',
    cor: 'from-green-500 to-emerald-600',
    corBg: 'bg-green-500/10',
    corTexto: 'text-green-400',
    corBorda: 'border-green-500/20 hover:border-green-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Agricultura Colorida',
        previewSrc: `${BASE}/04 AGRICULTURA/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta04),
        driveFolder: FOLDER_IDS.pasta04,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Agricultura Mono',
        previewSrc: `${BASE}/04 AGRICULTURA/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta04),
        driveFolder: FOLDER_IDS.pasta04,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Agricultura Negativa',
        previewSrc: `${BASE}/04 AGRICULTURA/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta04),
        driveFolder: FOLDER_IDS.pasta04,
      },
    ],
  },
  {
    nome: 'Assistência Social',
    pasta: '05 ASSITENCIA SOCIAL',
    folderId: FOLDER_IDS.pasta05,
    iconeKey: 'HandHeart',
    cor: 'from-pink-500 to-fuchsia-600',
    corBg: 'bg-pink-500/10',
    corTexto: 'text-pink-400',
    corBorda: 'border-pink-500/20 hover:border-pink-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Assistência Colorida',
        previewSrc: `${BASE}/05 ASSITENCIA SOCIAL/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta05),
        driveFolder: FOLDER_IDS.pasta05,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Assistência Mono',
        previewSrc: `${BASE}/05 ASSITENCIA SOCIAL/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta05),
        driveFolder: FOLDER_IDS.pasta05,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Assistência Negativa',
        previewSrc: `${BASE}/05 ASSITENCIA SOCIAL/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta05),
        driveFolder: FOLDER_IDS.pasta05,
      },
    ],
  },
  {
    nome: 'Dir. de Esporte e Lazer',
    pasta: '06 DERETORIA DE ESPORTE E LAZER',
    folderId: FOLDER_IDS.pasta06,
    iconeKey: 'Dumbbell',
    cor: 'from-cyan-500 to-teal-600',
    corBg: 'bg-cyan-500/10',
    corTexto: 'text-cyan-400',
    corBorda: 'border-cyan-500/20 hover:border-cyan-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Esporte Colorida',
        previewSrc: `${BASE}/06 DERETORIA DE ESPORTE E LAZER/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta06),
        driveFolder: FOLDER_IDS.pasta06,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Esporte Mono',
        previewSrc: `${BASE}/06 DERETORIA DE ESPORTE E LAZER/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta06),
        driveFolder: FOLDER_IDS.pasta06,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Esporte Negativa',
        previewSrc: `${BASE}/06 DERETORIA DE ESPORTE E LAZER/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta06),
        driveFolder: FOLDER_IDS.pasta06,
      },
    ],
  },
  {
    nome: 'Dir. de Cultura e Turismo',
    pasta: '07 DIRETORIA DE CULTURA E TURISMO',
    folderId: FOLDER_IDS.pasta07,
    iconeKey: 'Clapperboard',
    cor: 'from-purple-500 to-violet-600',
    corBg: 'bg-purple-500/10',
    corTexto: 'text-purple-400',
    corBorda: 'border-purple-500/20 hover:border-purple-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Cultura Colorida',
        previewSrc: `${BASE}/07 DIRETORIA DE CULTURA E TURISMO/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta07),
        driveFolder: FOLDER_IDS.pasta07,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Cultura Mono',
        previewSrc: `${BASE}/07 DIRETORIA DE CULTURA E TURISMO/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta07),
        driveFolder: FOLDER_IDS.pasta07,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Cultura Negativa',
        previewSrc: `${BASE}/07 DIRETORIA DE CULTURA E TURISMO/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta07),
        driveFolder: FOLDER_IDS.pasta07,
      },
    ],
  },
  {
    nome: 'Sec. de Cultura e Turismo',
    pasta: '08 SECRETARIA DE CULTURA E TURISMO',
    folderId: FOLDER_IDS.pasta08,
    iconeKey: 'Clapperboard',
    cor: 'from-indigo-500 to-blue-600',
    corBg: 'bg-indigo-500/10',
    corTexto: 'text-indigo-400',
    corBorda: 'border-indigo-500/20 hover:border-indigo-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Sec. Cultura Colorida',
        // usa mesmos arquivos da 07 pois o Drive tem a mesma pasta como base
        previewSrc: `${SEC}/08 SECRETARIA DE CULTURA E TURISMO/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta08),
        driveFolder: FOLDER_IDS.pasta08,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Sec. Cultura Mono',
        previewSrc: `${SEC}/08 SECRETARIA DE CULTURA E TURISMO/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta08),
        driveFolder: FOLDER_IDS.pasta08,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Sec. Cultura Negativa',
        previewSrc: `${SEC}/08 SECRETARIA DE CULTURA E TURISMO/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta08),
        driveFolder: FOLDER_IDS.pasta08,
      },
    ],
  },
  {
    nome: 'Sec. de Adm. e Planejamento',
    pasta: '09 SECRETARIA DE ADM PLANEJAMENTO',
    folderId: FOLDER_IDS.pasta09,
    iconeKey: 'Landmark',
    cor: 'from-slate-500 to-zinc-600',
    corBg: 'bg-slate-500/10',
    corTexto: 'text-slate-400',
    corBorda: 'border-slate-500/20 hover:border-slate-400/50',
    logos: [
      {
        tipo: 'Colorida',
        nome: 'Logo Adm Colorida',
        previewSrc: `${SEC}/09 SECRETARIA DE ADM PLANEJAMENTO E ASSUNTOS ESTRATEGICOS/COLORIDA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta09),
        driveFolder: FOLDER_IDS.pasta09,
      },
      {
        tipo: 'Monocromática',
        nome: 'Logo Adm Mono',
        previewSrc: `${SEC}/09 SECRETARIA DE ADM PLANEJAMENTO E ASSUNTOS ESTRATEGICOS/MONO 001.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta09),
        driveFolder: FOLDER_IDS.pasta09,
      },
      {
        tipo: 'Negativa',
        nome: 'Logo Adm Negativa',
        previewSrc: `${SEC}/09 SECRETARIA DE ADM PLANEJAMENTO E ASSUNTOS ESTRATEGICOS/NEGATIVA.png`,
        downloadUrl: driveFolderUrl(FOLDER_IDS.pasta09),
        driveFolder: FOLDER_IDS.pasta09,
      },
    ],
  },
];

// ─── PALETA DE CORES ──────────────────────────────────────────────────────────
export const CORES = [
  { nome: 'Azul Prefeitura',     hex: '#004691', uso: 'Cor principal institucional' },
  { nome: 'Amarelo Destaque',    hex: '#F5C518', uso: 'Destaques e chamadas'        },
  { nome: 'Verde Institucional', hex: '#2D7D46', uso: 'Elementos secundários'       },
  { nome: 'Branco',              hex: '#FFFFFF', uso: 'Textos em fundo escuro'      },
];

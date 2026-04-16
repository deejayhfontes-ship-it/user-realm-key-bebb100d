// ===================== TYPES =====================
export type PecaFormato = "1080x1440" | "1080x1920" | "1080x1080";
export type PecaTom = "institucional" | "comercial" | "jovem" | "informativo";
export type PecaStatus = "rascunho" | "final";
export type PecaTipo = "capa" | "beneficios" | "cursos" | "datas" | "valor" | "cta";
export type CampanhaId = "nuppe-2026" | "pos-graduacao-2026" | "cursos-livres-2026";
export type CursoCategoria = "pos-graduacao" | "curso-livre";

export interface CursoData {
  id: string;
  nome: string;
  categoria: CursoCategoria;
  cargaHoraria: string;
  duracao?: string;
  valor: string;
  valorParcelado?: string;
  diferenciais: string[];
  matriculas: string;
  inicioAulas: string;
}

export interface PecaData {
  id: string;
  nome: string;
  tipo: PecaTipo;
  campanhaId?: CampanhaId;
  cursoId?: string;
  tom: PecaTom;
  textos: Record<string, string>;
  bgImage?: string;
  status: PecaStatus;
}

export interface CampanhaData {
  id: CampanhaId;
  nome: string;
  descricao: string;
  tom: PecaTom;
  pecas: PecaData[];
}

// ===================== CURSOS =====================
export const cursosPostGraduacao: CursoData[] = [
  {
    id: "pos-direito-civil",
    nome: "Direito Civil e Processo Civil",
    categoria: "pos-graduacao",
    cargaHoraria: "360 horas",
    duracao: "12 meses",
    valor: "12x de R$ 420,00",
    diferenciais: ["Certificação FASB", "Corpo docente qualificado", "Aulas semipresenciais"],
    matriculas: "A partir de 15/01",
    inicioAulas: "Março/2026",
  },
  {
    id: "pos-direito-previdenciario",
    nome: "Direito Previdenciário",
    categoria: "pos-graduacao",
    cargaHoraria: "360 horas",
    duracao: "12 meses",
    valor: "12x de R$ 420,00",
    diferenciais: ["Certificação FASB", "Corpo docente qualificado", "Aulas semipresenciais"],
    matriculas: "A partir de 15/01",
    inicioAulas: "Março/2026",
  },
  {
    id: "pos-enfermagem-obstetrica",
    nome: "Enfermagem Obstétrica e em UTI Neonatal e Pediátrica",
    categoria: "pos-graduacao",
    cargaHoraria: "360 horas",
    duracao: "12 meses",
    valor: "12x de R$ 420,00",
    diferenciais: ["Certificação FASB", "Corpo docente qualificado", "Aulas semipresenciais"],
    matriculas: "A partir de 15/01",
    inicioAulas: "Março/2026",
  },
  {
    id: "pos-saude-coletiva",
    nome: "Saúde Coletiva com Ênfase em Saúde Pública",
    categoria: "pos-graduacao",
    cargaHoraria: "360 horas",
    duracao: "12 meses",
    valor: "12x de R$ 420,00",
    diferenciais: ["Certificação FASB", "Corpo docente qualificado", "Aulas semipresenciais"],
    matriculas: "A partir de 15/01",
    inicioAulas: "Março/2026",
  },
];

export const cursosLivres: CursoData[] = [
  {
    id: "cl-vendas-imoveis",
    nome: "Técnicas de Vendas e Avaliação de Imóveis",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-educacao-inclusiva",
    nome: "Educação Inclusiva",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 360,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-massoterapia",
    nome: "Técnicas em Massoterapia",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 360,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-maquiagem",
    nome: "Maquiagem",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-estetica-facial",
    nome: "Técnicas em Estética Facial e Capilar",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 360,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-nutricao-esportiva",
    nome: "Alimentação Performance: Fundamentos da Nutrição Esportiva",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-marketing-digital",
    nome: "Marketing Digital para as Redes Sociais",
    categoria: "curso-livre",
    cargaHoraria: "28 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-feridas-queimaduras",
    nome: "Tratamento em Feridas e Queimaduras",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-saude-idosa",
    nome: "Assistência à Saúde da Pessoa Idosa",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
  {
    id: "cl-enfermagem-pos-op",
    nome: "Enfermagem no Pós-Operatório de Cirurgias Estéticas",
    categoria: "curso-livre",
    cargaHoraria: "30 horas",
    valor: "R$ 380,00",
    valorParcelado: "4x sem juros",
    diferenciais: ["Aberto ao público", "Certificação FASB", "Aulas semipresenciais"],
    matriculas: "15/01 a 13/02",
    inicioAulas: "23/02",
  },
];

export const todosCursos = [...cursosPostGraduacao, ...cursosLivres];

// ===================== FOTOS CAMPANHAS =====================
import foto01 from "@/assets/campanhas/foto-01.png";
import foto02 from "@/assets/campanhas/foto-02.png";
import foto03 from "@/assets/campanhas/foto-03.png";
import foto04 from "@/assets/campanhas/foto-04.png";
import foto05 from "@/assets/campanhas/foto-05.png";
import foto06 from "@/assets/campanhas/foto-06.png";
import foto07 from "@/assets/campanhas/foto-07.png";
import foto08 from "@/assets/campanhas/foto-08.png";
import foto09 from "@/assets/campanhas/foto-09.png";

// ===================== CAMPANHAS =====================
function gerarPecasCampanha(campanhaId: CampanhaId, tom: PecaTom, dados: Record<string, string>, fotos: string[]): PecaData[] {
  const tipos: { tipo: PecaTipo; nome: string; textos: Record<string, string> }[] = [
    {
      tipo: "capa",
      nome: "Capa Principal",
      textos: {
        titulo: dados.titulo || "NUPPE 2026",
        subtitulo: dados.subtitulo || "",
        destaque: dados.destaque || "",
      },
    },
    {
      tipo: "beneficios",
      nome: "Benefícios",
      textos: {
        titulo: "POR QUE ESCOLHER",
        item1: dados.beneficio1 || "Certificação FASB",
        item2: dados.beneficio2 || "Flexibilidade",
        item3: dados.beneficio3 || "Qualidade",
        item4: dados.beneficio4 || "Mercado",
      },
    },
    {
      tipo: "cursos",
      nome: "Cursos Disponíveis",
      textos: {
        titulo: "CURSOS DISPONÍVEIS",
        lista: dados.listaCursos || "",
      },
    },
    {
      tipo: "datas",
      nome: "Datas Importantes",
      textos: {
        titulo: "DATAS",
        matriculas: dados.matriculas || "A definir",
        inicioAulas: dados.inicioAulas || "A definir",
      },
    },
    {
      tipo: "valor",
      nome: "Investimento",
      textos: {
        titulo: "INVESTIMENTO",
        valor: dados.valor || "",
        condicao: dados.condicao || "",
      },
    },
    {
      tipo: "cta",
      nome: "CTA Final",
      textos: {
        titulo: dados.ctaTitulo || "GARANTA SUA VAGA",
        subtitulo: dados.ctaSubtitulo || "MATRÍCULAS ABERTAS",
        cta: dados.cta || "INSCREVA-SE AGORA",
      },
    },
  ];

  return tipos.map((t, i) => ({
    id: `${campanhaId}-${t.tipo}`,
    nome: `${dados.campanhaLabel} — ${t.nome}`,
    tipo: t.tipo,
    campanhaId,
    tom,
    textos: t.textos,
    bgImage: fotos[i % fotos.length],
    status: "rascunho" as PecaStatus,
  }));
}

export const campanhas: CampanhaData[] = [
  {
    id: "nuppe-2026",
    nome: "Campanha Institucional NUPPE 2026",
    descricao: "Tom institucional, moderno, confiável, atrativo e atual. Foco em qualificação profissional, crescimento, fortalecimento de carreira, atualização, acesso e flexibilidade.",
    tom: "institucional",
    pecas: gerarPecasCampanha("nuppe-2026", "institucional", {
      campanhaLabel: "NUPPE 2026",
      titulo: "NUPPE",
      subtitulo: "QUALIFICAÇÃO QUE TRANSFORMA",
      destaque: "2026",
      beneficio1: "Qualificação profissional",
      beneficio2: "Crescimento de carreira",
      beneficio3: "Atualização constante",
      beneficio4: "Acesso e flexibilidade",
      listaCursos: "Pós-Graduação • Cursos Livres • Extensão",
      matriculas: "Abertas",
      inicioAulas: "2026",
      valor: "Condições especiais",
      condicao: "Consulte nossos planos",
      ctaTitulo: "INVISTA NO SEU FUTURO",
      ctaSubtitulo: "NUPPE • FASB",
      cta: "SAIBA MAIS",
    }, [foto01, foto02, foto03, foto07, foto08, foto09]),
  },
  {
    id: "pos-graduacao-2026",
    nome: "Campanha Pós-Graduação 2026",
    descricao: "Matrículas abertas a partir de 15/01. Início das aulas: março/2026. Cursos de 360h, 12 meses, 12x de R$ 420,00.",
    tom: "institucional",
    pecas: gerarPecasCampanha("pos-graduacao-2026", "institucional", {
      campanhaLabel: "PÓS-GRADUAÇÃO 2026",
      titulo: "PÓS-GRADUAÇÃO",
      subtitulo: "ESPECIALIZE-SE COM QUEM ENTENDE",
      destaque: "FASB 2026",
      beneficio1: "360 horas de formação",
      beneficio2: "12 meses de duração",
      beneficio3: "Corpo docente qualificado",
      beneficio4: "Certificação FASB",
      listaCursos: "Direito Civil e Processo Civil\nDireito Previdenciário\nEnfermagem Obstétrica e UTI Neonatal\nSaúde Coletiva",
      matriculas: "A partir de 15/01",
      inicioAulas: "Março/2026",
      valor: "12x de R$ 420,00",
      condicao: "Mensalidade acessível",
      ctaTitulo: "GARANTA SUA VAGA",
      ctaSubtitulo: "MATRÍCULAS ABERTAS",
      cta: "INSCREVA-SE",
    }, [foto04, foto08, foto09, foto01, foto03, foto07]),
  },
  {
    id: "cursos-livres-2026",
    nome: "Campanha Cursos Livres 2026",
    descricao: "Matrículas: 15/01 a 13/02. Início: 23/02. Aberto ao público, certificação imediata, aulas semipresenciais.",
    tom: "comercial",
    pecas: gerarPecasCampanha("cursos-livres-2026", "comercial", {
      campanhaLabel: "CURSOS LIVRES 2026",
      titulo: "CURSOS LIVRES",
      subtitulo: "APRENDA UMA NOVA HABILIDADE EM POUCO TEMPO",
      destaque: "ABERTO AO PÚBLICO",
      beneficio1: "Certificação imediata",
      beneficio2: "Aulas semipresenciais",
      beneficio3: "Aberto ao público",
      beneficio4: "Parcelamento em até 4x sem juros",
      listaCursos: "Vendas e Imóveis • Maquiagem • Marketing Digital\nNutrição Esportiva • Estética • Enfermagem\nMassoterapia • Ed. Inclusiva",
      matriculas: "15/01 a 13/02",
      inicioAulas: "23/02",
      valor: "A partir de R$ 360,00",
      condicao: "Até 4x sem juros",
      ctaTitulo: "NÃO PERCA ESSA OPORTUNIDADE",
      ctaSubtitulo: "VAGAS LIMITADAS",
      cta: "MATRICULE-SE JÁ",
    }, [foto05, foto06, foto02, foto03, foto04, foto07]),
  },
];

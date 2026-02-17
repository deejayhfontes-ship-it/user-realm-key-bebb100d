/**
 * Landing Page Content Configuration
 * 
 * Edit the text content below to update the Home page.
 * All texts are organized by section for easy maintenance.
 */

export const landingContent = {
  hero: {
    title: {
      line1: "FONTES",
      line2: "GRAPHICS",
    },
    subtitle: "DESIGN STUDIO • POÇOS DE CALDAS",
    description: "Transformamos ideias em experiências visuais impactantes. Criatividade e estratégia para marcas que querem se destacar.",
    cta: {
      primary: "INICIAR PROJETO",
      secondary: "ÁREA DO CLIENTE",
    },
    floatingCard: {
      label: "FEATURED",
      title: "Brand Identity",
      description: "Projetos que transformam negócios",
    },
  },

  projects: {
    sectionTitle: "SELECTED WORKS",
    exploreButton: "Explore More +",
    ctaCards: {
      clientLogin: {
        tag: "ACESSO EXCLUSIVO",
        title: "ÁREA DO CLIENTE",
        button: "FAZER LOGIN +",
        link: "/client/login",
      },
      services: {
        tag: "NOSSOS SERVIÇOS",
        title: "PLANOS E PACOTES",
        button: "CONHECER +",
        link: "#services",
      },
    },
  },

  about: {
    sectionLabel: "SOBRE NÓS",
    title: "CRIANDO MARCAS QUE CONECTAM",
    description: "Somos um estúdio de design focado em criar experiências visuais memoráveis. Combinamos criatividade, estratégia e tecnologia para transformar ideias em resultados tangíveis.",
    philosophy: {
      title: "Nossa Filosofia",
      description: "Acreditamos que o design vai além da estética. É sobre resolver problemas, comunicar valores e criar conexões duradouras entre marcas e pessoas.",
    },
    stats: {
      years: { value: "7+", label: "Anos de Experiência" },
      projects: { value: "50+", label: "Projetos Entregues" },
      clients: { value: "30+", label: "Clientes Satisfeitos" },
    },
  },

  clients: {
    sectionLabel: "PARCEIROS CRIATIVOS",
    title: "PARCEIROS CRIATIVOS",
  },

  services: {
    sectionTitle: "SERVIÇOS",
    milestonesTitle: "CONQUISTAS",
    description: "Criamos experiências digitais que elevam marcas e engajam audiências. Nossos serviços combinam criatividade com estratégia, garantindo resultados visuais impactantes.",
    placeholderServices: [
      {
        id: "1",
        title: "Identidade Visual",
        short_description: "Criamos identidades visuais memoráveis que comunicam a essência da sua marca.",
        icon: "Palette",
      },
      {
        id: "2",
        title: "Web Design",
        short_description: "Sites e landing pages que convertem visitantes em clientes.",
        icon: "Monitor",
      },
      {
        id: "3",
        title: "Social Media",
        short_description: "Conteúdo estratégico para suas redes sociais com identidade consistente.",
        icon: "Instagram",
      },
      {
        id: "4",
        title: "Motion Graphics",
        short_description: "Animações e vídeos que dão vida às suas ideias.",
        icon: "Play",
      },
    ],
    milestones: {
      years: { value: "7", suffix: "+", label: "Anos de Experiência" },
      projects: { value: "50", suffix: "+", label: "Projetos Entregues" },
      clients: { value: "30", suffix: "+", label: "Clientes Satisfeitos" },
    },
  },

  contact: {
    sectionLabel: "VAMOS CONVERSAR",
    title: "VAMOS CRIAR ALGO INCRÍVEL JUNTOS",
    description: "Tem um projeto em mente? Adoraríamos ouvir sobre ele. Preencha o formulário abaixo e entraremos em contato em breve.",
    form: {
      namePlaceholder: "Seu nome",
      emailPlaceholder: "Seu e-mail",
      phonePlaceholder: "Seu telefone (opcional)",
      messagePlaceholder: "Conte-nos sobre seu projeto...",
      submitButton: "ENVIAR MENSAGEM",
      successMessage: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
    },
  },

  footer: {
    stayConnected: {
      label: "FIQUE CONECTADO.",
      email: "CONTATO@FONTES\nGRAPHICSDESIGN.COM.BR",
      emailHref: "contato@fontesgraphicsdesign.com.br",
      description: "Na Fontes Graphics, quebramos barreiras para criar designs que se destacam e entregam resultados.",
    },
  navigation: [
      { label: "Home", href: "#hero" },
      { label: "Sobre", href: "#about" },
      { label: "Portfólio", href: "/portfolio" },
      { label: "Serviços", href: "#services" },
      { label: "Orçamento", href: "/briefing" },
      { label: "Contato", href: "#contact" },
    ],
    socialLabel: "Social Media",
    socialLinks: [
      { platform: "instagram", href: "https://instagram.com/fontesgraphics" },
      { platform: "linkedin", href: "https://linkedin.com/company/fontesgraphics" },
      { platform: "youtube", href: "#" },
      { platform: "whatsapp", href: "https://wa.me/5535999999999" },
    ],
    watermark: "Fontes",
    copyright: "Fontes Graphics. Todos os direitos reservados.",
    legalLinks: {
      terms: { label: "Termos de Uso", href: "/termos" },
      privacy: { label: "Privacidade", href: "/privacidade" },
    },
  },

  navbar: {
    links: [
      { label: "Home", href: "#hero" },
      { label: "Projects", href: "#projects" },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
    ],
    clientAreaButton: "Área do Cliente",
  },
};

export type LandingContent = typeof landingContent;

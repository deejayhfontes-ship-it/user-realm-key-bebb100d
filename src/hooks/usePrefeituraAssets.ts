import { useState, useEffect } from 'react';

export interface PrefeituraConfig {
    secretarias: Record<string, SecretariaConfig>;
    global: GlobalConfig;
}

export interface SecretariaConfig {
    nome: string;
    corPrimaria: string;
    corSecundaria: string;
    fonteTitulo: string;
    fonteCorpo: string;
    logoUrl: string;
}

export interface GlobalConfig {
    fontePadrao: string;
    logoPrefeitura: string;
    fontes?: {
        nome: string;
        url: string;
    }[];
}

export function usePrefeituraAssets(secretariaSlug?: string) {
    const [config, setConfig] = useState<PrefeituraConfig | null>(null);
    const [currentSecretaria, setCurrentSecretaria] = useState<SecretariaConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/prefeitura-assets/config.json');
                if (!response.ok) throw new Error('Falha ao carregar configurações de assets');
                const data: PrefeituraConfig = await response.json();
                setConfig(data);
            } catch (err: any) {
                console.error('Erro ao carregar assets da prefeitura:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    useEffect(() => {
        if (config && secretariaSlug) {
            // Normaliza o slug (remove acentos e lowercase) para tentar encontrar
            // Mas o config.json usa chaves simples como "saude", "educacao"
            // Vamos tentar match direto ou normalizado
            const key = Object.keys(config.secretarias).find(k =>
                k.toLowerCase() === secretariaSlug.toLowerCase() ||
                slugify(config.secretarias[k].nome) === slugify(secretariaSlug)
            );

            if (key) {
                setCurrentSecretaria(config.secretarias[key]);
            } else {
                // Fallback para "padrao" ou o primeiro se não achar
                setCurrentSecretaria(null);
            }
        }
    }, [config, secretariaSlug]);

    const getStylePrompt = () => {
        if (!currentSecretaria) return '';
        // Lógica legada mantida por compatibilidade, mas o buildPrefeituraPrompt é o principal agora
        return `Use uma paleta de cores institucional com destaque para a cor primária ${currentSecretaria.corPrimaria} e secundária ${currentSecretaria.corSecundaria}. O estilo deve ser limpo, profissional e oficial, adequado para comunicação pública.`;
    };

    /**
     * Constrói um prompt textual com base nas referências (Port do agente.py)
     */
    const buildPrefeituraPrompt = (
        material: string,
        tema: string,
        intencao: string,
        detalhes: string
    ) => {
        if (!currentSecretaria) return '';

        const secretariaNome = currentSecretaria.nome;

        // Descrição das cores
        const coresDesc = `Primária ${currentSecretaria.corPrimaria}, Secundária ${currentSecretaria.corSecundaria}`;

        // Descrição de fontes
        const fontesDesc = `${currentSecretaria.fonteTitulo} (títulos), ${currentSecretaria.fonteCorpo} (corpo)`;

        // Layout baseado na intenção
        let layoutDesc = "diagramação moderna e profissional de material gráfico institucional";
        if (intencao.toLowerCase().includes('informar') || intencao.toLowerCase().includes('aviso')) {
            layoutDesc = "layout de informativo oficial com hierarquia visual clara: título em destaque, informações bem organizadas, aspecto de comunicado governamental profissional";
        } else if (intencao.toLowerCase().includes('evento')) {
            layoutDesc = "layout de cartaz/convite de evento institucional com título chamativo, data e local em destaque, composição vibrante e convidativa";
        } else if (intencao.toLowerCase().includes('conscientizar')) {
            layoutDesc = "layout de campanha de conscientização com título impactante, mensagem clara e visual educativo";
        }

        // Montagem do prompt — agora com instruções para COMPOR TEXTO na imagem
        const prompt = [
            `DESIGN GRÁFICO INSTITUCIONAL: Crie um(a) ${material} profissional para a Secretaria de ${secretariaNome}.`,
            '',
            `TÍTULO PRINCIPAL (DEVE aparecer composto na arte em destaque): "${tema}"`,
            `O título "${tema}" DEVE ser renderizado como TEXTO VISUAL na imagem, com tipografia grande, legível e profissional. NÃO gere apenas uma foto — gere um MATERIAL GRÁFICO/INFORMATIVO com o texto integrado ao design.`,
            '',
            `Intenção da comunicação: ${intencao}.`,
            `Estilo de layout: ${layoutDesc}.`,
            '',
            `DIRETRIZES DE DESIGN:`,
            `- Cores institucionais: ${coresDesc}`,
            `- Tipografia: similar a ${fontesDesc}`,
            `- O resultado DEVE parecer um material impresso profissional (flyer, cartaz, informativo)`,
            `- Inclua elementos gráficos decorativos que remetam à secretaria de ${secretariaNome}`,
            `- Mantenha identidade visual governamental: clean, organizado, oficial`,
            `- Hierarquia visual: título grande → subtítulo/informação → detalhes`,
            `- Reserve espaço para logotipo no rodapé ou topo`,
            '',
            detalhes ? `Informações adicionais para incluir no material: ${detalhes}` : '',
            '',
            `IMPORTANTE: O resultado final deve ser um INFORMATIVO/PEÇA GRÁFICA com texto composto, NÃO uma fotografia ou imagem genérica.`
        ].filter(Boolean).join('\n');

        return prompt;
    };

    return {
        config,
        currentSecretaria,
        loading,
        error,
        getStylePrompt,
        buildPrefeituraPrompt
    };
}

// Helper simples para normalizar strings
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

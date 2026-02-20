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
    const buildPrefeituraPrompt = (material: string, tema: string, intencao: string, detalhes: string) => {
        if (!currentSecretaria) return '';

        const secretariaNome = currentSecretaria.nome;

        // Descrição das cores (Baseado no agente.py: "nome codigo, ...")
        // Como o config atual tem campos fixos, formatamos manualmente
        const coresDesc = `Primária ${currentSecretaria.corPrimaria}, Secundária ${currentSecretaria.corSecundaria}`;

        // Descrição de fontes
        const fontesDesc = `${currentSecretaria.fonteTitulo} (títulos), ${currentSecretaria.fonteCorpo} (corpo)`;

        // Descrição do layout (Adaptado do agente.py)
        // No Python ele verifica arquivos de layout. Aqui vamos usar uma descrição baseada na intenção.
        let layoutDesc = "use uma diagramação harmoniosa e moderna";
        if (intencao.toLowerCase().includes('informar') || intencao.toLowerCase().includes('aviso')) {
            layoutDesc = "use uma composição clara, com destaque para a informação textual e hierarquia visual bem definida";
        } else if (intencao.toLowerCase().includes('evento')) {
            layoutDesc = "use uma composição vibrante e convidativa, com destaque para datas e atrações";
        }

        // Montagem do prompt seguindo fielmente o template do agente.py
        const prompt = [
            `Crie um(a) ${material} para a Secretaria de ${secretariaNome} com o tema: ${tema}.`,
            `Intenção da comunicação: ${intencao}.`,
            `Utilize as cores ${coresDesc} e tipografia similar a ${fontesDesc}.`,
            `${layoutDesc}.`,
            `Inclua elementos visuais que remetam às atividades da secretaria e mantenha a originalidade da arte.`,
            detalhes ? `Detalhes adicionais: ${detalhes}` : ''
        ].filter(Boolean).join(' ');

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

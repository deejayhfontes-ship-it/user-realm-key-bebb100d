import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface LegalPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const defaultTermsContent = `# Termos de Uso

Última atualização: ${new Date().toLocaleDateString('pt-BR')}

Bem-vindo ao Fontes Graphics. Ao utilizar nossos serviços, você concorda com estes termos.

## 1. Aceitação dos Termos

Ao acessar e usar este site, você aceita e concorda em cumprir estes termos e condições de uso.

## 2. Serviços Oferecidos

Oferecemos serviços de design gráfico, branding, web design e criação de conteúdo digital.

## 3. Propriedade Intelectual

Todo o conteúdo produzido permanece propriedade da Fontes Graphics até o pagamento integral dos serviços.

## 4. Pagamentos

Os pagamentos devem ser realizados conforme acordado em proposta comercial específica.

## 5. Cancelamentos

Cancelamentos devem ser solicitados com pelo menos 7 dias de antecedência.

## 6. Alterações nos Termos

Reservamo-nos o direito de modificar estes termos a qualquer momento.`;

const defaultPrivacyContent = `# Política de Privacidade

Última atualização: ${new Date().toLocaleDateString('pt-BR')}

Sua privacidade é importante para nós. Esta política descreve como coletamos e utilizamos suas informações.

## Coleta de Dados

Coletamos informações que você nos fornece diretamente, como nome, email e telefone.

## Uso de Informações

Utilizamos suas informações para:
- Prestar os serviços contratados
- Enviar comunicações sobre projetos
- Melhorar nossos serviços

## Cookies

Utilizamos cookies para melhorar sua experiência de navegação.

## Compartilhamento de Dados

Não vendemos ou compartilhamos suas informações pessoais com terceiros.

## Seus Direitos (LGPD)

Conforme a Lei Geral de Proteção de Dados, você tem direito a:
- Acessar seus dados pessoais
- Corrigir dados incompletos ou desatualizados
- Solicitar a exclusão de seus dados
- Revogar consentimento

## Contato

Para questões sobre privacidade, entre em contato conosco.`;

export function useLegalPages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pages, isLoading: loading } = useQuery({
    queryKey: ['legal-pages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Return defaults if empty
      if (!data || data.length === 0) {
        return [
          {
            id: 'default-terms',
            user_id: user.id,
            slug: 'termos',
            title: 'Termos de Uso',
            content: defaultTermsContent,
            meta_title: 'Termos de Uso',
            meta_description: 'Termos e condições de uso dos serviços da Fontes Graphics',
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'default-privacy',
            user_id: user.id,
            slug: 'privacidade',
            title: 'Política de Privacidade',
            content: defaultPrivacyContent,
            meta_title: 'Política de Privacidade',
            meta_description: 'Como tratamos seus dados pessoais na Fontes Graphics',
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as LegalPage[];
      }
      
      return data as LegalPage[];
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: savePage, isPending: saving } = useMutation({
    mutationFn: async (page: Partial<LegalPage> & { slug: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('legal_pages')
        .upsert({
          user_id: user.id,
          slug: page.slug,
          title: page.title || page.slug,
          content: page.content,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          is_published: page.is_published ?? false,
        }, { onConflict: 'user_id,slug' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages'] });
      toast({
        title: 'Página salva!',
        description: 'O conteúdo foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getPage = (slug: string) => {
    return pages?.find(p => p.slug === slug);
  };

  return {
    pages: pages || [],
    loading,
    saving,
    savePage,
    getPage,
    defaultTermsContent,
    defaultPrivacyContent,
  };
}

// Public hook for viewing published pages
export function usePublicLegalPage(slug: string) {
  return useQuery({
    queryKey: ['public-legal-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data as LegalPage;
    },
    enabled: !!slug,
  });
}

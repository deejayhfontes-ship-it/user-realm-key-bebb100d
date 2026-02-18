import { useParams, Navigate } from 'react-router-dom';
import { StoriesGenerator } from '@/components/generators/StoriesGenerator';
import { CarrosselGenerator } from '@/components/generators/CarrosselGenerator';
import { DesignerDoFuturoGenerator } from '@/components/generators/DesignerDoFuturoGenerator';

/**
 * ═══════════════════════════════════════════════
 * PÁGINA DE GERADOR (ÁREA DO CLIENTE)
 * ═══════════════════════════════════════════════
 * 
 * Rota: /client/generator/:slug
 * 
 * Carrega o gerador correto baseado no slug da URL.
 * Cada gerador é um componente modular que usa o GeneratorBase.
 */

// Mapeamento de slugs para componentes
const generatorComponents: Record<string, React.ComponentType> = {
  stories: StoriesGenerator,
  carrossel: CarrosselGenerator,
  'designer-do-futuro': DesignerDoFuturoGenerator,
};

export function GeneratorPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !generatorComponents[slug]) {
    return <Navigate to="/client" replace />;
  }

  const GeneratorComponent = generatorComponents[slug];

  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/client" className="hover:text-foreground transition-colors">
              Início
            </a>
            <span>/</span>
            <span className="text-foreground capitalize">{slug}</span>
          </nav>
        </div>
      </header>

      {/* Conteúdo do gerador */}
      <main className="container py-6">
        <GeneratorComponent />
      </main>
    </div>
  );
}

export default GeneratorPage;

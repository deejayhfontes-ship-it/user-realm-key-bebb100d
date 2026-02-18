import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { StoriesGenerator } from '@/components/generators/StoriesGenerator';
import { CarrosselGenerator } from '@/components/generators/CarrosselGenerator';
import { DesignerDoFuturoGenerator } from '@/components/generators/DesignerDoFuturoGenerator';

// Mapeamento de slugs para componentes
const generatorComponents: Record<string, React.ComponentType> = {
    stories: StoriesGenerator,
    carrossel: CarrosselGenerator,
    'designer-do-futuro': DesignerDoFuturoGenerator,
};

const generatorNames: Record<string, string> = {
    stories: 'Gerador de Stories',
    carrossel: 'Carrossel de Interações',
    'designer-do-futuro': 'Designer do Futuro',
};

export function AdminGeneratorPreview() {
    const { slug } = useParams<{ slug: string }>();

    if (!slug || !generatorComponents[slug]) {
        return <Navigate to="/admin/generators" replace />;
    }

    const GeneratorComponent = generatorComponents[slug];
    const name = generatorNames[slug] || slug;

    return (
        <div className="flex flex-col h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 px-8 py-4 border-b border-border/50 bg-card/50">
                <Link
                    to="/admin/generators"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Geradores
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground">{name}</span>
            </div>

            {/* Conteúdo do gerador */}
            <div className="flex-1 overflow-auto">
                <GeneratorComponent />
            </div>
        </div>
    );
}

export default AdminGeneratorPreview;

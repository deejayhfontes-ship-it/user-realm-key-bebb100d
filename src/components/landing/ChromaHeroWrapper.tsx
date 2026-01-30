import { Suspense, lazy, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Import lazy para evitar carregar WebGL desnecessariamente
const ChromaHero = lazy(() => import('./ChromaHero'));

// Loading fallback
function ChromaHeroLoading() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black" />
      <div className="z-10 text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm font-pixel">Carregando...</p>
      </div>
    </section>
  );
}

export default function ChromaHeroWrapper() {
  const [aboutImageUrl, setAboutImageUrl] = useState<string | undefined>(undefined);

  // Buscar about_image_url do Supabase
  useEffect(() => {
    async function fetchAboutImage() {
      try {
        const { data } = await supabase
          .from('company_about')
          .select('about_image_url')
          .limit(1)
          .maybeSingle();
        
        if (data?.about_image_url) {
          setAboutImageUrl(data.about_image_url);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem do about:', error);
      }
    }
    
    fetchAboutImage();
  }, []);

  return (
    <Suspense fallback={<ChromaHeroLoading />}>
      <ChromaHero aboutImageUrl={aboutImageUrl} />
    </Suspense>
  );
}

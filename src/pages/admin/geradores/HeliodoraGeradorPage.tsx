import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function HeliodoraGeradorPage() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Escuta o botão "Voltar" do iframe ──────────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.action === 'goBack') navigate('/admin/generators');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  // ── Busca a key Gemini do Supabase e injeta no iframe ──────────────────
  const injectApiKey = async () => {
    try {
      const { data: rows } = await (supabase.from('ai_providers') as any)
        .select('api_key_encrypted, system_prompt')
        .eq('slug', 'designer-do-futuro')
        .eq('is_active', true)
        .limit(1);

      const row = rows?.[0];
      if (!row) return;

      let geminiKey = '';
      // Tenta o pool de keys no system_prompt (JSON)
      if (row.system_prompt) {
        try {
          const meta = JSON.parse(row.system_prompt);
          const pool = (meta.api_keys || []).filter((k: any) => k.enabled && k.key);
          if (pool.length > 0) geminiKey = pool[0].key;
        } catch {}
      }
      // Fallback para key principal
      if (!geminiKey && row.api_key_encrypted) geminiKey = row.api_key_encrypted;

      if (geminiKey && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: 'setApiKey', provider: 'gemini', key: geminiKey, model: 'gemini-2.5-pro' },
          '*'
        );
      }
    } catch (e) {
      console.warn('[HeliodoraGerador] Erro ao buscar key Gemini:', e);
    }
  };

  return (
    <div style={{ height: '100%', minHeight: 0 }}>
      <iframe
        ref={iframeRef}
        src="/geradores/heliodora.html"
        style={{ width: '100%', border: 'none', display: 'block', minHeight: '100vh' }}
        title="Gerador de Posts - Heliodora"
        sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
        onLoad={injectApiKey}
      />
    </div>
  );
}


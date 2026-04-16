import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credenciais Trello da Faculdade — via variáveis de ambiente Supabase
const TRELLO_API_KEY = Deno.env.get("TRELLO_FACULDADE_API_KEY") ?? "";
const TRELLO_TOKEN = Deno.env.get("TRELLO_FACULDADE_TOKEN") ?? "";
const TRELLO_LIST_ID = Deno.env.get("TRELLO_FACULDADE_LIST_ID") ?? "69bbcaa71097e49d4e6f364c";

const URGENCIA_LABELS: Record<string, string> = {
  Baixa: "🟢",
  Média: "🟡",
  Alta: "🟠",
  Urgente: "🔴",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { titulo, descricao, instituicao, tipo, urgencia, email } = await req.json();

    if (!titulo || !tipo) {
      return new Response(
        JSON.stringify({ success: false, message: "Título e tipo são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emoji = URGENCIA_LABELS[urgencia] || "⚪";
    const cardName = `${emoji} [${instituicao}] ${titulo}`;
    const cardDesc = [
      `**📋 Tipo:** ${tipo}`,
      `**🏛️ Instituição:** ${instituicao}`,
      `**⚡ Urgência:** ${urgencia}`,
      `**📧 Solicitante:** ${email}`,
      `**📅 Data:** ${new Date().toLocaleDateString("pt-BR")}`,
      "",
      "---",
      "",
      `**📝 Descrição:**`,
      descricao || "Sem descrição adicional.",
    ].join("\n");

    // Criar card no Trello
    const url = `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const trelloRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idList: TRELLO_LIST_ID,
        name: cardName,
        desc: cardDesc,
        pos: "top",
      }),
    });

    if (!trelloRes.ok) {
      const errText = await trelloRes.text();
      console.error("Trello API error:", errText);
      throw new Error(`Trello API error: ${trelloRes.status}`);
    }

    const card = await trelloRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        cardId: card.id,
        cardUrl: card.shortUrl,
        message: "Solicitação enviada para o Trello com sucesso!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erro ao enviar para o Trello",
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

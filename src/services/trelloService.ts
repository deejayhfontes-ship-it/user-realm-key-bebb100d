<<<<<<< HEAD
import { supabase } from "@/integrations/supabase/client";

interface BriefingData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  tipoProjeto: string;
  descricao: string;
  referencias: string;
  prazo: string;
  arquivos: string[];
  id: number;
  data: string;
}

interface TrelloResponse {
  success: boolean;
  cardId?: string;
  cardUrl?: string;
  message: string;
  error?: string;
}

export async function createTrelloCard(briefingData: BriefingData): Promise<TrelloResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('trello-card', {
      body: briefingData
    });

    if (error) {
      console.error('Error calling trello-card function:', error);
      return {
        success: false,
        message: 'Pedido salvo localmente. Enviaremos para a produção em breve.',
        error: error.message
      };
    }

    return data as TrelloResponse;
  } catch (error) {
    console.error('Error in createTrelloCard:', error);
    return {
      success: false,
      message: 'Pedido salvo localmente. Enviaremos para a produção em breve.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
=======
import { supabase } from "@/integrations/supabase/client";

interface BriefingData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  tipoProjeto: string;
  descricao: string;
  referencias: string;
  prazo: string;
  arquivos: string[];
  id: number;
  data: string;
}

interface TrelloResponse {
  success: boolean;
  cardId?: string;
  cardUrl?: string;
  message: string;
  error?: string;
}

export async function createTrelloCard(briefingData: BriefingData): Promise<TrelloResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('trello-card', {
      body: briefingData
    });

    if (error) {
      console.error('Error calling trello-card function:', error);
      return {
        success: false,
        message: 'Pedido salvo localmente. Enviaremos para a produção em breve.',
        error: error.message
      };
    }

    return data as TrelloResponse;
  } catch (error) {
    console.error('Error in createTrelloCard:', error);
    return {
      success: false,
      message: 'Pedido salvo localmente. Enviaremos para a produção em breve.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d

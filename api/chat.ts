import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // NOTA: A funcionalidade de chat foi desativada para gerenciar os custos da API
  // e permanecer dentro dos limites da camada gratuita. Este endpoint não processará
  // mais mensagens de chat.
  return response.status(410).json({ 
    error: 'A funcionalidade de chat foi desativada no momento.' 
  });
}
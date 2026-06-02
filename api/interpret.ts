import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to run the AI features.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { query, currentDate } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const client = getAiClient();
    const relativeDate = currentDate || new Date().toISOString().split("T")[0];

    const prompt = `Interprete o seguinte comando financeiro por voz ou texto e retorne um objeto estruturado:
"${query}"

Data de referência hoje é: ${relativeDate} (Use-a para resolver termos como 'hoje', 'ontem', 'anteontem', 'semana passada', 'mês que vem', etc.)

Instruções para mapeamento:
- Descrição: nome simplificado da transação (ex: "Mercado Atacadão", "Abastecimento posto BR", "Aluguel da Kitnet", "Almoço", "Uber"). Prefira letra maiúscula no início.
- Local: se houver estabelecimento ou local explícito (ex: "Posto BR", "Atacadão", ou vazio "" se não aplicável).
- Valor: número correspondente (ex: 150, 380, 35, 900, 250).
- Tipo: "Despesa" (saída de dinheiro, compras, gastos) OU "Receita" (entradas, recebimentos, salário, lucros).
- Forma de pagamento: classificar em: 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Boleto', 'Transferência' (padrão é 'Pix' ou 'Dinheiro' se não especificado, mas identifique menções como "cartão Inter" -> 'Cartão de Crédito', "débito" -> 'Cartão de Débito', "no Pix" -> 'Pix').
- Cartão: caso a forma de pagamento seja 'Cartão de Crédito', identifique o cartão mencionado se houver (ex: 'Inter', 'C6', 'Credcard Black', ou vazio "").
- Categoria: classificar em alguma das seguintes: 'Alimentação' (mercado, almoço, lanche), 'Combustível' (posto, gasolina, abastecimento), 'Moradia' (aluguel, kitnet, luz, água), 'Serviços' (Uber, assinatura, consultoria), 'Investimento' (dividendos, ações), 'Lazer' (cinema, bar, viagem), 'Seguros', or 'Outros'.
- Data: data da transação formato YYYY-MM-DD. Resolva termos relativos de acordo com a data de hoje.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            local: { type: Type.STRING },
            value: { type: Type.NUMBER },
            type: { 
              type: Type.STRING, 
              description: "Must be 'Despesa' or 'Receita'" 
            },
            paymentMethod: { 
              type: Type.STRING, 
              description: "Must be 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Boleto', 'Transferência'" 
            },
            cardName: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              description: "Must be 'Alimentação', 'Combustível', 'Moradia', 'Serviços', 'Investimento', 'Lazer', 'Seguros', or 'Outros'" 
            },
            date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
          },
          required: ["description", "value", "type", "paymentMethod", "category", "date"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text?.trim() || "{}");
    return res.json({ result: parsedResult });
  } catch (e: any) {
    console.error("AI Error:", e);
    return res.status(500).json({ error: e.message || "Erro interno do servidor" });
  }
}

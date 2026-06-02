import express from "express";
import path from "path";
import fs from "fs/promises";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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

async function sendEmailBackup() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const targetEmail = process.env.BACKUP_EMAIL || "aandreandre@hotmail.com";

  if (!host || !user || !pass) {
    console.log("Serviço de backup por email inativo: Configure as credenciais SMTP no arquivo .env");
    return;
  }

  try {
    const BACKUP_PATH = path.join(process.cwd(), "backup.json");
    await fs.access(BACKUP_PATH);
    const backupData = await fs.readFile(BACKUP_PATH, "utf-8");

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Backup Grupo 3A" <${user}>`,
      to: targetEmail,
      subject: `Backup Diário Automático - Grupo 3A Finance - ${new Date().toLocaleDateString("pt-BR")}`,
      text: `Olá! Segue em anexo o backup diário automático do seu banco de dados de despesas e finanças do Grupo 3A.\n\nData do Backup: ${new Date().toLocaleString("pt-BR")}`,
      attachments: [
        {
          filename: "backup.json",
          content: backupData,
        },
      ],
    });

    console.log("Backup por email enviado automaticamente com sucesso!", info.messageId);
  } catch (e: any) {
    console.error("Erro ao enviar backup automático por email:", e.message);
  }
}

function startBackupScheduler() {
  // Roda uma verificação a cada hora
  setInterval(() => {
    const now = new Date();
    // Envia o backup exatamente às 23h de cada dia
    if (now.getHours() === 23) {
      console.log("Iniciando envio automático de backup diário às 23h...");
      sendEmailBackup();
    }
  }, 1000 * 60 * 60); // 1 hora
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Inicia o agendador de backups automáticos diários
  startBackupScheduler();

  const BACKUP_PATH = path.join(process.cwd(), "backup.json");

  // Endpoint de GET para obter o backup local
  app.get("/api/backup", async (req, res) => {
    try {
      await fs.access(BACKUP_PATH);
      const data = await fs.readFile(BACKUP_PATH, "utf-8");
      return res.json(JSON.parse(data));
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return res.status(404).json({ error: "Nenhum backup encontrado" });
      }
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint de POST para salvar o backup local no arquivo backup.json
  app.post("/api/backup", async (req, res) => {
    try {
      const backupData = req.body;
      await fs.writeFile(BACKUP_PATH, JSON.stringify(backupData, null, 2), "utf-8");
      return res.json({ success: true, message: "Backup salvo com sucesso no arquivo local!" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Endpoint de POST para enviar backup por email manualmente (para testes)
  app.post("/api/backup/email", async (req, res) => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const targetEmail = process.env.BACKUP_EMAIL || "aandreandre@hotmail.com";

    if (!host || !user || !pass) {
      return res.status(400).json({ error: "Configurações SMTP incompletas no arquivo .env (SMTP_HOST, SMTP_USER, SMTP_PASS)" });
    }

    try {
      const BACKUP_PATH = path.join(process.cwd(), "backup.json");
      await fs.access(BACKUP_PATH);
      const backupData = await fs.readFile(BACKUP_PATH, "utf-8");

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"Backup Grupo 3A" <${user}>`,
        to: targetEmail,
        subject: `Backup Manual de Teste - Grupo 3A Finance`,
        text: `Teste de envio de backup manual enviado com sucesso.\n\nData do Lançamento: ${new Date().toLocaleString("pt-BR")}`,
        attachments: [
          {
            filename: "backup.json",
            content: backupData,
          },
        ],
      });

      return res.json({ success: true, message: "Backup enviado com sucesso para " + targetEmail });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // API parser endpoint for smart finance commands
  app.post("/api/interpret", async (req, res) => {
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
  });

  // Serve static assets in production or use Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML fallback for multi-routes index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();

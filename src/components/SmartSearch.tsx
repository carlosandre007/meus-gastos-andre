import React, { useState } from "react";
import { Search, Sparkles, AlertCircle } from "lucide-react";
import { Transaction, Card, Bank } from "../types";

interface SmartSearchProps {
  transactions: Transaction[];
  cards: Card[];
  banks: Bank[];
}

export default function SmartSearch({ transactions, cards, banks }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<{ text: string; value?: number; highlight?: string } | null>(null);

  const suggestionQueries = [
    "Quanto gastei com combustível este mês",
    "Quanto devo no cartão Inter",
    "Quanto recebi de aluguel",
    "Qual meu saldo disponível",
    "Quanto foi gasto em alimentação",
  ];

  const handleSearch = (searchStr: string) => {
    setQuery(searchStr);
    const cleaned = searchStr.toLowerCase().trim();
    if (!cleaned) {
      setAnswer(null);
      return;
    }

    // 1. "Quanto gastei com combustível este mês" or "combustível" / "gasolina" / "abastecimento"
    if (cleaned.includes("combustível") || cleaned.includes("combustivel") || cleaned.includes("posto") || cleaned.includes("gasolina")) {
      const fuelTotal = transactions
        .filter(t => t.type === "Despesa" && (t.category === "Combustível" || t.description.toLowerCase().includes("posto") || t.description.toLowerCase().includes("abastecimento")))
        .reduce((sum, t) => sum + t.value, 0);

      setAnswer({
        text: `Você gastou um total de combustível de:`,
        value: fuelTotal,
        highlight: "Combustível"
      });
      return;
    }

    // 2. "Quanto devo no cartão Inter" or "devo no inter" / "fatura inter"
    if (cleaned.includes("inter") && cleaned.includes("devo") || cleaned.includes("fatura") && cleaned.includes("inter") || cleaned.includes("cartão inter") || cleaned.includes("cartao inter")) {
      const interCard = cards.find(c => c.id === "card-inter" || c.name.toLowerCase().includes("inter"));
      const limitUsed = interCard ? interCard.usedLimit : 0;
      setAnswer({
        text: `Seu saldo devedor atual (fatura acumulada) no Cartão Inter é:`,
        value: limitUsed,
        highlight: "Cartão Inter"
      });
      return;
    }

    // 3. "Quanto recebi de aluguel" or "aluguel" with income keywords
    if (cleaned.includes("aluguel") || cleaned.includes("recebi de aluguel") || cleaned.includes("kitnet")) {
      const rentTotal = transactions
        .filter(t => t.description.toLowerCase().includes("aluguel") || t.description.toLowerCase().includes("kitnet"))
        .filter(t => t.type === "Receita")
        .reduce((sum, t) => sum + t.value, 0);

      setAnswer({
        text: `O total recebido referente a Aluguel / Kitnet é:`,
        value: rentTotal,
        highlight: "Aluguel"
      });
      return;
    }

    // 4. "Qual meu saldo disponível" or "saldo geral" or "patrimônio" or "patrimonio"
    if (cleaned.includes("saldo disponível") || cleaned.includes("saldo disponivel") || cleaned.includes("saldo geral") || cleaned.includes("carteira") || cleaned.includes("disponível")) {
      const totalBalance = banks.reduce((sum, b) => sum + b.currentBalance, 0);
      setAnswer({
        text: `Seu saldo líquido total somado entre todas as contas bancárias é:`,
        value: totalBalance,
        highlight: "Saldo Geral"
      });
      return;
    }

    // 5. "Quanto foi gasto em alimentação" or "alimentação" / "mercado" / "almoço" / "restaurante"
    if (cleaned.includes("alimentação") || cleaned.includes("alimentacao") || cleaned.includes("gasto com comida") || cleaned.includes("comida") || cleaned.includes("mercado") || cleaned.includes("almoço") || cleaned.includes("almoco")) {
      const foodTotal = transactions
        .filter(t => t.type === "Despesa" && (t.category === "Alimentação" || t.description.toLowerCase().includes("mercado") || t.description.toLowerCase().includes("almoço") || t.description.toLowerCase().includes("atacadão")))
        .reduce((sum, t) => sum + t.value, 0);

      setAnswer({
        text: `O somatório total de gastos mapeados em Alimentação é:`,
        value: foodTotal,
        highlight: "Alimentação"
      });
      return;
    }

    // Simple word fallback
    const matchedCategory = ["alimentação", "alimentacao", "combustível", "combustivel", "moradia", "serviços", "servicos", "investimento", "lazer", "seguros", "outros"].find(cat => cleaned.includes(cat));
    if (matchedCategory) {
      const cat = matchedCategory === "alimentacao" ? "Alimentação" : matchedCategory === "combustivel" ? "Combustível" : matchedCategory === "servicos" ? "Serviços" : matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
      const total = transactions
        .filter(t => t.category.toLowerCase() === matchedCategory)
        .reduce((sum, t) => sum + (t.type === "Despesa" ? t.value : -t.value), 0);
      
      setAnswer({
        text: `Balanço líquido para a categoria '${cat}' (Despesas menos Receitas se houver):`,
        value: Math.abs(total),
        highlight: cat
      });
      return;
    }

    // Default fallback filter matching description words
    const filtered = transactions.filter(t => t.description.toLowerCase().includes(cleaned) || t.category.toLowerCase().includes(cleaned));
    if (filtered.length > 0) {
      const sum = filtered.reduce((total, t) => total + t.value, 0);
      setAnswer({
        text: `Encontramos ${filtered.length} transação(ões) correspondente(s) com a soma acumulada de:`,
        value: sum,
        highlight: "Mapeamento Manual"
      });
    } else {
      setAnswer({
        text: `Não consegui encontrar dados específicos para "${searchStr}". Tente usar palavras como Aluguel, Combustível, Inter, Saldo ou Alimentação!`,
        highlight: "Sem Resultados"
      });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden" id="search-section">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-secondary" />
        <h3 className="font-display font-semibold text-lg text-white">Assistente de Busca Natural</h3>
      </div>
      
      <p className="text-on-surface-variant text-sm mb-4">
        Pergunte algo como você falaria normalmente. Meu motor interno interpretará as contas do Grupo 3A em tempo real.
      </p>

      {/* Input container */}
      <div className="relative flex items-center mb-5">
        <Search className="absolute left-3 w-5 h-5 text-on-surface-variant" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Ex: Quanto gastei com combustível este mês?"
          className="w-full pl-10 pr-4 py-3 bg-brand-lowest border border-white/10 rounded-xl text-white text-sm placeholder-on-surface-variant focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setAnswer(null);
            }}
            className="absolute right-3 text-xs text-on-surface-variant hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Suggestion list */}
      <div className="flex flex-wrap gap-2 mb-5">
        {suggestionQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSearch(q)}
            className="text-xs bg-brand-lowest hover:bg-brand-bright text-brand-primary border border-white/5 hover:border-brand-secondary/30 px-3 py-1.5 rounded-full transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Answering Box */}
      {answer && (
        <div className="p-4 bg-brand-low/80 border border-brand-secondary/20 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#4edea3]">Módulo de Resposta 3A</span>
            {answer.highlight && (
              <span className="text-[9px] bg-brand-secondary/20 text-brand-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                {answer.highlight}
              </span>
            )}
          </div>
          <p className="text-sm text-balance text-on-surface mb-2">{answer.text}</p>
          {answer.value !== undefined ? (
            <p className="font-display font-bold text-2xl text-white">
              R$ {answer.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-brand-tertiary">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Palavra-chave não encontrada nas contas atuais</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

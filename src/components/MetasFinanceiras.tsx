import React, { useState } from "react";
import { Plus, Target, Calendar, TrendingUp, Compass, CheckCircle2, ChevronRight, Calculator, AlertCircle, DollarSign, Wallet } from "lucide-react";
import { Goal, Bank } from "../types";

interface MetasFinanceirasProps {
  goals: Goal[];
  banks: Bank[];
  onAddGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  onUpdateGoalProgress: (goalId: string, amount: number, bankId?: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function MetasFinanceiras({
  goals,
  banks,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
}: MetasFinanceirasProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentSaved, setCurrentSaved] = useState("");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [category, setCategory] = useState("Investimento");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [activeDepositGoalId, setActiveDepositGoalId] = useState<string | null>(null);

  // Reference date matches today as 2026-06-02
  const TODAY_REF = new Date("2026-06-02");

  const calculateRequiredSavings = (target: number, current: number, deadlineStr: string) => {
    const remaining = target - current;
    if (remaining <= 0) return { months: 0, weeks: 0, perMonth: 0, perWeek: 0, daysLeft: 0 };

    const targetDate = new Date(deadlineStr);
    const timeDiff = targetDate.getTime() - TODAY_REF.getTime();
    
    // Calculate days remaining
    const daysLeft = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    // Estimate months and weeks
    const weeks = Math.max(1, Math.ceil(daysLeft / 7));
    const months = Math.max(1, Math.ceil(daysLeft / 30.4));

    return {
      daysLeft,
      weeks,
      months,
      perMonth: remaining / months,
      perWeek: remaining / weeks,
    };
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    onAddGoal({
      title,
      targetValue: parseFloat(targetValue),
      currentSaved: currentSaved ? parseFloat(currentSaved) : 0,
      deadline,
      category,
    });

    setTitle("");
    setTargetValue("");
    setCurrentSaved("");
    setDeadline("2026-12-31");
    setCategory("Investimento");
    setShowAddForm(false);
  };

  const handleDeposit = (goalId: string) => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    onUpdateGoalProgress(goalId, amt, selectedBankId || undefined);
    setDepositAmount("");
    setActiveDepositGoalId(null);
    setSelectedBankId("");
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">Área de Realizações</span>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#10B981]" />
              Metas Financeiras Personalizadas
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Crie objetivos de economia a médio ou longo prazo e receba orientações semanais e mensais automatizadas de poupança.
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-bold px-4 py-2 text-xs rounded-xl transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4 text-[#10B981]" />
            {showAddForm ? "Cancelar Meta" : "Nova Meta"}
          </button>
        </div>

        {/* Quick overall goals summary card */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-gray-400">Total Reservado</span>
              <p className="font-mono font-bold text-lg text-[#111827] mt-1">
                R$ {goals.reduce((sum, g) => sum + g.currentSaved, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-gray-400">Meta Consolidada</span>
              <p className="font-mono font-bold text-lg text-[#10B981] mt-1">
                R$ {goals.reduce((sum, g) => sum + g.targetValue, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-gray-400">Objetivos Ativos</span>
              <p className="font-mono font-bold text-lg text-gray-900 mt-1">{goals.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Goal Creation Form */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4 animate-scale-up">
          <h3 className="font-display font-semibold text-sm text-[#111827] uppercase tracking-wider flex items-center gap-1 border-b pb-2">
            <Compass className="w-4 h-4 text-[#10B981]" />
            Configurar Novo Objetivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Título da Meta *</label>
              <input
                type="text"
                required
                placeholder="Ex: Comprar Carro Novo, Viagem de férias"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Investimento">Investimento</option>
                <option value="Reserva de Emergência">Reserva de Emergência</option>
                <option value="Viagem">Viagem</option>
                <option value="Aquisição">Aquisição / Compra</option>
                <option value="Aposentadoria">Aposentadoria de Longo Prazo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Valor Alvo (R$) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Ex: 35000.00"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Já tenho guardado (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 5000"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Prazo Final *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          {/* Live calculator insights preview before submitting */}
          {targetValue && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
              <Calculator className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-gray-600">
                <span className="font-bold text-[#111827]">Estimativa de Poupança Grupo 3A:</span>
                {(() => {
                  const target = parseFloat(targetValue);
                  const current = currentSaved ? parseFloat(currentSaved) : 0;
                  const metrics = calculateRequiredSavings(target, current, deadline);
                  if (target <= current) {
                    return <p className="text-[#10B981]">Esta meta já está totalmente alcançada! Parabéns!</p>;
                  }
                  return (
                    <p>
                      Para atingir esta meta até o dia <strong className="text-gray-900">{deadline}</strong> ({metrics.daysLeft} dias restantes), você precisará economizar aproximadamente <strong className="text-gray-900">R$ {metrics.perMonth.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} por mês</strong> ou <strong className="text-gray-900">R$ {metrics.perWeek.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} por semana</strong>.
                    </p>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-6 py-2.5 text-xs rounded-xl uppercase tracking-wider transition-colors"
            >
              Criar Meta Financeira
            </button>
          </div>
        </form>
      )}

      {/* Main list of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
            <Target className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma meta ativa registrada.</p>
            <p className="text-xs text-gray-400 mt-1">Crie sua primeira meta clicando em "Nova Meta" para simular a alocação de poupança.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentSaved / goal.targetValue) * 100));
            const metrics = calculateRequiredSavings(goal.targetValue, goal.currentSaved, goal.deadline);
            const isCompleted = goal.currentSaved >= goal.targetValue;

            return (
              <div key={goal.id} className="bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all">
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded-sm">
                        {goal.category}
                      </span>
                      <h4 className="font-semibold text-sm text-[#111827] mt-1.5">{goal.title}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-xs text-gray-400 hover:text-red-500 font-semibold"
                    >
                      Excluir
                    </button>
                  </div>

                  {/* Pricing metrics */}
                  <div className="flex justify-between items-end pt-1 bg-gray-50/50 p-2 rounded">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-semibold">Total Alvo</span>
                      <span className="font-mono font-extrabold text-sm text-[#111827]">
                        R$ {goal.targetValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block font-semibold">Guardado Hoje</span>
                      <span className="font-mono text-sm font-bold text-[#10B981]">
                        R$ {goal.currentSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-4">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-semibold">
                    <span>Progresso</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-[#10B981]" : "bg-[#10B981]/80"
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Deadlines remaining details / weekly rates */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-1.5 mb-4">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Prazo: {goal.deadline} ({metrics.daysLeft} dias restantes)</span>
                  </div>

                  {!isCompleted ? (
                    <div className="pt-1.5 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span>Min. por Mês:</span>
                        <strong className="text-gray-900 font-mono">R$ {metrics.perMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Min. por Semana:</span>
                        <strong className="text-gray-900 font-mono">R$ {metrics.perWeek.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#10B981] font-semibold pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Meta alcançada! Parabéns pelo planejamento!</span>
                    </div>
                  )}
                </div>

                {/* Bottom Deposit actions inside meta */}
                {!isCompleted && (
                  <div>
                    {activeDepositGoalId === goal.id ? (
                      <div className="space-y-2 pt-2 border-t border-gray-100 animate-scale-up">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Simular Envio de Fundo da Conta Bancária:</div>
                        <div className="flex gap-2">
                          <select
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none"
                          >
                            <option value="">Escolher Conta...</option>
                            {banks.map(b => (
                              <option key={b.id} value={b.id} disabled={b.currentBalance <= 0}>
                                {b.name} (Saldo: R$ {b.currentBalance.toFixed(0)})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="R$ Valor"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-24 bg-white border border-gray-200 rounded-lg px-2 p-1.5 text-xs focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeposit(goal.id)}
                            className="flex-1 bg-[#10B981] text-white font-bold p-1 px-3 text-[10px] rounded hover:bg-[#059669]"
                          >
                            Confirmar Depósito
                          </button>
                          <button
                            onClick={() => {
                              setActiveDepositGoalId(null);
                              setDepositAmount("");
                              setSelectedBankId("");
                            }}
                            className="bg-gray-100 text-gray-600 p-1 px-2.5 text-[10px] rounded hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveDepositGoalId(goal.id);
                          // Default select first bank with money
                          const b = banks.find(x => x.currentBalance > 100);
                          if (b) setSelectedBankId(b.id);
                        }}
                        className="w-full bg-[#111827] text-white hover:bg-gray-800 text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Wallet className="w-3 h-3 text-[#10B981]" />
                        Simular Depósito de Economias
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

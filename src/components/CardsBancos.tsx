import React, { useState } from "react";
import { CreditCard, Plus, ShieldCheck, X, Building, DollarSign } from "lucide-react";
import { Card, Bank } from "../types";

interface CardsBancosProps {
  cards: Card[];
  banks: Bank[];
  onAddCard: (card: Omit<Card, "id">) => void;
  onAddBank: (bank: Omit<Bank, "id">) => void;
  onEditBank: (bank: Bank) => void;
  onDeleteBank: (bankId: string) => void;
  onSelectCard?: (cardId: string) => void;
}

export default function CardsBancos({ cards, banks, onAddCard, onAddBank, onEditBank, onDeleteBank, onSelectCard }: CardsBancosProps) {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  // Card Form State
  const [cardName, setCardName] = useState("");
  const [cardBank, setCardBank] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardBestDay, setCardBestDay] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [cardColor, setCardColor] = useState("orange"); // orange, black, slate, green
  const [cardFlag, setCardFlag] = useState<Card["flag"]>("Mastercard");

  // Bank Form State
  const [bankName, setBankName] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankType, setBankType] = useState<Bank["type"]>("Conta Corrente");
  const [bankBalance, setBankBalance] = useState("");

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardLimit) return;

    let bg = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"; // default orange
    if (cardColor === "black") bg = "linear-gradient(135deg, #1f2937 0%, #111827 100%)";
    if (cardColor === "slate") bg = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
    if (cardColor === "green") bg = "linear-gradient(135deg, #059669 0%, #047857 100%)";
    if (cardColor === "purple") bg = "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";

    onAddCard({
      name: cardName,
      bank: cardBank || "Outro",
      limit: parseFloat(cardLimit),
      bestBuyDay: parseInt(cardBestDay) || 10,
      dueDay: parseInt(cardDueDay) || 17,
      color: bg,
      flag: cardFlag,
      usedLimit: 0
    });

    // Reset Form
    setCardName("");
    setCardBank("");
    setCardLimit("");
    setCardBestDay("");
    setCardDueDay("");
    setCardColor("orange");
    setCardFlag("Mastercard");
    setShowCardModal(false);
  };

  const handleEditBankClick = (bank: Bank) => {
    setEditingBank(bank);
    setBankName(bank.name);
    setBankAgency(bank.agency || "");
    setBankAccount(bank.account || "");
    setBankType(bank.type);
    setBankBalance(bank.currentBalance.toString());
    setShowBankModal(true);
  };

  const handleCloseBankModal = () => {
    setBankName("");
    setBankAgency("");
    setBankAccount("");
    setBankType("Conta Corrente");
    setBankBalance("");
    setEditingBank(null);
    setShowBankModal(false);
  };

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName) return;

    if (editingBank) {
      onEditBank({
        ...editingBank,
        name: bankName,
        agency: bankAgency || undefined,
        account: bankAccount || undefined,
        type: bankType,
        currentBalance: parseFloat(bankBalance) || 0
      });
    } else {
      onAddBank({
        name: bankName,
        agency: bankAgency || undefined,
        account: bankAccount || undefined,
        type: bankType,
        currentBalance: parseFloat(bankBalance) || 0
      });
    }

    handleCloseBankModal();
  };

  return (
    <div className="space-y-8" id="wallets-section">
      {/* Meus Cartões */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-secondary" />
            Meus Cartões
          </h2>
          <button
            onClick={() => setShowCardModal(true)}
            className="flex items-center gap-1.5 text-brand-secondary text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo
          </button>
        </div>

        {/* Swipeable Carousel */}
        <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-3 scroll-smooth -mx-2 px-2 snap-x">
          {cards.length === 0 ? (
            <div className="w-full text-center py-8 bg-brand-lowest/30 border border-white/5 rounded-2xl">
              <p className="text-on-surface-variant text-sm">Nenhum cartão cadastrado.</p>
            </div>
          ) : (
            cards.map((card) => {
              const availableLimit = card.limit - card.usedLimit;
              const usedPercentage = Math.min(100, Math.max(0, (card.usedLimit / card.limit) * 100));

              return (
                <div
                  key={card.id}
                  onClick={() => onSelectCard && onSelectCard(card.id)}
                  style={{ background: card.color }}
                  className="min-w-[280px] sm:min-w-[310px] h-[190px] rounded-2xl relative overflow-hidden flex-shrink-0 snap-center p-5 flex flex-col justify-between shadow-2xl border border-white/10 select-none cursor-pointer transform hover:-translate-y-1 hover:brightness-105 active:scale-95 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>

                  <div className="flex justify-between items-start z-10">
                    <div>
                      <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest leading-none mb-1">
                        {card.bank}
                      </p>
                      <h3 className="font-display font-bold text-lg text-white leading-none">
                        {card.name}
                      </h3>
                    </div>
                    <div className="bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1 border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span className="text-[9px] text-white font-bold">{card.flag}</span>
                    </div>
                  </div>

                  <div className="z-10">
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="text-white/70">Limite Usado</span>
                      <span className="text-white font-semibold">
                        R$ {card.usedLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-white h-full transition-all duration-500" style={{ width: `${usedPercentage}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-white/75">Melhor dia compra: <strong className="text-white">{card.bestBuyDay}</strong></span>
                      <span className="text-white/75">Disp: <strong className="text-white">R$ {availableLimit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Bancos */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-secondary" />
            Bancos e Contas
          </h2>
          <button
            onClick={() => setShowBankModal(true)}
            className="flex items-center gap-1.5 text-brand-secondary text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {banks.length === 0 ? (
            <p className="text-on-surface-variant text-sm col-span-2 py-4">Nenhum banco cadastrado.</p>
          ) : (
            banks.map((bank) => {
              const isNegative = bank.currentBalance < 0;

              return (
                <div
                  key={bank.id}
                  onClick={() => handleEditBankClick(bank)}
                  className="glass-card rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-brand-bright transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                      bank.type === "Investimento" 
                        ? "bg-brand-tertiary/15 border-brand-tertiary/20 text-brand-tertiary"
                        : isNegative
                          ? "bg-brand-error/15 border-brand-error/20 text-brand-error"
                          : "bg-brand-secondary/15 border-brand-secondary/20 text-brand-secondary"
                    }`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-white group-hover:text-brand-secondary transition-colors">
                        {bank.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {bank.type} {bank.agency && `• Ag: ${bank.agency}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold text-sm ${isNegative ? "text-brand-error" : "text-brand-secondary"}`}>
                      R$ {bank.currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-on-surface-variant">
                      {isNegative ? "Cheque Especial" : "Saldo disponível"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Card Addition Modal Overlay */}
      {showCardModal && (
        <div className="fixed inset-0 bg-brand-lowest/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-secondary" />
              Novo Cartão
            </h3>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Apelido do Cartão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Credcard Ultra"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Banco Emissor</label>
                  <input
                    type="text"
                    placeholder="Ex: Inter"
                    value={cardBank}
                    onChange={(e) => setCardBank(e.target.value)}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Bandeira</label>
                  <select
                    value={cardFlag}
                    onChange={(e) => setCardFlag(e.target.value as Card["flag"])}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Limite R$ *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 5000"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Melhor Dia Compra</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 12"
                    value={cardBestDay}
                    onChange={(e) => setCardBestDay(e.target.value)}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 19"
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Cor de Destaque</label>
                <div className="flex gap-3 justify-center">
                  {[
                    { value: "orange", label: "Laranja", bg: "bg-orange-500" },
                    { value: "black", label: "Preto", bg: "bg-gray-800" },
                    { value: "slate", label: "Slate", bg: "bg-slate-600" },
                    { value: "green", label: "Verde", bg: "bg-emerald-600" },
                    { value: "purple", label: "Roxo", bg: "bg-violet-600" }
                  ].map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setCardColor(col.value)}
                      className={`w-8 h-8 rounded-full border-2 ${col.bg} ${
                        cardColor === col.value ? "border-white ring-2 ring-brand-secondary" : "border-transparent"
                      }`}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dim font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
              >
                Cadastrar Cartão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bank Addition/Edition Modal Overlay */}
      {showBankModal && (
        <div className="fixed inset-0 bg-brand-lowest/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={handleCloseBankModal}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-secondary" />
              {editingBank ? "Editar Conta Bancária" : "Nova Conta ou Banco"}
            </h3>

            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Banco/Conta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banco Itaú"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Agência</label>
                  <input
                    type="text"
                    placeholder="Ex: 0001"
                    value={bankAgency}
                    onChange={(e) => setBankAgency(e.target.value)}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Conta</label>
                  <input
                    type="text"
                    placeholder="Ex: 12345-6"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tipo de Conta</label>
                <select
                  value={bankType}
                  onChange={(e) => setBankType(e.target.value as Bank["type"])}
                  className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Investimento">Investimento</option>
                  <option value="Caixinha">Caixinha</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Saldo Atual R$ *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 12000"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  className="w-full bg-brand-lowest/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-secondary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dim font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
              >
                {editingBank ? "Salvar Alterações" : "Cadastrar Conta"}
              </button>

              {editingBank && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Tem certeza de que deseja excluir a conta "${editingBank.name}"?`)) {
                      onDeleteBank(editingBank.id);
                      handleCloseBankModal();
                    }
                  }}
                  className="w-full bg-brand-error hover:bg-brand-error/90 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2"
                >
                  Excluir Conta
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

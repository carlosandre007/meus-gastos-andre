import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Plus,
  Search,
  Trash2,
  CreditCard,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart2,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
  Volume2,
  Briefcase,
  Layers,
  ArrowRight,
  Database,
  Sparkles,
  Download,
  Info,
  Bell,
  Target,
  RefreshCw,
  Mail
} from "lucide-react";
import { Card, Bank, Transaction, DailyBalance, Goal, InAppNotification } from "./types";
import { INITIAL_CARDS, INITIAL_BANKS, INITIAL_TRANSACTIONS } from "./data";
import SmartSearch from "./components/SmartSearch";
import CardsBancos from "./components/CardsBancos";
import MetasFinanceiras from "./components/MetasFinanceiras";
import OpenFinanceModule from "./components/OpenFinanceModule";
import NotificationsCenter from "./components/NotificationsCenter";


export default function App() {
  // --- Persistent States ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("g3a_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem("g3a_cards");
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [banks, setBanks] = useState<Bank[]>(() => {
    const saved = localStorage.getItem("g3a_banks");
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("g3a_goals");
    return saved ? JSON.parse(saved) : [
      {
        id: "goal-1",
        title: "Viagem de Férias 2026",
        targetValue: 12000.00,
        currentSaved: 4800.00,
        deadline: "2026-12-15",
        category: "Viagem",
        createdAt: "2026-06-02"
      },
      {
        id: "goal-2",
        title: "Reserva de Emergência",
        targetValue: 25000.00,
        currentSaved: 16200.00,
        deadline: "2026-10-30",
        category: "Reserva de Emergência",
        createdAt: "2026-06-02"
      }
    ];
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem("g3a_notifications");
    return saved ? JSON.parse(saved) : [
      {
        id: "notif-1",
        title: "Conta Próxima ao Vencimento",
        message: "O boleto 'Aluguel Office' no valor de R$ 2.200,00 vence dia 05/06 (em 3 dias). Planeje o saldo de conta para transferência.",
        type: "warning",
        date: "2026-06-02",
        time: "08:15",
        read: false,
      },
      {
        id: "notif-2",
        title: "Atenção: Cartão Próximo ao Limite",
        message: "Seu cartão Carbon Black (C6 Bank) atingiu o limite crítico utilizado de R$ 8.450,20 / R$ 15.000,00.",
        type: "danger",
        date: "2026-06-02",
        time: "10:30",
        read: false,
      },
      {
        id: "notif-3",
        title: "Meta 'Reserva de Emergência' Progredindo!",
        message: "Parabéns! Você alcançou 64% da sua reserva de emergência estabelecida.",
        type: "success",
        date: "2026-06-01",
        time: "17:40",
        read: false,
      }
    ];
  });

  // Save states on change
  useEffect(() => {
    localStorage.setItem("g3a_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("g3a_cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("g3a_banks", JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem("g3a_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("g3a_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // --- Date Range Config ---
  // Default current simulated date is "2026-06-02" to matches the platform prompt context
  const [currentDateSim, setCurrentDateSim] = useState("2026-06-02");
  const [selectedDate, setSelectedDate] = useState("2026-06-02");

  // --- UI State Management ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "wallets" | "transactions" | "cashflow" | "metas" | "openfinance" | "notifications">("dashboard");
  
  // Voice Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceQueryInput, setVoiceQueryInput] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretationError, setInterpretationError] = useState("");
  const [lastLoggedVoiceCommand, setLastLoggedVoiceCommand] = useState<{
    text: string;
    result: any;
    timestamp: string;
  } | null>(null);

  // Manual Transaction addition
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [newTxDesc, setNewTxDesc] = useState("");
  const [newTxLocal, setNewTxLocal] = useState("");
  const [newTxValue, setNewTxValue] = useState("");
  const [newTxType, setNewTxType] = useState<"Despesa" | "Receita">("Despesa");
  const [newTxCategory, setNewTxCategory] = useState<Transaction["category"]>("Alimentação");
  const [newTxPayment, setNewTxPayment] = useState<Transaction["paymentMethod"]>("Pix");
  const [newTxCardId, setNewTxCardId] = useState("");
  const [newTxBankId, setNewTxBankId] = useState("bank-inter");
  const [newTxDate, setNewTxDate] = useState("2026-06-02");

  // Fatura filter detail modal
  const [selectedFaturaCardId, setSelectedFaturaCardId] = useState<string | null>(null);

  // Exporters configuration
  const [exportFilterPeriod, setExportFilterPeriod] = useState<"dia" | "semana" | "mes" | "ano" | "todos">("mes");
  const [exportSuccessMsg, setExportSuccessMsg] = useState("");

  // Speech Recognition state
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "pt-BR";
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListeningSpeech(true);
        setInterpretationError("");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQueryInput(transcript);
        setIsListeningSpeech(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition error:", e);
        setInterpretationError("Não consegui capturar o áudio. Digite abaixo para simular!");
        setIsListeningSpeech(false);
      };

      rec.onend = () => {
        setIsListeningSpeech(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartSpeech = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition already running or other error
        recognitionRef.current.stop();
      }
    }
  };

  // --- Helper to select surrounding 7 calendar days centered around June 2nd, 2026 ---
  const calendarDays = [
    { name: "SEG", number: "31", dateStr: "2026-05-31" },
    { name: "TER", number: "01", dateStr: "2026-06-01" },
    { name: "QUA", number: "02", dateStr: "2026-06-02", tag: "Hoje" },
    { name: "QUI", number: "03", dateStr: "2026-06-03" },
    { name: "SEX", number: "04", dateStr: "2026-06-04" },
    { name: "SÁB", number: "05", dateStr: "2026-06-05" },
    { name: "DOM", number: "06", dateStr: "2026-06-06" },
  ];

  // Get active day statistics
  const getDayTotals = (dateStr: string) => {
    const dayTxs = transactions.filter(t => t.date === dateStr);
    const entrances = dayTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
    const exits = dayTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);
    return { entrances, exits };
  };

  // Compute Balances dynamically
  const bankTotals = banks.reduce((sum, b) => sum + b.currentBalance, 0);
  const totalCardsDebt = cards.reduce((sum, c) => sum + c.usedLimit, 0);

  // Patrimônio Total = Bank Accounts + Savings/Investments - Card Debts
  const patrimonioTotal = bankTotals;

  // Monthly stats (June 2026)
  const monthlyTxs = transactions.filter(t => t.date.startsWith("2026-06"));
  const monthlyEntrances = monthlyTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
  const monthlyExits = monthlyTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);

  // Daily balance calculations for selected day
  const getSelectedDayDetails = () => {
    // Exits and entrances for selected day
    const dayTxs = transactions.filter(t => t.date === selectedDate);
    const dayEntrances = dayTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
    const dayExits = dayTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);

    // Initial Balance on that date: Accumulate all historic balances up to (before) selected date
    // Let's assume a default base of R$ 50.000 representing starting funds on 2026-05-01
    let historicalNet = 50000;
    transactions.forEach(t => {
      if (t.date < selectedDate) {
        if (t.type === "Receita") historicalNet += t.value;
        if (t.type === "Despesa") historicalNet -= t.value;
      }
    });

    const finalBalance = historicalNet + dayEntrances - dayExits;

    return {
      initialBalance: historicalNet,
      entrances: dayEntrances,
      exits: dayExits,
      finalBalance: finalBalance,
      list: dayTxs
    };
  };

  const selectedDayData = getSelectedDayDetails();

  // --- Voice Parser Interpreter ---
  const handleInterpretVoice = async (queryToSubmit?: string) => {
    const rawToSubmit = queryToSubmit || voiceQueryInput;
    if (!rawToSubmit.trim()) {
      setInterpretationError("Por favor, fale ou digite algo para registrar.");
      return;
    }

    setIsInterpreting(true);
    setInterpretationError("");

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: rawToSubmit, currentDate: currentDateSim }),
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o processador de voz Gemini AI.");
      }

      const { result } = await response.json();
      if (!result || typeof result.value === "undefined") {
        throw new Error("Não consegui extrair informações válidas. Tente especificar um valor em reais.");
      }

      // Add to transactions state and update bank/card balances automatically!
      const newId = "tx-" + Date.now();
      const generatedTx: Transaction = {
        id: newId,
        description: result.description || "Lançamento de Voz",
        local: result.local || "",
        value: Number(result.value),
        type: (result.type as "Despesa" | "Receita") || "Despesa",
        paymentMethod: result.paymentMethod || "Pix",
        category: result.category || "Outros",
        date: result.date || currentDateSim,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      // Perform Auto card / bank deduction:
      if (generatedTx.paymentMethod === "Cartão de Crédito") {
        // Find matching card
        const cardMatch = cards.find(c => 
          c.name.toLowerCase().includes((result.cardName || "").toLowerCase()) ||
          c.bank.toLowerCase().includes((result.cardName || "").toLowerCase()) ||
          (result.cardName || "").toLowerCase().includes(c.bank.split(" ")[0].toLowerCase())
        ) || cards[0]; // fallback to first card (e.g. Inter) if specified, or first card in general.

        if (cardMatch) {
          generatedTx.cardId = cardMatch.id;
          // Update card limit
          setCards(prev => prev.map(c => 
            c.id === cardMatch.id ? { ...c, usedLimit: c.usedLimit + generatedTx.value } : c
          ));
        }
      } else {
        // If it's a typical Pix, Dinheiro, or Débito, deduct or add to matching bank account
        const targetBank = banks[0]; // Deduct from standard Inter card account or appropriate
        if (targetBank) {
          generatedTx.bankId = targetBank.id;
          setBanks(prev => prev.map(b => {
            if (b.id === targetBank.id) {
              const delta = generatedTx.type === "Receita" ? generatedTx.value : -generatedTx.value;
              return { ...b, currentBalance: b.currentBalance + delta };
            }
            return b;
          }));
        }
      }

      setTransactions(prev => [generatedTx, ...prev]);
      setLastLoggedVoiceCommand({
        text: rawToSubmit,
        result: generatedTx,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      });

      // Clear input and modal on success
      setVoiceQueryInput("");
      setIsVoiceModalOpen(false);
      
      // Auto redirect to selected day if it matches
      if (generatedTx.date) {
        setSelectedDate(generatedTx.date);
      }
    } catch (e: any) {
      console.error(e);
      setInterpretationError(e.message || "Erro de interpretação. Tente novamente.");
    } finally {
      setIsInterpreting(false);
    }
  };

  // --- Add Transaction Manually ---
  const handleManualAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxDesc || !newTxValue) return;

    const val = parseFloat(newTxValue);
    const newId = "tx-" + Date.now();
    const newTx: Transaction = {
      id: newId,
      description: newTxDesc,
      local: newTxLocal || undefined,
      value: val,
      type: newTxType,
      category: newTxCategory,
      paymentMethod: newTxPayment,
      date: newTxDate,
      time: "12:00"
    };

    if (newTxType === "Despesa" && newTxPayment === "Cartão de Crédito") {
      newTx.cardId = newTxCardId || cards[0]?.id;
      if (newTx.cardId) {
        setCards(prev => prev.map(c => 
          c.id === newTx.cardId ? { ...c, usedLimit: c.usedLimit + val } : c
        ));
      }
    } else {
      newTx.bankId = newTxBankId;
      setBanks(prev => prev.map(b => {
        if (b.id === newTxBankId) {
          const delta = newTxType === "Receita" ? val : -val;
          return { ...b, currentBalance: b.currentBalance + delta };
        }
        return b;
      }));
    }

    setTransactions(prev => [newTx, ...prev]);

    // reset fields
    setNewTxDesc("");
    setNewTxLocal("");
    setNewTxValue("");
    setShowAddTransactionModal(false);
  };

  // Delete transaction safely
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Rollback limits and balances
    if (target.type === "Despesa" && target.paymentMethod === "Cartão de Crédito" && target.cardId) {
      setCards(prev => prev.map(c => 
        c.id === target.cardId ? { ...c, usedLimit: Math.max(0, c.usedLimit - target.value) } : c
      ));
    } else if (target.bankId) {
      setBanks(prev => prev.map(b => {
        if (b.id === target.bankId) {
          const delta = target.type === "Receita" ? -target.value : target.value;
          return { ...b, currentBalance: b.currentBalance + delta };
        }
        return b;
      }));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Financial Goals Handlers ---
  const handleAddGoal = (newGoal: Omit<Goal, "id" | "createdAt">) => {
    const id = "goal-" + Date.now();
    const createdAt = "2026-06-02";
    setGoals(prev => [...prev, { ...newGoal, id, createdAt }]);

    const notifId = "notif-" + Date.now();
    const newNotif: InAppNotification = {
      id: notifId,
      title: "Nova Meta Criada! 🎯",
      message: `Você iniciou o objetivo "${newGoal.title}" com alvo em R$ ${newGoal.targetValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
      type: "info",
      date: "2026-06-02",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleUpdateGoalProgress = (goalId: string, amount: number, bankId?: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextVal = g.currentSaved + amount;
        
        if (nextVal >= g.targetValue && g.currentSaved < g.targetValue) {
          const notifId = "notif-" + Date.now();
          const newNotif: InAppNotification = {
            id: notifId,
            title: "Meta Financeira Alcançada! 🎉",
            message: `Vitória! A meta "${g.title}" de R$ ${g.targetValue.toLocaleString("pt-BR")} está 100% concluída!`,
            type: "success",
            date: "2026-06-02",
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            read: false
          };
          setNotifications(prevnot => [newNotif, ...prevnot]);
        }
        return { ...g, currentSaved: Math.min(g.targetValue, nextVal) };
      }
      return g;
    }));

    if (bankId) {
      setBanks(prev => prev.map(b => {
        if (b.id === bankId) {
          return { ...b, currentBalance: Math.max(0, b.currentBalance - amount) };
        }
        return b;
      }));

      const targetGoal = goals.find(g => g.id === goalId);
      const newTxId = "tx-" + Date.now();
      const newTx: Transaction = {
        id: newTxId,
        description: `Poupança: ${targetGoal?.title || "Meta"}`,
        local: "Cofrinho 3A",
        value: amount,
        type: "Despesa",
        category: "Investimento",
        paymentMethod: "Pix",
        bankId: bankId,
        date: "2026-06-02",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  // --- Open Finance Ingestion Handler ---
  const handleAddOpenFinanceTransactions = (newTxs: Omit<Transaction, "id" | "time">[]) => {
    const formattedTxs: Transaction[] = newTxs.map((t, idx) => ({
      ...t,
      id: `tx-of-${Date.now()}-${idx}`,
      time: "09:00"
    }));

    formattedTxs.forEach(tx => {
      if (tx.type === "Despesa" && tx.paymentMethod === "Cartão de Crédito" && tx.cardId) {
        setCards(prev => prev.map(c => 
          c.id === tx.cardId ? { ...c, usedLimit: c.usedLimit + tx.value } : c
        ));
      } else if (tx.bankId) {
        setBanks(prev => prev.map(b => {
          if (b.id === tx.bankId) {
            const delta = tx.type === "Receita" ? tx.value : -tx.value;
            return { ...b, currentBalance: b.currentBalance + delta };
          }
          return b;
        }));
      }
    });

    setTransactions(prev => [...formattedTxs, ...prev]);

    const notifId = "notif-" + Date.now();
    const newNotif: InAppNotification = {
      id: notifId,
      title: "Sincronização Open Finance Concluída",
      message: `Recebemos ${formattedTxs.length} lançamentos automaticamente. Seus cartões e saldos foram reconciliados.`,
      type: "success",
      date: "2026-06-02",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- Notifications Admin Handlers ---
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // --- Dynamic Cash Flow Reporting Matrices ---
  const getCashFlowMatrix = () => {
    // Selected day calculations (Daily)
    const dailyTxs = transactions.filter(t => t.date === selectedDate);
    const dailyInc = dailyTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
    const dailyExp = dailyTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);

    // Selected week calculations
    // Sum for the entire current range we display "2026-05-31" to "2026-06-06"
    const weeklyTxs = transactions.filter(t => t.date >= "2026-05-31" && t.date <= "2026-06-06");
    const weeklyInc = weeklyTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
    const weeklyExp = weeklyTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);

    // Monthly calculations (June 2026)
    const monthlyInc = monthlyEntrances;
    const monthlyExp = monthlyExits;

    // Annual calculations (all 2026 dates)
    const annualTxs = transactions.filter(t => t.date.startsWith("2026"));
    const annualInc = annualTxs.filter(t => t.type === "Receita").reduce((sum, t) => sum + t.value, 0);
    const annualExp = annualTxs.filter(t => t.type === "Despesa").reduce((sum, t) => sum + t.value, 0);

    return {
      diario: { inc: dailyInc, exp: dailyExp },
      semanal: { inc: weeklyInc, exp: weeklyExp },
      mensal: { inc: monthlyInc, exp: monthlyExp },
      anual: { inc: annualInc, exp: annualExp }
    };
  };

  const cashFlowMatrix = getCashFlowMatrix();

  // --- Exporters for CSV and Excel (TSV format) ---
  const handleExportData = (type: "csv" | "excel") => {
    // Select correct transactions based on filter
    let filtered = [...transactions];
    if (exportFilterPeriod === "dia") {
      filtered = transactions.filter(t => t.date === selectedDate);
    } else if (exportFilterPeriod === "semana") {
      filtered = transactions.filter(t => t.date >= "2026-05-31" && t.date <= "2026-06-06");
    } else if (exportFilterPeriod === "mes") {
      filtered = transactions.filter(t => t.date.startsWith("2026-06"));
    } else if (exportFilterPeriod === "ano") {
      filtered = transactions.filter(t => t.date.startsWith("2026"));
    }

    if (filtered.length === 0) {
      setExportSuccessMsg("Nenhuma transação encontrada no período para exportar.");
      setTimeout(() => setExportSuccessMsg(""), 3000);
      return;
    }

    let content = "";
    let filename = "";

    if (type === "csv") {
      // CSV Build
      content = "Data,Descricao,Local,Tipo,Categoria,Forma_Pagamento,Valor\r\n";
      filtered.forEach(t => {
        content += `"${t.date}","${t.description.replace(/"/g, '""')}","${(t.local || "").replace(/"/g, '""')}","${t.type}","${t.category}","${t.paymentMethod}",${t.value}\r\n`;
      });
      filename = `relatorio_financeiro_${exportFilterPeriod}_${Date.now()}.csv`;
    } else {
      // Excel compatible Tab-Separated Value
      content = "Data\tDescrição\tLocal\tTipo\tCategoria\tForma de Pagamento\tValor (R$)\r\n";
      filtered.forEach(t => {
        content += `${t.date}\t${t.description}\t${t.local || ""}\t${t.type}\t${t.category}\t${t.paymentMethod}\t${t.value.toFixed(2)}\r\n`;
      });
      filename = `relatorio_financeiro_${exportFilterPeriod}_${Date.now()}.xls`;
    }

    // Direct Browser Download Action
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccessMsg(`Sucesso! Arquivo enviado para download.`);
    setTimeout(() => setExportSuccessMsg(""), 4000);
  };

  // Simulated PDF preview generation
  const handlePrintPDF = () => {
    window.print();
  };

  const handleResetAllData = () => {
    if (window.confirm("Deseja realmente limpar todos os dados locais e começar do zero com saldos zerados?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const [backupStatus, setBackupStatus] = useState("");

  const handleSaveBackup = async () => {
    setBackupStatus("Salvando backup local...");
    try {
      const payload = {
        transactions,
        cards,
        banks,
        goals,
        notifications
      };
      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Erro ao salvar backup");
      setBackupStatus("Backup salvo com sucesso no arquivo backup.json!");
      setTimeout(() => setBackupStatus(""), 4000);
    } catch (e: any) {
      setBackupStatus("Erro: " + e.message);
      setTimeout(() => setBackupStatus(""), 4000);
    }
  };

  const handleRestoreBackup = async () => {
    setBackupStatus("Restaurando backup local...");
    try {
      const response = await fetch("/api/backup");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Nenhum arquivo backup.json encontrado.");
        }
        throw new Error("Erro ao obter backup");
      }
      const data = await response.json();
      if (data.transactions) setTransactions(data.transactions);
      if (data.cards) setCards(data.cards);
      if (data.banks) setBanks(data.banks);
      if (data.goals) setGoals(data.goals);
      if (data.notifications) setNotifications(data.notifications);

      setBackupStatus("Backup local restaurado com sucesso!");
      setTimeout(() => setBackupStatus(""), 4000);
    } catch (e: any) {
      setBackupStatus("Erro: " + e.message);
      setTimeout(() => setBackupStatus(""), 4000);
    }
  };

  const handleTestEmailBackup = async () => {
    setBackupStatus("Enviando backup por email...");
    try {
      const response = await fetch("/api/backup/email", {
        method: "POST"
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.error || "Erro ao enviar email");
      setBackupStatus("Backup de teste enviado para aandreandre@hotmail.com!");
      setTimeout(() => setBackupStatus(""), 5000);
    } catch (e: any) {
      setBackupStatus("Erro: " + e.message);
      setTimeout(() => setBackupStatus(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] pb-24 flex flex-col">
      {/* HEADER INTEGRADO SISTEMA GRUPO 3A */}
      <header className="app-header bg-white border-b border-[#E5E7EB] height-[64px] flex items-center justify-between px-6 flex-shrink-0">
        <div className="header-logo font-bold text-xl text-[#111827] flex items-center tracking-tight">
          Grupo 3A <span className="text-[#10B981] ml-1.5 font-semibold text-sm tracking-wider uppercase bg-[#10B981]/10 px-2.5 py-1 rounded-full">FINANCE</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Backup Status Indicator */}
          {backupStatus && (
            <span className="text-[10px] bg-brand-secondary/15 text-brand-secondary px-2.5 py-1 rounded-lg font-bold animate-pulse">
              {backupStatus}
            </span>
          )}

          {/* Save Backup Button */}
          <button
            onClick={handleSaveBackup}
            className="p-2 text-gray-400 hover:text-emerald-500 transition-all rounded-lg hover:bg-gray-50 cursor-pointer"
            title="Salvar Backup no Arquivo Local (backup.json)"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Restore Backup Button */}
          <button
            onClick={handleRestoreBackup}
            className="p-2 text-gray-400 hover:text-indigo-500 transition-all rounded-lg hover:bg-gray-50 cursor-pointer"
            title="Restaurar Backup do Arquivo Local (backup.json)"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Email Backup Test Button */}
          <button
            onClick={handleTestEmailBackup}
            className="p-2 text-gray-400 hover:text-blue-500 transition-all rounded-lg hover:bg-gray-50 cursor-pointer"
            title="Testar Envio de Backup por E-mail (aandreandre@hotmail.com)"
          >
            <Mail className="w-5 h-5" />
          </button>

          {/* Reset Local Storage Button */}
          <button
            onClick={handleResetAllData}
            className="p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-gray-50 cursor-pointer"
            title="Limpar todos os dados locais (Começar do Zero)"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Interactive Notifications Trigger */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-all rounded-lg hover:bg-gray-50 cursor-pointer"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-[#10B981] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-1 ring-white">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Patrimônio Geral</span>
            <span className="font-mono font-bold text-[#111827] tracking-tight">
              R$ {patrimonioTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center font-bold text-[#10B981] text-xs">
            3A
          </div>
        </div>
      </header>

      {/* HORIZONTAL CALENDÁRIO FINANCEIRO INTELIGENTE STRIP */}
      <section className="bg-white border-b border-[#E5E7EB] py-3 px-6 overflow-hidden flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">Centro de Controle Financeiro</span>
            <h2 className="text-sm font-semibold text-gray-500">Selecione uma data para inspecionar e registrar receitas ou despesas</h2>
          </div>
          
          {/* Day Stripe Carousel */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
            {calendarDays.map((day) => {
              const active = selectedDate === day.dateStr;
              const totals = getDayTotals(day.dateStr);
              const hasIncome = totals.entrances > 0;
              const hasExpense = totals.exits > 0;

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex-shrink-0 w-24 p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    active
                      ? "border-[#10B981] bg-[#10B981]/5 ring-1 ring-[#10B981] shadow-sm transform scale-105"
                      : "border-[#E5E7EB] bg-white hover:border-gray-400"
                  }`}
                >
                  <span className={`text-[10px] font-bold ${active ? "text-[#10B981]" : "text-gray-400"}`}>
                    {day.name} {day.tag && <span className="text-[9px] bg-[#10B981]/15 text-[#10B981] px-1 rounded-sm ml-0.5">{day.tag}</span>}
                  </span>
                  <span className="text-lg font-extrabold tracking-tight mt-0.5">{day.number}</span>
                  
                  {/* Financial Mini sums */}
                  <div className="w-full h-px bg-gray-100 my-1"></div>
                  
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className={`text-[9px] font-mono leading-none ${totals.entrances > 0 ? "text-[#10B981] font-semibold" : "text-gray-300"}`}>
                      {totals.entrances > 0 ? `+${totals.entrances.toFixed(0)}` : "--"}
                    </span>
                    <span className={`text-[9px] font-mono leading-none ${totals.exits > 0 ? "text-red-500 font-semibold" : "text-gray-300"}`}>
                      {totals.exits > 0 ? `-${totals.exits.toFixed(0)}` : "--"}
                    </span>
                  </div>

                  {/* Dot Event Indicator */}
                  <div className="flex gap-1 mt-1">
                    {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>}
                    {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT (Bento Grid Style for Geometric Balance) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs (Dashboard vs Wallets vs Transactions History vs Goals vs Open Finance vs Notifications) */}
        <div className="lg:col-span-12 flex flex-wrap bg-white p-1 rounded-xl border border-[#E5E7EB] gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Painel Geral
          </button>
          
          <button
            onClick={() => setActiveTab("wallets")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "wallets"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <WalletIcon className="w-3.5 h-3.5" />
            Carteiras
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "transactions"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Histórico ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab("cashflow")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "cashflow"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Fluxo
          </button>

          <button
            onClick={() => setActiveTab("metas")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "metas"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-900 bg-transparent"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#10B981]" />
            Metas ({goals.length})
          </button>

          <button
            onClick={() => setActiveTab("openfinance")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "openfinance"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-950 bg-transparent"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Open Finance
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-grow sm:flex-1 flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-[11.5px] font-bold tracking-wide uppercase transition-all cursor-pointer relative ${
              activeTab === "notifications"
                ? "bg-[#111827] text-white shadow"
                : "text-gray-500 hover:text-gray-950 bg-transparent"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alertas
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ml-0.5 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* ==================== TAB: PAINEL GERAL (DASHBOARD) ==================== */}
        {activeTab === "dashboard" && (
          <>
            {/* Left Side: Dynamic Balances & Custom Interactive Charts */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Core Indicators Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Saldo em Contas</span>
                  <p className="font-mono text-xl font-bold tracking-tight text-[#111827] mt-1">
                    R$ {bankTotals.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[9px] text-[#10B981] font-semibold mt-1 block">Líquido em bancos</span>
                </div>

                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Entradas Mês (Jun)</span>
                  <p className="font-mono text-xl font-bold tracking-tight text-[#10B981] mt-1">
                    +R$ {monthlyEntrances.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#10B981] h-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Despesas Mês</span>
                  <p className="font-mono text-xl font-bold tracking-tight text-red-500 mt-1">
                    -R$ {monthlyExits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: "35%" }}></div>
                  </div>
                </div>

                <div className="bg-white border border-l-4 border-l-[#10B981] border-[#E5E7EB] p-4 rounded-xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Patrimônio Total</span>
                  <p className="font-mono text-xl font-bold tracking-tight text-[#111827] mt-1">
                    R$ {patrimonioTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[9px] text-[#10B981] font-semibold mt-1 block">Ativos Livres</span>
                </div>
              </div>

              {/* DYNAMIC SALDO DIÁRIO (SELECTED DAY REPORT) */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Saldo Diário Inteligente</span>
                    <h3 className="font-display font-semibold text-sm">Resumo do dia: <strong className="text-[#111827]">{selectedDate}</strong></h3>
                  </div>
                  <span className="text-xs bg-[#10B981]/15 text-[#10B981] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Fechado</span>
                </div>

                {/* Day Summary Rows */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-center">
                  <div className="p-2 border border-gray-50 bg-[#F9FAFB] rounded-lg">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Saldo Inicial</p>
                    <p className="font-mono font-bold text-sm mt-0.5 text-gray-600">
                      R$ {selectedDayData.initialBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 border border-emerald-100 bg-[#10B981]/5 rounded-lg">
                    <p className="text-[10px] font-semibold text-[#10B981] uppercase">Entradas</p>
                    <p className="font-mono font-bold text-sm mt-0.5 text-[#10B981]">
                      +R$ {selectedDayData.entrances.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 border border-red-100 bg-red-50 rounded-lg">
                    <p className="text-[10px] font-semibold text-red-500 uppercase">Saídas</p>
                    <p className="font-mono font-bold text-sm mt-0.5 text-red-500">
                      -R$ {selectedDayData.exits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 border border-neutral-100 bg-neutral-900 text-white rounded-lg">
                    <p className="text-[10px] font-semibold text-gray-300 uppercase">Saldo Final</p>
                    <p className="font-mono font-bold text-sm mt-0.5 text-[#10B981]">
                      R$ {selectedDayData.finalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Selected Day Transactions inside of stripe */}
                <div className="mt-2 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Lançamentos deste dia ({selectedDayData.list.length})</h4>
                  {selectedDayData.list.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-xs text-gray-400">Nenhuma transação cadastrada nesta data. Use o assistente de voz ou formulário para adicionar!</p>
                    </div>
                  ) : (
                    selectedDayData.list.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            tx.type === "Receita" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-red-500/15 text-red-500"
                          }`}>
                            {tx.category.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                            <span className="text-[10px] text-gray-400">
                              {tx.category} {tx.local && `• ${tx.local}`} • {tx.paymentMethod}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-semibold text-xs ${tx.type === "Receita" ? "text-[#10B981]" : "text-red-500"}`}>
                            {tx.type === "Receita" ? "+" : "-"}R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded"
                            title="Deletar Lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* INTEGRATED NATURAL SEARCH ASSISTANT */}
              <SmartSearch transactions={transactions} cards={cards} banks={banks} />

              {/* INTERACTIVE GRAPHS SUB-CONTAINER */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Relatórios & Evoluções</span>
                    <h3 className="font-display font-semibold text-base mb-1">Gráficos de Saúde Financeira</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Consolidado 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SVG Chart 1 - Receitas x Despesas */}
                  <div className="border border-gray-100 p-4 rounded-xl bg-gray-50 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Fluxo Mensal: Entradas vs Saídas</span>
                    
                    {/* SVG graphic mock bars */}
                    <div className="h-40 flex items-end justify-around gap-2 px-4 relative pt-6 bg-white rounded-lg border border-gray-100">
                      <div className="flex flex-col items-center group relative flex-1 max-w-[50px]">
                        <span className="text-[9px] text-[#10B981] font-mono leading-none font-bold mb-1">R$ 5.3k</span>
                        <div className="w-full bg-[#10B981] opacity-40 hover:opacity-100 h-28 rounded-t-sm transition-all"></div>
                        <span className="text-[9px] text-gray-400 text-center mt-2 uppercase font-semibold">Entradas</span>
                      </div>
                      
                      <div className="flex flex-col items-center group relative flex-1 max-w-[50px]">
                        <span className="text-[9px] text-red-500 font-mono leading-none font-bold mb-1">R$ 4.1k</span>
                        <div className="w-full bg-red-500 opacity-40 hover:opacity-100 h-20 rounded-t-sm transition-all"></div>
                        <span className="text-[9px] text-gray-400 text-center mt-2 uppercase font-semibold">Saídas</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart 2 - Gastos por Categoria */}
                  <div className="border border-gray-100 p-4 rounded-xl bg-gray-50 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Porcentagem por Categoria Recorrente</span>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-100">
                      {/* SVG Circle Graph representation */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" fill="none" r="16" stroke="#f3f4f6" strokeWidth="4"></circle>
                          <circle cx="18" cy="18" fill="none" r="16" stroke="#10B981" strokeWidth="4" strokeDasharray="50, 100" strokeLinecap="round"></circle>
                          <circle cx="18" cy="18" fill="none" r="16" stroke="#f59e0b" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-50" strokeLinecap="round"></circle>
                          <circle cx="18" cy="18" fill="none" r="16" stroke="#ef4444" strokeWidth="4" strokeDasharray="20, 100" strokeDashoffset="-80" strokeLinecap="round"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] text-gray-400 uppercase leading-none font-bold">Total</span>
                          <span className="font-mono text-xs font-bold mt-0.5">R$ 4.1k</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <ul className="flex-1 space-y-1.5 text-[10px]">
                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Alimentação (50%)
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Combustível (30%)
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span> Outros (20%)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Column: Faturas de Cartões & Banco list previews */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Próximas Faturas de Cartões */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#10B981]" />
                    Próximas Faturas
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Controle Próximo</span>
                </div>

                <div className="space-y-2.5">
                  {cards.map((card) => {
                    const activeInvoiceTxSum = transactions
                      .filter(t => t.paymentMethod === "Cartão de Crédito" && t.cardId === card.id)
                      .reduce((sum, t) => sum + t.value, 0);

                    // Add simulation offset for demo data
                    const invoiceTotal = card.usedLimit;

                    return (
                      <div
                        key={card.id}
                        onClick={() => setSelectedFaturaCardId(card.id)}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#10B981] bg-[#F9FAFB] hover:bg-white cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-10 bg-[#111827] rounded-sm" style={{ background: card.color }}></div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{card.name}</p>
                            <p className="text-[10px] text-gray-400">Vence dia {card.dueDay}/06</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-red-500">
                            R$ {invoiceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-gray-400 block font-semibold hover:underline">Ver itens</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-[9px] text-gray-400 text-center mt-3">Clique em qualquer fatura acima para abrir todos os lançamentos em detalhes automáticos.</p>
              </div>

              {/* Painel de Metas Financeiras Ativas on Dashboard sidebar */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#10B981]" />
                    Progresso de Metas
                  </h3>
                  <button
                    onClick={() => setActiveTab("metas")}
                    className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    Gerenciar
                  </button>
                </div>

                {goals.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Nenhuma meta criada. Comece já a economizar!</p>
                ) : (
                  <div className="space-y-4">
                    {goals.slice(0, 2).map((goal) => {
                      const pct = Math.min(100, Math.round((goal.currentSaved / goal.targetValue) * 100));
                      const targetDate = new Date(goal.deadline);
                      const daysLeft = Math.max(1, Math.ceil((targetDate.getTime() - new Date("2026-06-02").getTime()) / (1000 * 3600 * 24)));
                      const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30.4));
                      const perMonth = Math.max(0, (goal.targetValue - goal.currentSaved) / monthsLeft);

                      return (
                        <div key={goal.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-800">
                            <span className="truncate max-w-[150px]">{goal.title}</span>
                            <span className="font-mono text-[11px] text-gray-500">
                              R$ {goal.currentSaved.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / {goal.targetValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#10B981] h-full" style={{ width: `${pct}%` }}></div>
                          </div>

                          <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                            <span>Progresso: {pct}%</span>
                            {pct < 100 ? (
                              <span>Poupe ~R$ {perMonth.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês</span>
                            ) : (
                              <span className="text-[#10B981] font-bold">Concluída! 🎉</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Action Manual Buttons */}
              <button
                onClick={() => setShowAddTransactionModal(true)}
                className="w-full bg-[#111827] hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm transform active:scale-95 tracking-wider uppercase cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#10B981]" />
                Registrar Manualmente
              </button>

              {/* Auto Integration Notice */}
              <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl text-xs text-gray-500 space-y-2">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">Lançamento de Voz Inteligente</span>
                </div>
                <p className="leading-relaxed">
                  Utilize o botão flutuante para falar ou digitar livremente! O sistema Grupo 3A utiliza Inteligência Artificial integrada para automatizar os cartões, limites e fluxos em tempo real.
                </p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100 text-[10px] font-mono whitespace-nowrap overflow-x-auto text-gray-400">
                  Ex: "Mercado 380 reais no cartão Inter"
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB: MEUS CARTÕES & BANCOS ==================== */}
        {activeTab === "wallets" && (
          <div className="lg:col-span-12">
            <CardsBancos
              cards={cards}
              banks={banks}
              onAddCard={(c) => {
                const newId = "card-" + Date.now();
                setCards(prev => [...prev, { ...c, id: newId }]);
              }}
              onAddBank={(b) => {
                const newId = "bank-" + Date.now();
                setBanks(prev => [...prev, { ...b, id: newId }]);
              }}
              onEditBank={(updatedBank) => {
                setBanks(prev => prev.map(b => b.id === updatedBank.id ? updatedBank : b));
              }}
              onDeleteBank={(bankId) => {
                setBanks(prev => prev.filter(b => b.id !== bankId));
              }}
              onSelectCard={(cardId) => {
                setSelectedFaturaCardId(cardId);
              }}
            />
          </div>
        )}

        {/* ==================== TAB: HISTÓRICO DE LANÇAMENTOS ==================== */}
        {activeTab === "transactions" && (
          <div className="lg:col-span-12 space-y-4">
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-base">Histórico Financeiro Completo</h3>
                  <p className="text-xs text-gray-400">Lista cronológica de todos os lançamentos para o Grupo 3A.</p>
                </div>
                
                <button
                  onClick={() => {
                    if (window.confirm("Deseja realmente limpar todos os lançamentos e retornar aos dados iniciais?")) {
                      localStorage.removeItem("g3a_transactions");
                      localStorage.removeItem("g3a_cards");
                      localStorage.removeItem("g3a_banks");
                      setTransactions(INITIAL_TRANSACTIONS);
                      setCards(INITIAL_CARDS);
                      setBanks(INITIAL_BANKS);
                    }
                  }}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Restaurar dados de demonstração
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">Nenhuma transação encontrada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase text-gray-400 font-semibold">
                        <th className="py-3 px-2">Data</th>
                        <th className="py-3 px-2">Descrição</th>
                        <th className="py-3 px-2">Local</th>
                        <th className="py-3 px-2">Categoria</th>
                        <th className="py-3 px-2">Pagamento</th>
                        <th className="py-3 px-2 text-right">Valor</th>
                        <th className="py-3 px-2">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="py-3 px-2 font-mono text-gray-500">{tx.date}</td>
                          <td className="py-3 px-2 font-semibold text-[#111827]">{tx.description}</td>
                          <td className="py-3 px-2 text-gray-500">{tx.local || "N/A"}</td>
                          <td className="py-3 px-2">
                            <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded font-medium">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-500">
                            {tx.paymentMethod} {tx.cardId && `(${cards.find(c => c.id === tx.cardId)?.name})`}
                          </td>
                          <td className={`py-3 px-2 text-right font-mono font-semibold ${
                            tx.type === "Receita" ? "text-[#10B981]" : "text-red-500"
                          }`}>
                            {tx.type === "Receita" ? "+" : "-"}R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Excluir Lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: FLUXO DE CAIXA E EXPORTADORES ==================== */}
        {activeTab === "cashflow" && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-xs">
              <div className="border-b border-gray-100 pb-4 mb-4">
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Matriz de Caixa do Grupo 3A</span>
                <h3 className="font-display font-semibold text-base">Fluxo de Caixa Consolidado Diário / Semanal / Mensal / Anual</h3>
              </div>

              {/* Dynamic Matrices Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fluxo Diário ({selectedDate})</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-[#10B981]">Entradas</span><span className="font-mono font-semibold text-[#10B981]">+R$ {cashFlowMatrix.diario.inc.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-red-500">Saídas</span><span className="font-mono font-semibold text-red-500">-R$ {cashFlowMatrix.diario.exp.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-xs font-bold"><span>Saldo Líquido</span><span>R$ {(cashFlowMatrix.diario.inc - cashFlowMatrix.diario.exp).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fluxo Semanal (Esta Semana)</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-[#10B981]">Entradas</span><span className="font-mono font-semibold text-[#10B981]">+R$ {cashFlowMatrix.semanal.inc.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-red-500">Saídas</span><span className="font-mono font-semibold text-red-500">-R$ {cashFlowMatrix.semanal.exp.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-xs font-bold"><span>Saldo Líquido</span><span>R$ {(cashFlowMatrix.semanal.inc - cashFlowMatrix.semanal.exp).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fluxo Mensal (Junho)</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-[#10B981]">Entradas</span><span className="font-mono font-semibold text-[#10B981]">+R$ {cashFlowMatrix.mensal.inc.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-red-500">Saídas</span><span className="font-mono font-semibold text-red-500">-R$ {cashFlowMatrix.mensal.exp.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-xs font-bold"><span>Saldo Líquido</span><span>R$ {(cashFlowMatrix.mensal.inc - cashFlowMatrix.mensal.exp).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fluxo Anual (2026)</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-[#10B981]">Entradas</span><span className="font-mono font-semibold text-[#10B981]">+R$ {cashFlowMatrix.anual.inc.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-red-500">Saídas</span><span className="font-mono font-semibold text-red-500">-R$ {cashFlowMatrix.anual.exp.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-xs font-bold"><span>Saldo Líquido</span><span>R$ {(cashFlowMatrix.anual.inc - cashFlowMatrix.anual.exp).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* DOWNLOAD REPORT GENERATORS */}
              <div className="border-t border-gray-100 pt-5 text-left">
                <h4 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#10B981]" />
                  Gerador e Exportador de Relatórios Financeiros
                </h4>
                <p className="text-xs text-gray-500 mb-4">Selecione o filtro de data abaixo para obter o seu relatório de transações do Grupo 3A em múltiplos formatos profissionais:</p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Período para Exportação</label>
                    <select
                      value={exportFilterPeriod}
                      onChange={(e) => setExportFilterPeriod(e.target.value as any)}
                      className="border border-gray-200 font-sans text-xs bg-white rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                      <option value="dia">Apenas dia selecionado ({selectedDate})</option>
                      <option value="semana">Apenas esta semana (31/05 a 06/06)</option>
                      <option value="mes">Junho 2026 (Mês Atual)</option>
                      <option value="ano">Ano 2026</option>
                      <option value="todos">Todas as Transações</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleExportData("csv")}
                    className="flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-black border border-[#E5E7EB] hover:border-gray-300 py-3 rounded-xl transition-all font-semibold text-xs text-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                    Exportar Relatório CSV
                  </button>

                  <button
                    onClick={() => handleExportData("excel")}
                    className="flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-black border border-[#E5E7EB] hover:border-gray-300 py-3 rounded-xl transition-all font-semibold text-xs text-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Exportar Relatório Excel (XLS)
                  </button>

                  <button
                    onClick={handlePrintPDF}
                    className="flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-black border border-[#E5E7EB] hover:border-gray-300 py-3 rounded-xl transition-all font-semibold text-xs text-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    Imprimir Extrato / Gerar PDF
                  </button>
                </div>

                {exportSuccessMsg && (
                  <div className="mt-4 p-3.5 bg-brand-secondary/10 border border-brand-secondary/30 rounded-xl text-xs text-brand-secondary text-center font-semibold animate-pulse">
                    {exportSuccessMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: METAS FINANCEIRAS ==================== */}
        {activeTab === "metas" && (
          <div className="lg:col-span-12">
            <MetasFinanceiras
              goals={goals}
              banks={banks}
              onAddGoal={handleAddGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        )}

        {/* ==================== TAB: OPEN FINANCE ==================== */}
        {activeTab === "openfinance" && (
          <div className="lg:col-span-12">
            <OpenFinanceModule
              banks={banks}
              cards={cards}
              onAddTransactions={handleAddOpenFinanceTransactions}
            />
          </div>
        )}

        {/* ==================== TAB: NOTIFICATIONS CENTER ==================== */}
        {activeTab === "notifications" && (
          <div className="lg:col-span-12">
            <NotificationsCenter
              cards={cards}
              goals={goals}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
            />
          </div>
        )}
      </main>

      {/* FIXED FLOATING ACTION BUTTON: VOICE INTERFACE */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="group relative flex items-center gap-2 bg-[#111827] text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 hover:bg-gray-800 transition-all border border-[#10B981]/40"
          title="Falar Lançamento"
        >
          <div className="absolute inset-0 rounded-full border-2 border-[#10B981]/25 pulse-emerald"></div>
          <Mic className="w-4 h-4 text-[#10B981] group-hover:animate-bounce" />
          <span className="text-xs font-bold tracking-wider uppercase">Falar Lançamento</span>
        </button>
      </div>

      {/* IMMERSIVE VOICE ASSISTANT MODAL COVER */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
            <button
              onClick={() => setIsVoiceModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#111827]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AI Branded Title */}
            <div className="text-center mb-6 space-y-1">
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest block">Inteligência Artificial Grupo 3A</span>
              <h3 className="font-display font-extrabold text-[#111827] text-lg">"Fale o valor e a categoria"</h3>
              <p className="text-xs text-gray-500">Ex: "Mercado Atacadão 380 reais no cartão Inter"</p>
            </div>

            {/* Simulated Animated Waveform representing visual speaking */}
            <div className="flex items-center justify-center gap-1.5 h-20 mb-6 px-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className={`w-1.5 bg-[#10B981] rounded-full transition-all ${isListeningSpeech ? "animate-bounce h-14" : "h-6 opacity-30"}`}></div>
              <div className={`w-1.5 bg-[#10B981] rounded-full transition-all ${isListeningSpeech ? "animate-bounce h-16 delay-100" : "h-10 opacity-30"}`}></div>
              <div className={`w-1.5 bg-[#10B981] rounded-full transition-all ${isListeningSpeech ? "animate-bounce h-12 delay-200" : "h-4 opacity-30"}`}></div>
              <div className={`w-1.5 bg-[#10B981] rounded-full transition-all ${isListeningSpeech ? "animate-bounce h-18 delay-300" : "h-8 opacity-30"}`}></div>
              <div className={`w-1.5 bg-[#10B981] rounded-full transition-all ${isListeningSpeech ? "animate-bounce h-10 delay-400" : "h-3 opacity-30"}`}></div>
            </div>

            {/* Speech Recording Button */}
            {speechSupported ? (
              <div className="flex flex-col items-center justify-center gap-2 mb-4">
                <button
                  onClick={handleStartSpeech}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
                    isListeningSpeech ? "bg-red-500 animate-ping" : "bg-[#10B981] hover:bg-[#10B981]/90"
                  } transition-all`}
                  title={isListeningSpeech ? "Gravando áudio... toque para parar" : "Tocar para gravar"}
                >
                  <Mic className="w-7 h-7" />
                </button>
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {isListeningSpeech ? "Ouvindo... Fale agora" : "Toque no microfone para falar em português"}
                </span>
              </div>
            ) : (
              <div className="text-center p-3 bg-gray-50 rounded-lg text-xs text-gray-500 mb-4 flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                O seu navegador não possui suporte ao gravador nativo. Digite a simulação de áudio no campo abaixo!
              </div>
            )}

            {/* Text Typing Simulate Area */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-gray-400 uppercase">Simular comando de voz ou áudio traduzido:</label>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Abastecimento de combustível 150 reais no Pix"
                  value={voiceQueryInput}
                  onChange={(e) => setVoiceQueryInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 text-xs text-[#111827] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {interpretationError && (
                <div className="p-2.5 bg-red-50 text-red-600 font-semibold rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{interpretationError}</span>
                </div>
              )}

              {/* Submit to AI */}
              <button
                onClick={() => handleInterpretVoice()}
                disabled={isInterpreting}
                className="w-full bg-[#111827] hover:bg-gray-800 disabled:bg-gray-200 text-white font-bold py-3 text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isInterpreting ? (
                  <>
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                    AI interpretando...
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-[#10B981]" />
                    Enviar e Registrar via AI
                  </>
                )}
              </button>

              {/* Assistant logs */}
              {lastLoggedVoiceCommand && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Último Lançamento Processado:</span>
                  <p className="italic text-gray-600 mb-1.5 font-sans">"{lastLoggedVoiceCommand.text}"</p>
                  <div className="flex gap-2 flex-wrap text-[10px] font-mono bg-white p-2 rounded">
                    <span className="text-[#10B981] font-bold">R$ {lastLoggedVoiceCommand.result.value}</span>
                    <span>• {lastLoggedVoiceCommand.result.description}</span>
                    <span>• {lastLoggedVoiceCommand.result.category}</span>
                    <span>• {lastLoggedVoiceCommand.result.paymentMethod}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL TRANSACTION CREATION MODAL OVERLAY */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAddTransactionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-sm uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#10B981]" />
              Novo Registro Manual
            </h3>

            <form onSubmit={handleManualAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setNewTxType("Despesa");
                    setNewTxPayment("Pix");
                  }}
                  className={`py-1.5 rounded-md text-xs font-semibold ${
                    newTxType === "Despesa" ? "bg-white text-red-500 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Despesa (Gasto)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTxType("Receita");
                    setNewTxPayment("Pix");
                  }}
                  className={`py-1.5 rounded-md text-xs font-semibold ${
                    newTxType === "Receita" ? "bg-white text-[#10B981] shadow-sm" : "text-gray-500"
                  }`}
                >
                  Receita (Entrada)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Descrição Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoço Restaurante"
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Estabelecimento / Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Posto BR"
                    value={newTxLocal}
                    onChange={(e) => setNewTxLocal(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Categoria</label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Combustível">Combustível</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Investimento">Investimento</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Seguros">Seguros</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Valor R$ *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="Ex: 53.50"
                    value={newTxValue}
                    onChange={(e) => setNewTxValue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Forma de Pagamento</label>
                  <select
                    value={newTxPayment}
                    onChange={(e) => setNewTxPayment(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              {newTxType === "Despesa" && newTxPayment === "Cartão de Crédito" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Escolher Cartão</label>
                  <select
                    value={newTxCardId}
                    onChange={(e) => setNewTxCardId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.bank})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Conta Bancária Origem/Destino</label>
                  <select
                    value={newTxBankId}
                    onChange={(e) => setNewTxBankId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} (Saldo: R$ {b.currentBalance.toFixed(0)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Data do Lançamento</label>
                <input
                  type="date"
                  value={newTxDate}
                  onChange={(e) => setNewTxDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#111827] hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors tracking-wide uppercase mt-2"
              >
                Cadastrar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FATURA ITEM LIST DRAWER / MODAL DETAIL */}
      {selectedFaturaCardId && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedFaturaCardId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const card = cards.find(c => c.id === selectedFaturaCardId);
              if (!card) return null;

              const cardTxs = transactions.filter(t => t.paymentMethod === "Cartão de Crédito" && t.cardId === card.id);
              const invoiceTotal = card.usedLimit;

              return (
                <div className="space-y-4">
                  <div className="border-b pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">Extrato da Fatura Anterior/Próxima</span>
                      <h3 className="font-display font-extrabold text-[#111827] text-lg mt-1">{card.name} ({card.bank})</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none block">Total Acumulado</span>
                      <span className="text-sm font-mono font-bold text-red-500 block">
                        R$ {invoiceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {cardTxs.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">Nenhum lançamento nesta fatura no momento.</p>
                    ) : (
                      cardTxs.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div>
                            <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                            <span className="text-[10px] text-gray-400">{tx.date} • {tx.category} {tx.local && `• ${tx.local}`}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-red-500">
                            -R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t text-right flex justify-between text-xs text-gray-500">
                    <span>Limite disponível neste cartão:</span>
                    <span className="font-bold text-[#10B981]">R$ {(card.limit - card.usedLimit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Form to add purchase directly */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const desc = (e.currentTarget.elements.namedItem("desc") as HTMLInputElement).value;
                    const val = parseFloat((e.currentTarget.elements.namedItem("val") as HTMLInputElement).value);
                    const cat = (e.currentTarget.elements.namedItem("cat") as HTMLSelectElement).value as any;
                    const date = (e.currentTarget.elements.namedItem("date") as HTMLInputElement).value;
                    if (!desc || !val) return;
                    
                    const newId = "tx-" + Date.now();
                    const newTx: Transaction = {
                      id: newId,
                      description: desc,
                      value: val,
                      type: "Despesa",
                      category: cat,
                      paymentMethod: "Cartão de Crédito",
                      cardId: card.id,
                      date: date || "2026-06-02",
                      time: "12:00"
                    };

                    setTransactions(prev => [newTx, ...prev]);
                    setCards(prev => prev.map(c => 
                      c.id === card.id ? { ...c, usedLimit: c.usedLimit + val } : c
                    ));
                    e.currentTarget.reset();
                  }} className="bg-gray-50 p-4 border border-gray-200 rounded-xl space-y-2 mt-4 text-left">
                    <h4 className="text-xs font-bold text-gray-700 uppercase">Registrar Nova Compra neste Cartão</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input name="desc" type="text" placeholder="Ex: Assinatura Netflix" required className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#10B981]" />
                      <input name="val" type="number" step="0.01" placeholder="Valor R$" required className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#10B981]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select name="cat" className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#10B981]">
                        <option value="Alimentação">Alimentação</option>
                        <option value="Combustível">Combustível</option>
                        <option value="Moradia">Moradia</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Lazer">Lazer</option>
                        <option value="Outros">Outros</option>
                      </select>
                      <input name="date" type="date" defaultValue="2026-06-02" className="bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#10B981]" />
                    </div>
                    <button type="submit" className="w-full bg-[#111827] hover:bg-gray-800 text-white font-bold py-2 rounded text-xs transition-colors uppercase tracking-wider">
                      Adicionar Compra
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal placeholder interfaces for cleaner loading
function WalletIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v1a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V8" />
      <rect width="6" height="4" x="14" y="10" rx="1" />
    </svg>
  );
}

export interface Card {
  id: string;
  name: string;
  bank: string;
  limit: number;
  bestBuyDay: number;
  dueDay: number;
  color: string;
  flag: "Mastercard" | "Visa" | "Elo" | "Amex" | "Outra";
  usedLimit: number;
}

export interface Bank {
  id: string;
  name: string;
  agency?: string;
  account?: string;
  type: "Conta Corrente" | "Poupança" | "Investimento" | "Caixinha" | "Dinheiro";
  currentBalance: number;
}

export interface Transaction {
  id: string;
  description: string;
  local?: string;
  value: number;
  type: "Despesa" | "Receita";
  paymentMethod: "Pix" | "Cartão de Crédito" | "Cartão de Débito" | "Dinheiro" | "Boleto" | "Transferência";
  cardId?: string; // If 'Cartão de Crédito'
  bankId?: string; // If bank deduction / deposit
  category: "Alimentação" | "Combustível" | "Moradia" | "Serviços" | "Investimento" | "Lazer" | "Seguros" | "Salário" | "Outros";
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
}

export interface DailyBalance {
  date: string;
  initialBalance: number;
  entrances: number;
  exits: number;
  finalBalance: number;
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentSaved: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  createdAt: string; // YYYY-MM-DD
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "danger";
  date: string; // YYYY-MM-DD or string
  time?: string;
  read: boolean;
}


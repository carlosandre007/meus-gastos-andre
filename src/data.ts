import { Card, Bank, Transaction } from "./types";

export const INITIAL_CARDS: Card[] = [
  {
    id: "card-inter",
    name: "Inter Gold",
    bank: "Banco Inter",
    limit: 5000,
    bestBuyDay: 12,
    dueDay: 19,
    color: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
    flag: "Mastercard",
    usedLimit: 0,
  },
  {
    id: "card-c6",
    name: "Carbon Black",
    bank: "C6 Bank",
    limit: 15000,
    bestBuyDay: 5,
    dueDay: 12,
    color: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", // Black/Dark
    flag: "Mastercard",
    usedLimit: 0,
  },
  {
    id: "card-credcard",
    name: "Credcard Black",
    bank: "Credcard",
    limit: 50000,
    bestBuyDay: 22,
    dueDay: 1,
    color: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", // Navy/Slate
    flag: "Visa",
    usedLimit: 0,
  },
  {
    id: "card-mercado-pago",
    name: "Mercado Pago",
    bank: "Mercado Pago",
    limit: 3000,
    bestBuyDay: 10,
    dueDay: 17,
    color: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", // Sky blue
    flag: "Visa",
    usedLimit: 0,
  }
];

export const INITIAL_BANKS: Bank[] = [
  {
    id: "bank-inter",
    name: "Banco Inter",
    agency: "0001",
    account: "425000-8",
    type: "Conta Corrente",
    currentBalance: 0,
  },
  {
    id: "bank-xp",
    name: "XP Investimentos",
    agency: "0002",
    account: "982635-1",
    type: "Investimento",
    currentBalance: 0,
  },
  {
    id: "bank-nubank",
    name: "Nubank (Caixinha)",
    type: "Caixinha",
    currentBalance: 0,
  },
  {
    id: "bank-bradesco",
    name: "Bradesco",
    agency: "3400",
    account: "12345-6",
    type: "Conta Corrente",
    currentBalance: 0,
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

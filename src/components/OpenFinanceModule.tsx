import React, { useState } from "react";
import { Server, Link, ShieldCheck, Key, RefreshCw, Layers, CheckCircle, Smartphone, Lock, AlertTriangle, ArrowRight, Building, Plus } from "lucide-react";
import { Bank, Card, Transaction } from "../types";

interface OpenFinanceProps {
  onAddTransactions: (txs: Omit<Transaction, "id" | "time">[]) => void;
  banks: Bank[];
  cards: Card[];
}

export default function OpenFinanceModule({
  onAddTransactions,
  banks,
  cards,
}: OpenFinanceProps) {
  const [selectedBankKey, setSelectedBankKey] = useState("nubank");
  const [consentTransactions, setConsentTransactions] = useState(true);
  const [consentCards, setConsentCards] = useState(true);
  const [isSimulatingLink, setIsSimulatingLink] = useState(false);
  const [linkStep, setLinkStep] = useState(0); // 0 = Idle, 1 = Consent Dialog, 2 = Simulated Redirect, 3 = Ingesting, 4 = Complete
  const [lastImportedCount, setLastImportedCount] = useState(0);

  const bankOptions = [
    { key: "nubank", name: "Nubank", color: "#8A05BE", logoText: "NU" },
    { key: "itau", name: "Itaú Unibanco", color: "#EC7000", logoText: "IT" },
    { key: "bradesco", name: "Bradesco", color: "#CC092F", logoText: "BR" },
    { key: "inter", name: "Banco Inter", color: "#FF7A00", logoText: "IN" },
    { key: "caixa", name: "Caixa Econômica", color: "#1E3A8A", logoText: "CX" }
  ];

  const handleSimulateOpenFinanceLink = () => {
    setIsSimulatingLink(true);
    setLinkStep(1);
  };

  const handleAcceptConsent = () => {
    setLinkStep(2);
    // Simulate OAuth Login Redirect
    setTimeout(() => {
      setLinkStep(3);
      // Simulate API endpoint fetch & synchronization
      setTimeout(() => {
        // Build dynamic mock transactions based on consented scopes
        const currentRefDate = "2026-06-02";
        const importedList: Omit<Transaction, "id" | "time">[] = [];

        if (consentTransactions) {
          importedList.push({
            description: "Mensalidade Spotify Premium",
            local: "Spotify Brasil",
            value: 34.90,
            type: "Despesa",
            paymentMethod: "Pix",
            bankId: "bank-inter",
            category: "Serviços",
            date: currentRefDate,
          });
          importedList.push({
            description: "Restaurante Temaki Sushi",
            local: "Temaki Express",
            value: 125.00,
            type: "Despesa",
            paymentMethod: "Cartão de Débito",
            bankId: "bank-inter",
            category: "Alimentação",
            date: currentRefDate,
          });
        }

        if (consentCards) {
          importedList.push({
            description: "App Store Compra de Créditos",
            local: "Apple Services",
            value: 49.90,
            type: "Despesa",
            paymentMethod: "Cartão de Crédito",
            cardId: "card-inter",
            category: "Lazer",
            date: currentRefDate,
          });
          importedList.push({
            description: "Supermercado Pão de Açúcar",
            local: "Pão de Açúcar",
            value: 234.50,
            type: "Despesa",
            paymentMethod: "Cartão de Crédito",
            cardId: "card-inter",
            category: "Alimentação",
            date: currentRefDate,
          });
        }

        onAddTransactions(importedList);
        setLastImportedCount(importedList.length);
        setLinkStep(4);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: DETAILED DOCUMENTATION AND STEPS RESEARCH */}
      <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">Arquitetura de Segurança</span>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mt-1">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            Passos para Integração com Open Finance
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            As APIs de Open Finance (reguladas pelo Banco Central do Brasil) permitem a importação e atualização de transações reais sem expor senhas do usuário. Veja os passos recomendados de implementação técnica segura:
          </p>
        </div>

        {/* Step-by-step card timeline */}
        <div className="space-y-4">
          
          <div className="flex gap-4 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-[#111827] text-[#10B981] flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-gray-400" />
                Intermediação Regulada (Gateway SaaS)
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Utilize intermediários homologados como <strong className="text-gray-700">Belvo, Pluggy, Celcoin</strong> ou implemente cadastramento direto aos Diretórios de Open Finance Brasil do Banco Central. Isso possibilita obter as credenciais e certificados mTLS (Mutual TLS) obrigatórios para comunicação segura.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-[#111827] text-[#10B981] flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-gray-400" />
                Pedido de Consentimento Seguro (OAuth2 Flow)
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                As APIs de Consórcio exigem que o usuário seja redirecionado ao Internet Banking do banco dele (via Deep Linking no celular ou redirecionamento Web) apenas para aprovar a liberação de leitura temporária. Chaves de transação nunca passam pela plataforma.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-[#111827] text-[#10B981] flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                Consumo dos Endpoints de Transações & Faturas
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Utilize o recebimento de webhooks e endpoints das APIs de Open Banking (<code className="bg-gray-100 px-1 rounded text-red-500 font-mono text-[10px]">/accounts</code>, <code className="bg-gray-100 px-1 rounded text-red-500 font-mono text-[10px]">/credit-cards-accounts</code>) para baixar em JSON todas as parcelas faturadas e depósitos recebidos em D-0.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-[#111827] text-[#10B981] flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Criptografia e LGPD Rigorosa
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Salve os Tokens de Acesso (<code className="bg-gray-100 px-1 rounded text-[#10B981] font-mono text-[10px]">refresh_token</code>) usando criptografia <strong className="text-gray-700">AES-256 de ponta a ponta</strong> associada a variáveis de ambiente restritas do servidor, garantindo segurança estrita e em conformidade técnica com a LGPD.
              </p>
            </div>
          </div>

        </div>

        {/* Security Warning Box */}
        <div className="bg-[#10B981]/5 border border-[#10B981]/15 p-4 rounded-xl flex gap-3 text-xs text-gray-600">
          <AlertTriangle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-gray-900">Nota Legal de Segurança</span>
            <p className="leading-relaxed text-[11px]">
              O consentimento das APIs Open Finance expira automaticamente a cada 90 dias, exigindo revalidação do usuário. Ele pode cancelar sua inscrição a qualquer momento diretamente pela dashboard ou pela central do seu respectivo banco, sem qualquer multa.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: INTERACTIVE RECONCILIATION SANDBOX SIMULATOR */}
      <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">Sandbox de Experiência</span>
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5 mt-1">
              <Server className="w-4.5 h-4.5 text-[#10B981]" />
              Simulador Técnico Real
            </h3>
            <p className="text-xs text-gray-400">
              Escolha seu banco, defina as permissões de leitura e veja a importação automática em tempo real.
            </p>
          </div>

          {linkStep === 0 && (
            <div className="space-y-4 pt-2">
              {/* Bank Grid Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 block">Banco Emissor do Consentimento</label>
                <div className="grid grid-cols-2 gap-2">
                  {bankOptions.map(bo => (
                    <button
                      key={bo.key}
                      type="button"
                      onClick={() => setSelectedBankKey(bo.key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        selectedBankKey === bo.key
                          ? "border-[#10B981] bg-[#10B981]/5 shadow-xs"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono text-white" style={{ backgroundColor: bo.color }}>
                        {bo.logoText}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{bo.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope permissions switches */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Permissões Solicitadas (Somente Leitura)</span>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-semibold text-gray-800">Transações e Saldos de Conta</p>
                    <p className="text-[10px] text-gray-400">Sincroniza extratos e Pix</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentTransactions}
                    onChange={(e) => setConsentTransactions(e.target.checked)}
                    className="w-4 h-4 text-[#10B981] accent-[#10B981]"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-200/55 pt-3">
                  <div className="text-xs">
                    <p className="font-semibold text-gray-800">Faturas e Limites de Cartão</p>
                    <p className="text-[10px] text-gray-400">Importação automática da fatura</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentCards}
                    onChange={(e) => setConsentCards(e.target.checked)}
                    className="w-4 h-4 text-[#10B981] accent-[#10B981]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateOpenFinanceLink}
                className="w-full bg-[#111827] hover:bg-gray-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Conectar Banco Recomendado
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sinks Redirect Step Dialog Simulation */}
          {linkStep === 1 && (
            <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-4 animate-scale-up">
              <div className="flex items-start gap-3">
                <Smartphone className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Solicitação de Consentimento</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Você será redirecionado para o Internet Banking seguro do <strong className="text-gray-700 capitalize">{selectedBankKey}</strong> para simular login e confirmar permissões.
                  </p>
                </div>
              </div>

              <div className="text-[10px] bg-white p-2 rounded border font-mono text-gray-400 space-y-1">
                <span className="font-semibold text-gray-600 block">ESCOPOS DESCRITOS BRASIL:</span>
                <div>• consent_read_accounts</div>
                <div>• consent_read_credit_cards</div>
                <div>• validity_expires_on: 2026-09-02</div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setLinkStep(0)}
                  className="bg-white hover:bg-gray-100 border text-gray-600 text-[10px] font-bold p-1 px-3 rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleAcceptConsent}
                  className="bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold p-1 px-3 rounded-lg flex items-center gap-1"
                >
                  Simular Redirecionamento
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sinks loader redirect */}
          {linkStep === 2 && (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#10B981]/20 border-t-[#10B981] animate-spin mx-auto"></div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Acessando Internet Banking Central...</h4>
                <p className="text-[11px] text-gray-400 mt-1">Conectando ao túnel OAuth do Open Banking. Seguridade SSL do Grupo 3A está ativa.</p>
              </div>
            </div>
          )}

          {/* Ingesting synchronized data */}
          {linkStep === 3 && (
            <div className="p-6 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-[#10B981] animate-spin mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">Autenticado com Sucesso!</h4>
                <p className="text-[11px] text-gray-400 mt-1">Buscando lançamentos e faturas do cartão em formato JSON criptografado.</p>
              </div>
            </div>
          )}

          {/* Completion Simulation */}
          {linkStep === 4 && (
            <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl text-center space-y-4 animate-scale-up">
              <CheckCircle className="w-10 h-10 text-[#10B981] mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">Banco Sincronizado com o Grupo 3A!</h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Importação finalizada automaticamente. Foram adicionados <strong className="text-[#10B981] font-mono">{lastImportedCount} lançamentos</strong> em sua lista de controle para hoje.
                </p>
                <p className="text-[10px] text-gray-400 mt-2">Observe as atualizações de saldos e faturas imediatamente no painel.</p>
              </div>

              <button
                type="button"
                onClick={() => setLinkStep(0)}
                className="w-full bg-[#111827] text-white hover:bg-gray-800 text-[10px] font-bold py-2 rounded-lg"
              >
                Conectar Outra Conta via Open Finance
              </button>
            </div>
          )}

        </div>
        
        {/* Footer brand info */}
        {linkStep === 0 && (
          <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between text-[11px] text-gray-400">
            <span>Certificado Regulamentar:</span>
            <strong className="text-gray-500 font-mono">BACEN #982/2026</strong>
          </div>
        )}
      </div>
    </div>
  );
}

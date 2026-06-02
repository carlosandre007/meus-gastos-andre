import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle, Info, Trash2, Smartphone, Volume2, ShieldCheck, CreditCard } from "lucide-react";
import { InAppNotification, Card, Goal } from "../types";

interface NotificationsCenterProps {
  cards: Card[];
  goals: Goal[];
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationsCenter({
  cards,
  goals,
  notifications,
  onMarkAsRead,
  onClearAll,
}: NotificationsCenterProps) {
  const [showPushSuccess, setShowPushSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play a simple retro browser sound effect for notifications
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context not supported or restricted by browser gesture yet.");
    }
  };

  // Simulate Triggering a native desktop push notification or showing standard alert mockup
  const handleTriggerPushNotificationSim = () => {
    playNotificationSound();

    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Grupo 3A Finance", {
            body: "Alerta: Sua Fatura do Banco Inter (due: R$ 1.240) vence em 3 dias!",
            icon: "/favicon.ico"
          });
        }
      });
    }

    // Always display visual custom popup mock
    setShowPushSuccess(true);
    setTimeout(() => {
      setShowPushSuccess(false);
    }, 4500);
  };

  // Filter read vs unread
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      
      {/* Top Controller Center */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">Sistema de Eventos Automáticos</span>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-1">
              <Bell className="w-5 h-5 text-[#10B981]" />
              Notificações In-App & Desktops Externos
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Alertas configurados para avisar com antecedência sobre contas pendentes, limites e metas atingidas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                soundEnabled 
                  ? "border-[#10B981] text-[#10B981] bg-[#10B981]/5"
                  : "border-gray-200 text-gray-400"
              }`}
              title="Sonar de alertas"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Som: {soundEnabled ? "Ligado" : "Mudo"}
            </button>

            <button
              onClick={handleTriggerPushNotificationSim}
              className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-bold px-4 py-2 text-xs rounded-xl transition-all"
            >
              <Smartphone className="w-4 h-4 text-[#10B981]" />
              Simular Push no Dispositivo
            </button>
          </div>
        </div>

        {/* Browser alert permission info */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-[11px] text-gray-500 mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vínculo nativo Push Web ativo
          </span>
          <span className="text-gray-400">Suporta Chrome, Safari, Firefox, Edge</span>
        </div>
      </div>

      {/* Simulated System Notification Popup Banner */}
      {showPushSuccess && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-[#111827] border-l-4 border-l-[#10B981] hover:scale-102 transform text-white rounded-xl shadow-2xl p-4 flex gap-3 animate-scale-up border border-gray-800">
          <Smartphone className="w-8 h-8 text-[#10B981] flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Notificação Push (Grupo 3A)</span>
              <button onClick={() => setShowPushSuccess(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <p className="text-xs font-bold">Aviso de Vencimento de Conta</p>
            <p className="text-[10px] text-gray-300">A fatura do seu cartão de crédito (Banco Inter) vence em exatamente 3 dias (05/06). Evite multas!</p>
          </div>
        </div>
      )}

      {/* Main List Box */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <h3 className="font-semibold text-sm text-[#111827] flex items-center gap-2">
            Alertas Ativos de Sistema ({unreadCount} não lidos)
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Todos
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-40 mx-auto mb-3" />
            <p className="text-sm font-semibold">Tudo sob controle!</p>
            <p className="text-xs mt-1">Você não possui alertas financeiros críticos pendentes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              // Color selector matching alert type
              let colorClass = "border-gray-100 bg-gray-50 text-gray-800";
              let iconElement = <Info className="w-4 h-4 text-blue-500" />;

              if (notification.type === "warning") {
                colorClass = "border-amber-100 bg-amber-50/20 text-amber-800";
                iconElement = <AlertTriangle className="w-4 h-4 text-amber-500" />;
              } else if (notification.type === "danger") {
                colorClass = "border-red-100 bg-red-50/20 text-red-800";
                iconElement = <AlertTriangle className="w-4 h-4 text-red-500" />;
              } else if (notification.type === "success") {
                colorClass = "border-emerald-100 bg-[#10B981]/5 text-emerald-800";
                iconElement = <CheckCircle className="w-4 h-4 text-[#10B981]" />;
              }

              return (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-3.5 border rounded-xl relative transition-all ${colorClass} ${
                    notification.read ? "opacity-60" : "font-semibold shadow-xs"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{iconElement}</div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">{notification.title}</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{notification.message}</p>
                      {notification.time && (
                        <span className="text-[9px] text-gray-400 block font-mono">
                          {notification.date} às {notification.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded hover:bg-[#10B981]/25 transition-all self-center"
                    >
                      Marcar Lido
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  ComplaintRecord, 
  RawLogRecord, 
  ErrorLogRecord, 
  DispenserRecord 
} from '../../types';
import { 
  Send, 
  Smartphone, 
  Cpu, 
  CheckCheck, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Code
} from 'lucide-react';

interface WhatsAppSimulatorProps {
  onProcessWebhook: (messageText: string, senderName: string, senderPhone: string) => {
    replyText: string;
    action: string;
    targetSheet: string;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
  meta?: string;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  onProcessWebhook
}) => {
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState('Dr. Nair (Fortis)');
  const [senderPhone, setSenderPhone] = useState('+91 98231 44510');
  const [senderRole, setSenderRole] = useState<'customer' | 'engineer'>('customer');
  const [simulatedWebhookPayload, setSimulatedWebhookPayload] = useState<string>('');
  const [lastActionFeedback, setLastActionFeedback] = useState<{ action: string; targetSheet: string; time: string } | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'user',
      senderName: 'Dr. Nair (Fortis)',
      text: 'Water cooler leaking heavily near 4th floor ICU lobby. Dispenser DISP-S04. Urgent please.',
      timestamp: '17:42',
    },
    {
      id: 'm-2',
      sender: 'bot',
      senderName: 'WhatsApp Service Bot',
      text: '🙏 Thank you Dr. Nair (Fortis)! Your service request has been registered as Ticket #TKT-1248.\nAssigned Engineer: Amit Sharma\nZone: South\nWe are on it!',
      timestamp: '17:42',
      meta: 'Automated Apps Script Reply'
    }
  ]);

  const presetMessages = [
    {
      role: 'customer',
      label: '🚨 Urgent Leak (Fortis ICU)',
      name: 'Dr. Nair (Fortis)',
      phone: '+91 98231 44510',
      text: 'Heavy water leakage in 4th floor ICU lobby DISP-S04. Flooding floor.'
    },
    {
      role: 'customer',
      label: '❄️ Cooling Fault (Wipro East)',
      name: 'Facilities Mgr (Wipro)',
      phone: '+91 97410 88231',
      text: 'Water not chilling at 2nd floor pantry dispenser DISP-E08.'
    },
    {
      role: 'engineer',
      label: '✅ Engineer Close (TKT-1248)',
      name: 'Amit Sharma (Field Eng)',
      phone: '+91 98450 11200',
      text: 'Status #1248 Closed. Replaced inlet tap valve gasket and tested 10L flush ok.'
    },
    {
      role: 'engineer',
      label: '🚰 Dispenser Service (DISP-S12)',
      name: 'Amit Sharma (Field Eng)',
      phone: '+91 98450 11200',
      text: 'Service DISP-S12 Stage 2 carbon block replaced. TDS calibrated to 65 ppm.'
    },
    {
      role: 'customer',
      label: '⚠️ Invalid / Sales Inquiry',
      name: 'Random Visitor',
      phone: '+91 99019 90199',
      text: 'Hi can you send a brochure and quotation for 10 new commercial chillers?'
    }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg-' + Date.now();

    // Generate Meta Cloud API Webhook payload format
    const metaPayload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "918000012345", phone_number_id: "10982348912" },
            contacts: [{ profile: { name: senderName }, wa_id: senderPhone.replace(/[^0-9]/g, '') }],
            messages: [{
              from: senderPhone.replace(/[^0-9]/g, ''),
              id: "wamid." + Math.random().toString(36).substring(2, 15),
              timestamp: String(Math.floor(Date.now() / 1000)),
              text: { body: text },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };

    setSimulatedWebhookPayload(JSON.stringify(metaPayload, null, 2));

    // Append user message to chat UI
    const newChat: ChatMessage[] = [
      ...chatHistory,
      {
        id: userMsgId,
        sender: 'user',
        senderName: senderName,
        text: text,
        timestamp: timeStr
      }
    ];

    setChatHistory(newChat);
    setInputText('');

    // Process via parent state handler
    const result = onProcessWebhook(text, senderName, senderPhone);

    setLastActionFeedback({
      action: result.action,
      targetSheet: result.targetSheet,
      time: timeStr
    });

    // Append automated bot reply after short delay
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          senderName: 'WhatsApp Service Bot',
          text: result.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: 'Automated Apps Script Reply'
        }
      ]);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Explanation Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            Interactive WhatsApp Cloud API Webhook Ingestion
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Messages sent here trigger the Apps Script <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">doPost(e)</code> logic, updating Master Sheets and Analytics instantly.
          </p>
        </div>
        {lastActionFeedback && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Last Action: {lastActionFeedback.action} &rarr; {lastActionFeedback.targetSheet}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phone Emulator (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[580px]">
          {/* Phone Header */}
          <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Service Desk Bot</h4>
                <p className="text-[10px] text-emerald-300">Apps Script Webhook Active</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-mono border border-slate-700">
              WhatsApp Cloud
            </span>
          </div>

          {/* Chat Bubble Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 border-b border-slate-100">
            {chatHistory.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-500 mb-1 px-1 font-medium">
                    {msg.senderName}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                    </div>
                  </div>
                  {msg.meta && (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 px-1 flex items-center gap-1">
                      ⚡ {msg.meta}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={senderRole === 'customer' ? 'Describe your issue...' : 'e.g. Status #1248 Closed'}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs active:scale-95 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Presets & Live Payload Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Quick Scenario Buttons */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quick Test Scenarios (1-Click Simulate)
              </h4>
              <span className="text-[11px] text-slate-500">Click to dispatch webhook</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presetMessages.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSenderName(preset.name);
                    setSenderPhone(preset.phone);
                    setSenderRole(preset.role as any);
                    handleSendMessage(preset.text);
                  }}
                  className="text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 hover:border-indigo-300 transition-all text-xs group shadow-2xs"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    <span>{preset.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">"{preset.text}"</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Sender: {preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Webhook JSON Payload Inspector */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2.5 flex-1 flex flex-col shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                Raw Meta Webhook Payload <code className="text-[11px] text-slate-500 font-normal">(POST to Apps Script)</code>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold">
                Content-Type: application/json
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-emerald-300 overflow-y-auto max-h-48 flex-1">
              {simulatedWebhookPayload ? (
                <pre className="text-emerald-400">{simulatedWebhookPayload}</pre>
              ) : (
                <div className="text-slate-500 italic">
                  // Send a message or click any scenario above to view the incoming JSON payload parsed by doPost(e)...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

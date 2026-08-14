import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Play, 
  Layers, 
  Bot, 
  User, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, Agent, SystemState } from '../types';

interface DirectorGeneralChatProps {
  messages: ChatMessage[];
  directorAgent: Agent;
  systemState: SystemState;
  onSendMessage: (text: string) => Promise<void>;
  onExecuteSuggestedAction: (action: string, payload?: Record<string, unknown>) => void;
  isLoading: boolean;
}

export const DirectorGeneralChat: React.FC<DirectorGeneralChatProps> = ({
  messages,
  directorAgent,
  systemState,
  onSendMessage,
  onExecuteSuggestedAction,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice Recognition (Speech to Text)
  const toggleSpeechRecognition = () => {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("La reconnaissance vocale Web Speech n'est pas supportée par votre navigateur.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const quickPrompts = [
    { label: "🚀 Planifier une mission de recherche & dev", text: "Directeur Général, lance une mission de veille sur les architectures Multi-Agents 2026 et prépare les outils nécessaires." },
    { label: "🤖 Évaluer la création d'un sous-agent", text: "La charge d'analyse de données justifie-t-elle de créer un sous-agent Analyste Données ?" },
    { label: "🧠 Résumer l'état de notre mémoire", text: "Fais une synthèse de nos mémoires procédurales et des objectifs utilisateur actuels." },
    { label: "🛡️ Audit Zero Trust & Sandbox", text: "Lance un audit de conformité de nos outils en production et teste la sandbox." }
  ];

  return (
    <div className="flex flex-col h-[740px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header with Director General Identity & Status */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
              👑
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{directorAgent.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 rounded">
                {directorAgent.codeName}
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-purple-950 text-purple-300 border border-purple-800 rounded">
                {directorAgent.model}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interlocuteur central • {directorAgent.specialty}
            </p>
          </div>
        </div>

        {/* Voice & System Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-voice-output-toggle"
            onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              isVoiceOutputEnabled 
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Lecture vocale automatique des réponses"
          >
            {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Synthèse Vocale</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Trust Enforced</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm shadow shrink-0">
                  👑
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
              }`}>
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5 opacity-75">
                  <span className="font-semibold">{isUser ? 'Vous' : msg.agentName || 'Directeur Général IA'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Director's internal thought process box (if available) */}
                {msg.thoughtProcess && !isUser && (
                  <div className="mb-3 p-2.5 bg-slate-950/70 border border-indigo-900/50 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-indigo-200 block text-[10px] uppercase tracking-wider">Raisonnement Stratégique & Zero Trust</span>
                      <p className="mt-0.5 text-indigo-300/90 leading-relaxed">{msg.thoughtProcess}</p>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Text to Speech button for Director's messages */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => speakText(msg.content)}
                      className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      title="Écouter la réponse"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Écouter</span>
                    </button>
                  </div>
                )}

                {/* Action Suggestions attached by Director */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => onExecuteSuggestedAction(action.action, action.payload)}
                        className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3 text-blue-400" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm shadow shrink-0">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm shadow shrink-0">
              👑
            </div>
            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2 shadow">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Le Directeur Général réfléchit et planifie...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Mission Suggestions Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">Suggestions :</span>
        {quickPrompts.map((qp, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(qp.text)}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg whitespace-nowrap transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          id="btn-voice-input"
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-red-600 text-white border-red-500 animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Parler au micro"
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <input
          type="text"
          id="director-chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Donnez une instruction stratégique au Directeur Général..."
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          disabled={isLoading}
        />

        <button
          type="submit"
          id="director-chat-submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <span>Envoyer</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

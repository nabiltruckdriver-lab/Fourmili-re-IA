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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Brain,
  Search,
  ListTodo,
  Lock,
  Wrench,
  Activity,
  ArrowRight,
  HelpCircle
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
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<string, boolean>>({});
  const [showLifecycleGuide, setShowLifecycleGuide] = useState(false);
  const [activeCycleStep, setActiveCycleStep] = useState<number | null>(null);
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

  const toggleBreakdown = (msgId: string) => {
    setExpandedBreakdowns(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const quickPrompts = [
    { label: "🚀 Mission de Veille & Synthèse", text: "Directeur Général, lance une mission de veille sur les architectures Multi-Agents 2026 et synthétise les résultats dans la mémoire." },
    { label: "🤖 Évaluer la création d'un sous-agent", text: "La charge d'analyse de données justifie-t-elle de créer un sous-agent Analyste Données ?" },
    { label: "🧠 Restructuration & Audit Auto-Organisation", text: "Lance un audit d'auto-organisation selon le principe 'Maximum d'efficacité, minimum de complexité'." },
    { label: "🛡️ Audit Zero Trust & Sandbox", text: "Lance un audit de conformité de nos outils en production et teste la sandbox." }
  ];

  const operationalCycleSteps = [
    { num: 1, name: "1. Utilisateur", desc: "Définit l'objectif" },
    { num: 2, name: "2. Web App", desc: "Authentification & contexte" },
    { num: 3, name: "3. Backend", desc: "Canal Zero Trust" },
    { num: 4, name: "4. DG IA", desc: "Compréhension & Analyse" },
    { num: 5, name: "5. Mémoire", desc: "Recherche ciblée" },
    { num: 6, name: "6. Capacités", desc: "Réutiliser avant de créer" },
    { num: 7, name: "7. Création", desc: "Connaissance -> Outil -> Agent" },
    { num: 8, name: "8. Planification", desc: "Décomposition DAG" },
    { num: 9, name: "9. Orchestration", desc: "Allocation des agents" },
    { num: 10, name: "10. Autorisation", desc: "Contrôle des permissions" },
    { num: 11, name: "11. Exécution", desc: "Sandbox & Moteurs IA" },
    { num: 12, name: "12. Surveillance", desc: "Anomalies & supervision" },
    { num: 13, name: "13. Erreurs", desc: "Retry, Fallback, Leçon" },
    { num: 14, name: "14. Évaluation", desc: "Obtenu vs Attendu" },
    { num: 15, name: "15. Validation", desc: "Arbitrage Orchestrateur" },
    { num: 16, name: "16. Réponse", desc: "Synthèse DG à l'utilisateur" },
    { num: 17, name: "17. Analyse Post-Mission", desc: "Retrospective" },
    { num: 18, name: "18. Mémoire", desc: "Enregistrement structuré" },
    { num: 19, name: "19. Apprentissage", desc: "Workflows procéduraux" },
    { num: 20, name: "20. Évolution", desc: "Amélioration V1 -> V2" },
    { num: 21, name: "21. Fourmilière 3D", desc: "Mise à jour en temps réel" }
  ];

  return (
    <div className="flex flex-col h-[760px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
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
              Directeur Général IA • Transforme vos objectifs en plans d&apos;actions exécutables
            </p>
          </div>
        </div>

        {/* Voice, Guide & System Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-lifecycle-guide"
            onClick={() => setShowLifecycleGuide(!showLifecycleGuide)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              showLifecycleGuide
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Afficher la boucle des 21 étapes"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cycle en 21 Étapes</span>
          </button>

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

      {/* Interactive 21-Step Operational Cycle Drawer (Chapter 43) */}
      {showLifecycleGuide && (
        <div className="bg-slate-950 border-b border-slate-800 p-4 max-h-48 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Cycle Complet d&apos;une Mission (Chapitre 43 : 21 Étapes Fondamentales)
            </h3>
            <span className="text-[10px] text-slate-400">
              Compréhension → Planification → Autorisation → Exécution → Évaluation → Apprentissage
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {operationalCycleSteps.map((step) => (
              <div
                key={step.num}
                className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[10px] space-y-0.5 hover:border-purple-500/50 transition-colors"
              >
                <div className="font-bold text-purple-300 truncate">{step.name}</div>
                <div className="text-slate-400 text-[9px] truncate">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          const isBreakdownExpanded = expandedBreakdowns[msg.id] ?? false;

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

              <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-md ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
              }`}>
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5 opacity-75">
                  <span className="font-semibold">{isUser ? 'Vous' : msg.agentName || 'Directeur Général IA'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Director's internal thought process */}
                {msg.thoughtProcess && !isUser && (
                  <div className="mb-3 p-2.5 bg-slate-950/70 border border-indigo-900/50 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-indigo-200 block text-[10px] uppercase tracking-wider">Raisonnement Stratégique & Zero Trust</span>
                      <p className="mt-0.5 text-indigo-300/90 leading-relaxed">{msg.thoughtProcess}</p>
                    </div>
                  </div>
                )}

                {/* Operational Cycle Breakdown Drawer (Chapters 4 to 8) */}
                {msg.operationalCycleBreakdown && !isUser && (
                  <div className="mb-3 bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => toggleBreakdown(msg.id)}
                      className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-blue-300 font-semibold text-[11px] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-blue-400" />
                        Logique Opérationnelle : Instruction vs Objectif & Capacités
                      </span>
                      {isBreakdownExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isBreakdownExpanded && (
                      <div className="p-3 space-y-2 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-semibold">1. Instruction Brute :</span>
                            <span className="text-slate-200">&quot;{msg.operationalCycleBreakdown.rawInstruction}&quot;</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                            <span className="text-[10px] text-blue-400 block font-semibold">2. Objectif Stratégique Réel :</span>
                            <span className="text-blue-200 font-medium">&quot;{msg.operationalCycleBreakdown.actualGoal}&quot;</span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                          <span>Classification de Complexité :</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800">
                            {msg.operationalCycleBreakdown.classification}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-emerald-400 font-semibold block">Vérification Capacités (Réutiliser avant de créer) :</span>
                          <p className="text-slate-300">{msg.operationalCycleBreakdown.capacityCheckResult}</p>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-amber-400 font-semibold block">Hiérarchie de Création :</span>
                          <p className="text-slate-300">{msg.operationalCycleBreakdown.creationHierarchyDecision}</p>
                        </div>
                      </div>
                    )}
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
              <span>Le Directeur Général analyse la demande, consulte la mémoire et planifie...</span>
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
          placeholder="Définissez votre objectif (ex: 'Lancer une veille sur le Multi-Agent', 'Créer une tâche')..."
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

import React, { useState } from 'react';
import { 
  Monitor, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Layers, 
  Cpu,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { SystemState } from '../types';

interface DesktopBridgeViewProps {
  systemState: SystemState;
  onToggleBridgeConnection: () => void;
}

export const DesktopBridgeView: React.FC<DesktopBridgeViewProps> = ({
  systemState,
  onToggleBridgeConnection
}) => {
  const [pairingToken, setPairingToken] = useState('fourmiliere_dt_sec_' + Math.random().toString(36).substring(2, 10));
  const [whitelistedCommands, setWhitelistedCommands] = useState([
    { id: '1', name: 'Lecture de répertoires de projet', cmd: 'ls -la /projects', allowed: true },
    { id: '2', name: 'Exécution de compilateurs locaux (Node, Rust, Python)', cmd: 'npm run build / cargo check', allowed: true },
    { id: '3', name: 'Notification native OS', cmd: 'notify-send "Mission terminée"', allowed: true },
    { id: '4', name: 'Édition de fichiers système protégés', cmd: 'sudo / rm -rf', allowed: false }
  ]);

  const generateNewToken = () => {
    setPairingToken('fourmiliere_dt_sec_' + Math.random().toString(36).substring(2, 10));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-300 shadow">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Passerelle Client Desktop Sécurisée</span>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded-full">
                Extension V2 Future
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Architecture : Web App SaaS → Cloud Backend → Secure Desktop Agent → PC Local
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-desktop-bridge"
          onClick={onToggleBridgeConnection}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
            systemState.desktopBridgeConnected
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>{systemState.desktopBridgeConnected ? 'Connecté (Passerelle Active)' : 'Simuler la Connexion'}</span>
        </button>
      </div>

      {/* Architecture Explanation Card */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Garantie de Sécurité & Non-Monolithisme (Section 16 & 17)</span>
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Le client Desktop ne constitue pas le cœur initial de la plateforme mais une <strong>extension contrôlée</strong>. Le cœur de l'intelligence, de la mémoire et de l'orchestration reste dans le Cloud. L'agent Desktop local agit comme une passerelle chiffrée soumise au <strong>Zero Trust</strong>, n'exécutant que les commandes explicitement autorisées par l'utilisateur.
        </p>

        {/* Visual Pipeline */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
          <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg font-bold">
            Web App SaaS
          </span>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <span className="px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg font-bold">
            Cloud Backend Orchestrator
          </span>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg font-bold">
            Secure Desktop Agent (gRPC / TLS)
          </span>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <span className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-bold flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            PC / Ressources Locales
          </span>
        </div>
      </div>

      {/* Pairing & Token Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              Jeton de Chiffrement & Appairage
            </span>
            <button
              onClick={generateNewToken}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Générer</span>
            </button>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-cyan-300 select-all text-center">
            {pairingToken}
          </div>
          <p className="text-[10px] text-slate-400">
            Ce jeton à usage unique permet au client Desktop local de s'authentifier auprès de votre Fourmilière Cloud.
          </p>
        </div>

        {/* Command Whitelist */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            Liste Blanche des Commandes Locales Autorisées
          </span>

          <div className="space-y-2">
            {whitelistedCommands.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-200 block">{c.name}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{c.cmd}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.allowed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {c.allowed ? 'Autorisé' : 'Bloqué'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

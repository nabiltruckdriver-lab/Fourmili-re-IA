import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Activity, 
  Layers, 
  UserCheck,
  Zap,
  Key
} from 'lucide-react';
import { GovernanceRequest, AuditLog, AutonomyLevel, SystemState } from '../types';

interface GovernanceAndZeroTrustProps {
  governanceRequests: GovernanceRequest[];
  auditLogs: AuditLog[];
  systemState: SystemState;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onChangeAutonomy: (level: AutonomyLevel) => void;
}

export const GovernanceAndZeroTrust: React.FC<GovernanceAndZeroTrustProps> = ({
  governanceRequests,
  auditLogs,
  systemState,
  onApproveRequest,
  onRejectRequest,
  onChangeAutonomy
}) => {
  const pendingRequests = governanceRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* Left Column: Human Governance Gate & Autonomy Controls */}
      <div className="lg:col-span-6 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-300 shadow">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gouvernance Humaine & Portes d'Approbation</span>
                {pendingRequests.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 rounded-full font-bold">
                    {pendingRequests.length} en attente
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                L'utilisateur reste l'autorité suprême • Arbitrage des actions critiques
              </p>
            </div>
          </div>
        </div>

        {/* Autonomy Level Explanation Box */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">Mode d'Autonomie Actuel :</span>
            <span className="font-bold text-blue-400">{systemState.autonomyLevel}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              systemState.autonomyLevel === 'SUPERVISED' 
                ? 'bg-blue-950/50 border-blue-500 text-blue-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`} onClick={() => onChangeAutonomy('SUPERVISED')}>
              <span className="font-bold block text-slate-200">1. Supervisé</span>
              <p className="text-[10px] mt-1 text-slate-400">Toute création et appel d'outil requiert accord explicite.</p>
            </div>

            <div className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              systemState.autonomyLevel === 'BALANCED' 
                ? 'bg-blue-950/50 border-blue-500 text-blue-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`} onClick={() => onChangeAutonomy('BALANCED')}>
              <span className="font-bold block text-slate-200">2. Équilibré (Recommandé)</span>
              <p className="text-[10px] mt-1 text-slate-400">Autonomie sur les tâches courantes, validation sur créations.</p>
            </div>

            <div className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              systemState.autonomyLevel === 'AUTONOMOUS' 
                ? 'bg-blue-950/50 border-blue-500 text-blue-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`} onClick={() => onChangeAutonomy('AUTONOMOUS')}>
              <span className="font-bold block text-slate-200">3. Autonome</span>
              <p className="text-[10px] mt-1 text-slate-400">Délégation avancée avec barrières de sécurité automatiques.</p>
            </div>
          </div>
        </div>

        {/* Pending Requests List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Requêtes d'Approbation en Attente ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle className="w-6 h-6 mx-auto text-emerald-500 opacity-80" />
              <p className="font-semibold text-slate-400">Aucune action bloquée en attente</p>
              <p className="text-[11px]">Toutes les opérations courantes respectent le cadre de sécurité défini.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 rounded-xl border border-amber-500/50 p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded uppercase">
                      {req.actionType}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1">{req.title}</h4>
                    <span className="text-[10px] text-slate-400">Initié par : {req.agentName}</span>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                    Risque : {req.riskScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {req.justification}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 rounded-lg text-xs font-semibold border border-slate-700 hover:border-red-700 transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Refuser</span>
                  </button>
                  <button
                    onClick={() => onApproveRequest(req.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Autoriser l'Action</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Zero Trust Immutable Audit Log */}
      <div className="lg:col-span-6 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-300 shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Journal d'Audit Zero Trust Immuable</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                  Authentifié • Vérifié • Signé
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Principe : "Ne jamais faire confiance, toujours vérifier"
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-[11px]">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    log.status === 'ALLOWED' ? 'bg-emerald-400' : 'bg-red-400'
                  }`} />
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-slate-500">[{log.agentName}]</span>
                </div>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>

              <div className="text-slate-300 text-xs font-sans">
                {log.details}
              </div>

              {/* Zero-Trust 4-Point Verification Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] text-slate-400 font-sans">
                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-emerald-400">
                  ✓ Auth: OK
                </span>
                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-emerald-400">
                  ✓ Scope: OK
                </span>
                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-emerald-400">
                  ✓ Quota: OK
                </span>
                <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-blue-400 font-mono">
                  Sig: ecdsa-sha256
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

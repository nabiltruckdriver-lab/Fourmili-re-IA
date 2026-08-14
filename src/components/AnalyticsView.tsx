import React from 'react';
import { 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { EvolutionStage, SystemState, Agent, Department } from '../types';

interface AnalyticsViewProps {
  systemState: SystemState;
  evolutionStages: EvolutionStage[];
  agents: Agent[];
  departments: Department[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  systemState,
  evolutionStages,
  agents,
  departments
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-300 shadow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Observabilité, Télémétrie & Auto-Évaluation</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                100% Observable
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Métriques de résilience, consommation de quotas et suivi des 6 paliers d'évolution
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Score de Sécurité Zero Trust
          </span>
          <span className="text-xl font-extrabold text-blue-400">{systemState.securityScore}%</span>
          <p className="text-[10px] text-slate-500">Toutes les requêtes sont signées et isolées</p>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Santé du Banc Sandbox
          </span>
          <span className="text-xl font-extrabold text-emerald-400">{systemState.sandboxHealthScore}/100</span>
          <p className="text-[10px] text-slate-500">Conteneurs éphémères hermétiques</p>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Budget Tokens Consommés
          </span>
          <span className="text-xl font-extrabold text-purple-400">{systemState.totalTokensUsed.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500">Quota horaire : 12% utilisé</p>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Taux de Succès des Missions
          </span>
          <span className="text-xl font-extrabold text-cyan-400">98.4%</span>
          <p className="text-[10px] text-slate-500">Sur les 14 dernières tâches exécutées</p>
        </div>
      </div>

      {/* 6 Evolution Stages Progression (Section 26 & 28) */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Cycle de Croissance Organique de la Colonie (Section 26)</span>
          </h3>
          <span className="text-xs font-bold text-amber-300">
            Étape Actuelle : {systemState.evolutionLevel}/6
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {evolutionStages.map((stage) => {
            const isCurrent = systemState.evolutionLevel === stage.level;
            return (
              <div
                key={stage.level}
                className={`p-3.5 rounded-xl border transition-all ${
                  stage.achieved
                    ? 'bg-slate-900 border-emerald-900/60 shadow-sm'
                    : isCurrent
                      ? 'bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    stage.achieved 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : isCurrent 
                        ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    Palier {stage.level}
                  </span>
                  {stage.achieved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-100">{stage.name}</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{stage.description}</p>
                <p className="text-[10px] text-slate-500 mt-2 italic">Condition : {stage.requirements}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

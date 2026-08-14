import React, { useState } from 'react';
import { 
  GitBranch, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Activity, 
  Wrench, 
  Cpu, 
  Brain, 
  RefreshCw, 
  ArrowRight,
  BookOpen,
  History,
  Archive,
  BarChart2
} from 'lucide-react';
import { Agent, SkillDefinition, ProceduralWorkflow, EvolutionStage, SystemState } from '../types';

interface EvolutionProps {
  agents: Agent[];
  skills: SkillDefinition[];
  workflows: ProceduralWorkflow[];
  evolutionStages: EvolutionStage[];
  systemState: SystemState;
  onUpgradeAgentVersion?: (agentId: string, changelog: string) => void;
  onRollbackAgentVersion?: (agentId: string) => void;
  onRunAutoOrgAudit: () => Promise<void>;
  isAuditing: boolean;
  auditResults: {
    healthScore: number;
    summary: string;
    recommendations: string[];
    redundantCapabilities: string[];
    proposedRestructuration?: string | null;
  } | null;
}

export const EvolutionAndSelfOrganization: React.FC<EvolutionProps> = ({
  agents,
  skills,
  workflows,
  evolutionStages,
  systemState,
  onRollbackAgentVersion,
  onRunAutoOrgAudit,
  isAuditing,
  auditResults
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'agents-lifecycle' | 'workflows-skills' | 'auto-organization'>('auto-organization');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="space-y-6">
      {/* Header with Dual-Loop Concept (Chapter 44) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-purple-950 text-purple-300 border border-purple-800">
                Chapitres 25 à 35 & 44 • Boucle Évolutive & Auto-Organisation
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                Continuous Learning Engine
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Évolution, Apprentissage & Auto-Organisation
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Le système fonctionne sur deux boucles coordonnées : la <strong>Boucle Opérationnelle</strong> (Demande → Exécution → Résultat) et la <strong>Boucle Évolutive</strong> (Expérience → Mémoire → Analyse → Apprentissage → Amélioration → Nouvelle Capacité).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-run-auto-org-audit"
              onClick={onRunAutoOrgAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Audit Organisationnel en cours...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Lancer l&apos;Audit d&apos;Auto-Organisation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'auto-organization', label: '🏛️ Auto-Organisation & Audit', icon: Brain },
            { id: 'agents-lifecycle', label: '🤖 Cycle de Vie & Rollback V1/V2', icon: RotateCcw },
            { id: 'workflows-skills', label: '⚡ Workflows Procéduraux & Compétences', icon: BookOpen },
            { id: 'stages', label: '🧬 Paliers d\'Évolution (1 à 6)', icon: Layers }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Auto-Organisation & Health Audit */}
      {activeTab === 'auto-organization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Audit Diagnostic */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Diagnostic d&apos;Auto-Organisation (Principe #33 : Efficacité Max / Complexité Min)
                </h3>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Score de Santé : {auditResults?.healthScore || 97}/100
                </span>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                {auditResults?.summary || "L'écosystème maintient une structure saine et compacte. Les fonctions actives correspondent aux besoins réels. Aucune redondance d'agents ou de départements détectée."}
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Recommandations d&apos;Optimisation Détectées :
                </h4>
                {(auditResults?.recommendations || [
                  "Maintenir la Direction Générale en chef d'orchestre unique tant que la charge n'excède pas 5 missions concurrentes.",
                  "Conserver les scripts en banc d'essai Sandbox avant toute promotion en production.",
                  "Indexer systématiquement les résolutions d'incidents dans la partition Mémoire Erreurs / Leçons."
                ]).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controlled Growth Formula (Principle #45 & #47) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Hiérarchie de Création & Croissance Contrôlée
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Principe fondamental : <strong>Réutiliser avant de créer</strong>. La création suit scrupuleusement la chaîne d&apos;économie :
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { step: '1. Connaissance', desc: 'Mémoire sémantique' },
                  { step: '2. Procédure', desc: 'Workflow documenté' },
                  { step: '3. Outil', desc: 'Script en Sandbox' },
                  { step: '4. Workflow', desc: 'Enchaînement validé' },
                  { step: '5. Agent', desc: 'Sous-agent justifié' },
                  { step: '6. Département', desc: 'Chambre organisationnelle' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-blue-400 mb-1">{item.step}</div>
                    <div className="text-[11px] text-slate-300">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Deprecation & Lifecycle Monitor */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-400" />
                Cycle de Dépréciation Progressive (Chapitre 32)
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Pour éviter toute rupture de dépendance, le retrait d&apos;une capacité s&apos;opère par étapes vérifiées :
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">1</span>
                  <span>Analyse & Recherche des dépendances</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Désactivation & Observation en Sandbox</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Archivage sécurisé des connaissances</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-[10px]">4</span>
                  <span>Suppression définitive si 0 dépendance active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Agent Versioning & Rollback */}
      {activeTab === 'agents-lifecycle' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Sélectionner un Agent</h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedAgent.id === agent.id
                      ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{agent.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{agent.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">v{agent.version}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {agent.metrics.successRate}% succès
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Version Details & Rollback */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAgent.avatar}</span>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">Version active actuelle : <strong>v{selectedAgent.version}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Stabilité Sandbox Validée
                </span>
              </div>
            </div>

            {/* Performance Over Time (Chapter 29) */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Taux de Réussite</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{selectedAgent.metrics.successRate}%</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Temps Moyen</div>
                <div className="text-base font-bold text-blue-400 mt-0.5">{selectedAgent.metrics.avgExecutionTimeMs} ms</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Tokens Conso</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">{selectedAgent.metrics.tokensConsumed.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Erreurs Détectées</div>
                <div className="text-base font-bold text-slate-300 mt-0.5">{selectedAgent.metrics.errorCount}</div>
              </div>
            </div>

            {/* Versioning Cycle Flow (Chapter 30) */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                Cycle d&apos;Évolution & Protection Rollback (Agent V1 → V2)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Lorsqu&apos;une amélioration d&apos;agent est conçue, elle passe obligatoirement par un banc d&apos;essai Sandbox. Si la version V2 montre une régression de performance ou de sécurité, le système déclenche un <strong>Rollback immédiat vers V1</strong>.
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Point de restauration sauvegardé : v1.0.0</span>
                <button
                  onClick={() => onRollbackAgentVersion && onRollbackAgentVersion(selectedAgent.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Tester le Rollback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Workflows & Skills */}
      {activeTab === 'workflows-skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Procedural Workflows (Chapter 27) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Workflows Procéduraux Appris (Chapitre 27)
              </h3>
              <span className="text-xs text-slate-400">{workflows.length} workflow(s)</span>
            </div>

            <p className="text-xs text-slate-400">
              Transformés à partir d&apos;expériences réelles réussies : <strong>Expérience → Procédure → Test → Validation → Mémoire Procédurale</strong>.
            </p>

            <div className="space-y-3">
              {workflows.map((wf) => (
                <div key={wf.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{wf.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {wf.code}
                    </span>
                  </div>
                  <p className="text-slate-400">{wf.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Succès répétés : <strong className="text-emerald-400">{wf.successCount}x</strong></span>
                    <span>Temps moy. : <strong className="text-slate-200">{wf.averageExecutionTimeSec}s</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Tree (Chapter 9) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Registre des Compétences Validées (Chapitre 9)
              </h3>
              <span className="text-xs text-slate-400">{skills.length} compétence(s)</span>
            </div>

            <p className="text-xs text-slate-400">
              Définitions formelles comprenant objectif, connaissances requises, contraintes, critères de réussite et méthode de validation.
            </p>

            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{skill.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {skill.status}
                    </span>
                  </div>
                  <p className="text-slate-400">{skill.objective}</p>
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <strong>Procédure :</strong> {skill.procedure}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Evolution Stages (1 to 6) */}
      {activeTab === 'stages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Progression de l&apos;Écosystème vers l&apos;Organisation Multi-Départements
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Le projet commence avec <strong>un seul agent</strong> et grandit au fur et à mesure des missions réelles pour atteindre le statut d&apos;organisation numérique intelligente sous gouvernance humaine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evolutionStages.map((stage) => (
              <div
                key={stage.level}
                className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                  stage.achieved
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    stage.achieved ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Palier {stage.level}
                  </span>
                  {stage.achieved && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Atteint
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-200 text-sm">{stage.name}</h4>
                <p className="text-slate-400">{stage.description}</p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
                  {stage.requirements}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

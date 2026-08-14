import React, { useState } from 'react';
import { 
  ListTodo, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Layers, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  Cpu,
  CheckCircle2,
  XCircle,
  Loader2,
  GitBranch,
  Award,
  RefreshCw,
  FolderGit2,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Department, Agent, Tool, MissionComplexity, EvaluationStatus } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  departments: Department[];
  agents: Agent[];
  tools: Tool[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'progress' | 'steps' | 'tokensUsed'> & { 
    steps: { title: string; toolUsed?: string; isParallel?: boolean; dependsOn?: string[] }[];
    complexity?: MissionComplexity;
    expectedOutcome?: string;
  }) => void;
  onExecuteStep: (taskId: string, stepId: string) => void;
  onRunFullTask: (taskId: string) => void;
  onEvaluateTask?: (taskId: string) => Promise<void>;
  onApproveTask?: (taskId: string) => void;
  isEvaluating?: boolean;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  departments,
  agents,
  tools,
  onCreateTask,
  onExecuteStep,
  onRunFullTask,
  onEvaluateTask,
  onApproveTask,
  isEvaluating = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [isAiPlanning, setIsAiPlanning] = useState(false);

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('HIGH');
  const [newComplexity, setNewComplexity] = useState<MissionComplexity>('COMPLEX');
  const [newExpectedOutcome, setNewExpectedOutcome] = useState('');
  const [newSteps, setNewSteps] = useState<string>('1. Collecte et analyse des données de cadrage\n2. Exécution et tests de conformité en Sandbox [PARALLEL]\n3. Synthèse des livrables et archivage mémoire');
  const [newBudget, setNewBudget] = useState(5000);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  // AI Plan Generator helper
  const handleAiPlan = async () => {
    if (!newTitle.trim()) return;
    setIsAiPlanning(true);
    try {
      const res = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionTitle: newTitle,
          missionDescription: newDescription
        })
      });
      const data = await res.json();
      if (data.steps) {
        setNewSteps(data.steps.map((s: { title: string; risk?: string }, i: number) => `${i + 1}. ${s.title}${i === 1 ? ' [PARALLEL]' : ''}`).join('\n'));
        if (data.estimatedTokens) setNewBudget(data.estimatedTokens);
        if (data.suggestedDepartment) setNewDeptId(data.suggestedDepartment);
        if (!newExpectedOutcome) {
          setNewExpectedOutcome(`Livrables complets et conformes aux critères de sécurité Zero-Trust avec score >= 90%.`);
        }
      }
    } catch (e) {
      console.error("AI Plan Error:", e);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedSteps = newSteps
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const isParallel = line.includes('[PARALLEL]');
        const cleanTitle = line.replace(/^\d+[\.\)]\s*/, '').replace(/\[PARALLEL\]/g, '').trim();
        return { 
          title: cleanTitle, 
          toolUsed: 'tool-search-01',
          isParallel,
          dependsOn: idx > 0 && !isParallel ? [`step-${idx}`] : []
        };
      });

    onCreateTask({
      title: newTitle,
      description: newDescription || 'Mission planifiée par l\'Orchestrateur',
      departmentId: newDeptId,
      assignedAgentId: 'agent-dg-001',
      priority: newPriority,
      complexity: newComplexity,
      expectedOutcome: newExpectedOutcome || 'Exécution vérifiable de toutes les étapes.',
      status: 'IN_PROGRESS',
      tokensBudget: Number(newBudget) || 5000,
      steps: parsedSteps.length ? parsedSteps : [{ title: 'Exécution principale' }]
    });

    setNewTitle('');
    setNewDescription('');
    setNewExpectedOutcome('');
    setIsCreating(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL': return 'text-red-400 bg-red-950/60 border-red-800';
      case 'HIGH': return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'MEDIUM': return 'text-blue-400 bg-blue-950/60 border-blue-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getComplexityBadge = (c?: MissionComplexity) => {
    const comp = c || 'COMPLEX';
    switch (comp) {
      case 'SIMPLE': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">Simple</span>;
      case 'COMPLEX': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 rounded">Complexe (DAG)</span>;
      case 'COMPOSITE': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 rounded">Composite</span>;
      case 'LONG_TERM': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">Long Terme</span>;
      case 'EXPERIMENTAL': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 rounded">Expérimental</span>;
      case 'SENSITIVE': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800 rounded">Sensible (Gouvernance)</span>;
      default: return <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded">{comp}</span>;
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'COMPLETED': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Terminé</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 rounded-full flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> En cours</span>;
      case 'PLANNING': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 rounded-full">Planification</span>;
      case 'AWAITING_APPROVAL': return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 rounded-full flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Approbation</span>;
      default: return <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-full">{s}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* Left Column: Tasks List & Filters */}
      <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Pipeline des Missions & DAG</h2>
          </div>

          <button
            id="btn-create-task-open"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle Mission</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'AWAITING_APPROVAL'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === st 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : st === 'IN_PROGRESS' ? 'En cours' : st === 'COMPLETED' ? 'Terminées' : 'Approbation'}
            </button>
          ))}
        </div>

        {/* Task Creation Form Modal/Card */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="bg-slate-950 p-4 rounded-xl border border-blue-500/50 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Planifier avec l&apos;Orchestrateur
              </span>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Titre de la mission</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Analyse comparative des modèles 2026"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Complexité (Chapitre 6)</label>
                <select
                  value={newComplexity}
                  onChange={(e) => setNewComplexity(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SIMPLE">SIMPLE (1 étape)</option>
                  <option value="COMPOSITE">COMPOSITE (Séquence)</option>
                  <option value="COMPLEX">COMPLEX (DAG & Parallèle)</option>
                  <option value="LONG_TERM">LONG_TERM (Multi-phases)</option>
                  <option value="EXPERIMENTAL">EXPERIMENTAL (Sandbox)</option>
                  <option value="SENSITIVE">SENSITIVE (Zero Trust)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Priorité</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Résultat Attendu (Critères d&apos;Évaluation)</label>
              <input
                type="text"
                value={newExpectedOutcome}
                onChange={(e) => setNewExpectedOutcome(e.target.value)}
                placeholder="Ex: Rapport de synthèse structuré + 0 vulnérabilité"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400">Étapes décomposées (ajouter [PARALLEL] si parallèle)</label>
                <button
                  type="button"
                  onClick={handleAiPlan}
                  disabled={isAiPlanning || !newTitle.trim()}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                >
                  {isAiPlanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Auto-Décomposer avec Gemini
                </button>
              </div>
              <textarea
                rows={3}
                value={newSteps}
                onChange={(e) => setNewSteps(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow"
              >
                Créer & Démarrer
              </button>
            </div>
          </form>
        )}

        {/* Task Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredTasks.map(t => {
            const isSelected = t.id === selectedTask?.id;
            const dept = departments.find(d => d.id === t.departmentId);

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-950 border-blue-500/80 ring-1 ring-blue-500/30' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-slate-200 text-xs line-clamp-1">{t.title}</h3>
                  {getStatusBadge(t.status)}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">{t.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                    {getComplexityBadge(t.complexity)}
                  </div>
                  <span>{t.steps.filter(s => s.status === 'DONE').length}/{t.steps.length} étapes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Task Execution Studio */}
      <div className="lg:col-span-7 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        {selectedTask ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(selectedTask.priority)}`}>
                    Priorité {selectedTask.priority}
                  </span>
                  {getComplexityBadge(selectedTask.complexity)}
                  {getStatusBadge(selectedTask.status)}
                </div>
                <h2 className="text-base font-bold text-white">{selectedTask.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedTask.description}</p>
              </div>

              {/* Execution Actions */}
              <div className="flex items-center gap-2">
                {onEvaluateTask && selectedTask.status === 'COMPLETED' && (
                  <button
                    onClick={() => onEvaluateTask(selectedTask.id)}
                    disabled={isEvaluating}
                    className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 text-purple-400" />}
                    <span>Évaluer Indépendamment</span>
                  </button>
                )}

                <button
                  id="btn-run-full-task"
                  onClick={() => onRunFullTask(selectedTask.id)}
                  disabled={selectedTask.status === 'COMPLETED'}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Tout Exécuter</span>
                </button>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Progression</span>
                <span className="text-sm font-bold text-cyan-400">{selectedTask.progress}%</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Budget Tokens</span>
                <span className="text-sm font-bold text-purple-400">{selectedTask.tokensUsed} / {selectedTask.tokensBudget}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Responsable</span>
                <span className="text-sm font-bold text-slate-200">Directeur Général IA</span>
              </div>
            </div>

            {/* Independent Evaluation Card (Chapters 22 & 23) */}
            {selectedTask.evaluation && (
              <div className="bg-slate-950/90 rounded-xl p-4 border border-purple-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                    <Award className="w-4 h-4 text-purple-400" />
                    Évaluation Indépendante du Résultat (Chapitre 22 & 23)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                    Score : {selectedTask.evaluation.score}/100 • {selectedTask.evaluation.status}
                  </span>
                </div>

                <div className="text-slate-300 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">Résultat Obtenu vs Attendu :</strong>
                  {selectedTask.evaluation.expectedVsActual}
                </div>

                {selectedTask.evaluation.lessonsLearned && (
                  <div className="text-indigo-300 text-[11px] bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/40">
                    <strong className="text-indigo-200 block mb-0.5">Leçons & Amélioration Procédurale :</strong>
                    {selectedTask.evaluation.lessonsLearned}
                  </div>
                )}
              </div>
            )}

            {/* Steps Timeline & Step-by-Step execution */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  Étapes du Plan DAG ({selectedTask.steps.length})
                </h3>
                <span className="text-[10px] text-slate-500">Exécution contrôlée sous surveillance</span>
              </div>

              <div className="space-y-2.5">
                {selectedTask.steps.map((step, index) => {
                  const isDone = step.status === 'DONE';
                  const isRunning = step.status === 'RUNNING';
                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone 
                          ? 'bg-slate-950/40 border-emerald-900/50' 
                          : isRunning 
                            ? 'bg-blue-950/30 border-blue-500/60' 
                            : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isDone 
                              ? 'bg-emerald-500 text-slate-950' 
                              : isRunning 
                                ? 'bg-blue-500 text-white animate-pulse' 
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isDone ? '✓' : index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                              {step.isParallel && (
                                <span className="px-1.5 py-0.2 text-[9px] rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5" /> Parallèle
                                </span>
                              )}
                            </div>
                            {step.timestamp && (
                              <span className="text-[10px] text-slate-500">Horodatage : {step.timestamp}</span>
                            )}
                          </div>
                        </div>

                        {!isDone && (
                          <button
                            onClick={() => onExecuteStep(selectedTask.id, step.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium transition-colors shrink-0"
                          >
                            {isRunning ? 'En cours...' : 'Exécuter'}
                          </button>
                        )}
                      </div>

                      {step.output && (
                        <div className="mt-2.5 p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300">
                          {step.output}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <ListTodo className="w-8 h-8 mb-2 opacity-40" />
            <p>Sélectionnez une mission pour afficher le détail de son exécution.</p>
          </div>
        )}
      </div>
    </div>
  );
};

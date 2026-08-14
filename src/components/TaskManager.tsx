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
  Loader2
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Department, Agent, Tool } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  departments: Department[];
  agents: Agent[];
  tools: Tool[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'progress' | 'steps' | 'tokensUsed'> & { steps: { title: string; toolUsed?: string }[] }) => void;
  onExecuteStep: (taskId: string, stepId: string) => void;
  onRunFullTask: (taskId: string) => void;
  onApproveTask?: (taskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  departments,
  agents,
  tools,
  onCreateTask,
  onExecuteStep,
  onRunFullTask,
  onApproveTask
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
  const [newSteps, setNewSteps] = useState<string>('1. Collecte des données\n2. Traitement et validation\n3. Synthèse des livrables');
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
        setNewSteps(data.steps.map((s: { title: string }, i: number) => `${i + 1}. ${s.title}`).join('\n'));
        if (data.estimatedTokens) setNewBudget(data.estimatedTokens);
        if (data.suggestedDepartment) setNewDeptId(data.suggestedDepartment);
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
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(Boolean)
      .map(title => ({ title, toolUsed: 'tool-search-01' }));

    onCreateTask({
      title: newTitle,
      description: newDescription || 'Tâche initiée par l\'Orchestrateur',
      departmentId: newDeptId,
      assignedAgentId: 'agent-dg-001',
      priority: newPriority,
      status: 'IN_PROGRESS',
      tokensBudget: Number(newBudget) || 5000,
      steps: parsedSteps.length ? parsedSteps : [{ title: 'Exécution principale' }]
    });

    setNewTitle('');
    setNewDescription('');
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
            <h2 className="text-sm font-bold text-white">Pipeline des Tâches</h2>
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono font-semibold">
              {tasks.length}
            </span>
          </div>

          <button
            id="btn-open-create-task"
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle Mission</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {['ALL', 'IN_PROGRESS', 'PLANNING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStatus === st 
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Toutes' : st === 'IN_PROGRESS' ? 'En cours' : st === 'PLANNING' ? 'Planifiées' : 'Terminées'}
            </button>
          ))}
        </div>

        {/* Task Creation Form Modal / Card */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="p-4 bg-slate-950 rounded-xl border border-blue-500/40 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Créer une Mission Orchestrée
              </span>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Titre de la mission</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ex: Étude comparative des modèles de raisonnement 2026"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAiPlan}
                  disabled={!newTitle.trim() || isAiPlanning}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="Planifier automatiquement avec Gemini"
                >
                  {isAiPlanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Auto-Plan</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description / Objectifs</label>
              <textarea
                rows={2}
                placeholder="Précisez le résultat attendu..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Département</label>
                <select
                  value={newDeptId}
                  onChange={e => setNewDeptId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priorité</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Étapes d'exécution (1 par ligne)</label>
              <textarea
                rows={3}
                value={newSteps}
                onChange={e => setNewSteps(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
              >
                Lancer la mission
              </button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredTasks.map((t) => {
            const isSelected = t.id === selectedTaskId;
            const dept = departments.find(d => d.id === t.departmentId);
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{t.title}</h3>
                  {getStatusBadge(t.status)}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2.5">{t.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className={`px-1.5 py-0.5 rounded border font-semibold ${getPriorityColor(t.priority)}`}>
                    {t.priority}
                  </span>
                  {dept && (
                    <span className="text-slate-300 font-medium">{dept.code}</span>
                  )}
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
                  {getStatusBadge(selectedTask.status)}
                </div>
                <h2 className="text-base font-bold text-white">{selectedTask.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedTask.description}</p>
              </div>

              {/* Execution Actions */}
              <div className="flex items-center gap-2">
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

            {/* Metrics cards for this task */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Progression</span>
                <span className="text-sm font-bold text-cyan-400">{selectedTask.progress}%</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Tokens Alloués</span>
                <span className="text-sm font-bold text-purple-400">{selectedTask.tokensUsed} / {selectedTask.tokensBudget}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Agent Responsable</span>
                <span className="text-sm font-bold text-slate-200">Directeur Général</span>
              </div>
            </div>

            {/* Steps Timeline & Step-by-Step execution */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Étapes de la mission ({selectedTask.steps.length})
              </h3>

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
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone 
                              ? 'bg-emerald-500 text-slate-950' 
                              : isRunning 
                                ? 'bg-blue-500 text-white animate-pulse' 
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isDone ? '✓' : index + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                            {step.timestamp && (
                              <span className="text-[10px] text-slate-500">Horodatage : {step.timestamp}</span>
                            )}
                          </div>
                        </div>

                        {!isDone && (
                          <button
                            onClick={() => onExecuteStep(selectedTask.id, step.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium transition-colors"
                          >
                            {isRunning ? 'En cours...' : 'Exécuter étape'}
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

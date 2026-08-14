import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Layers, 
  Sparkles, 
  Settings, 
  Power, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  FolderPlus,
  Play,
  Pause
} from 'lucide-react';
import { Agent, Department, Tool, AgentRole, AgentStatus } from '../types';

interface AgentRegistryViewProps {
  agents: Agent[];
  departments: Department[];
  tools: Tool[];
  onCreateAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'metrics' | 'version'>) => void;
  onToggleAgentStatus: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onCreateDepartment: (dept: Omit<Department, 'id' | 'createdAt' | 'agentCount' | 'activeTasks'>) => void;
}

export const AgentRegistryView: React.FC<AgentRegistryViewProps> = ({
  agents,
  departments,
  tools,
  onCreateAgent,
  onToggleAgentStatus,
  onDeleteAgent,
  onCreateDepartment
}) => {
  const [activeView, setActiveView] = useState<'AGENTS' | 'DEPARTMENTS'>('AGENTS');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // New Agent Form
  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [role, setRole] = useState<AgentRole>('SPECIALIST');
  const [deptId, setDeptId] = useState(departments[0]?.id || '');
  const [specialty, setSpecialty] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('gemini-3.7-flash');
  const [selectedTools, setSelectedTools] = useState<string[]>(['tool-search-01']);

  // New Dept Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptColor, setDeptColor] = useState('#3B82F6');
  const [deptMission, setDeptMission] = useState('');

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !codeName.trim()) return;

    onCreateAgent({
      name,
      codeName: codeName.toUpperCase(),
      role,
      departmentId: deptId,
      status: 'ACTIVE',
      avatar: role === 'SPECIALIST' ? '🤖' : role === 'SECURITY_GUARD' ? '🛡️' : '🛠️',
      model,
      specialty: specialty || 'Spécialiste assigné',
      description: description || 'Sous-agent opérationnel créé sous gouvernance Zero Trust.',
      systemPrompt: `Tu es un sous-agent spécialisé (${codeName}). Tu opères sous l'autorité du Directeur Général.`,
      permissions: [
        { resource: 'LOCAL_TASK', action: 'EXECUTE', scope: 'LOCAL', requiresHumanApproval: false }
      ],
      toolsAllowed: selectedTools,
      memoryAccess: ['working', 'semantic']
    });

    setName('');
    setCodeName('');
    setSpecialty('');
    setDescription('');
    setIsCreatingAgent(false);
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    onCreateDepartment({
      name: deptName,
      code: deptCode.toUpperCase(),
      leadAgentId: 'agent-dg-001',
      color: deptColor,
      description: deptMission,
      mission: deptMission,
      level: departments.length
    });

    setDeptName('');
    setDeptCode('');
    setDeptMission('');
    setIsCreatingDept(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-300 shadow">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Registre des Agents & Départements</span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-700 rounded-full">
                Multi-Agent Runtime
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cycle de vie maîtrisé : Création dynamique sous gouvernance et budget maîtrisé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('AGENTS')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'AGENTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agents ({agents.length})
            </button>
            <button
              onClick={() => setActiveView('DEPARTMENTS')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'DEPARTMENTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Départements ({departments.length})
            </button>
          </div>

          {activeView === 'AGENTS' ? (
            <button
              id="btn-add-agent"
              onClick={() => setIsCreatingAgent(!isCreatingAgent)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Instancier un Sous-Agent</span>
            </button>
          ) : (
            <button
              id="btn-add-dept"
              onClick={() => setIsCreatingDept(!isCreatingDept)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Créer un Département</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Agent Modal / Form */}
      {isCreatingAgent && (
        <form onSubmit={handleAgentSubmit} className="p-4 bg-slate-950 rounded-xl border border-blue-500/40 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Instanciation d'un Nouveau Sous-Agent Spécialisé
            </span>
            <button type="button" onClick={() => setIsCreatingAgent(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Nom de l'agent</label>
              <input
                type="text"
                required
                placeholder="ex: Sentinelle Veille & Scraping"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Code / Identifiant unique</label>
              <input
                type="text"
                required
                placeholder="ex: AGENT-RESEARCH-02"
                value={codeName}
                onChange={e => setCodeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Rôle</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as AgentRole)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="SPECIALIST">Spécialiste Métier</option>
                <option value="DEPT_LEAD">Chef de Département</option>
                <option value="SECURITY_GUARD">Sentinelle Sécurité</option>
                <option value="TOOL_BUILDER">Créateur d'Outils</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Département d'affectation</label>
              <select
                value={deptId}
                onChange={e => setDeptId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Modèle d'IA</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Spécialité fonctionnelle & Mission</label>
            <input
              type="text"
              placeholder="ex: Extraction de données financières, nettoyage et synthèse"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingAgent(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md"
            >
              Déployer l'Agent
            </button>
          </div>
        </form>
      )}

      {/* Create Dept Modal */}
      {isCreatingDept && (
        <form onSubmit={handleDeptSubmit} className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              Création d'une Nouvelle Chambre / Département
            </span>
            <button type="button" onClick={() => setIsCreatingDept(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Nom du département</label>
              <input
                type="text"
                required
                placeholder="ex: Opérations & Automatisation"
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Code trigramme</label>
              <input
                type="text"
                required
                placeholder="ex: OPS"
                value={deptCode}
                onChange={e => setDeptCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mission stratégique</label>
            <textarea
              rows={2}
              placeholder="Décrivez les objectifs confiés à ce département..."
              value={deptMission}
              onChange={e => setDeptMission(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingDept(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md"
            >
              Enregistrer le Département
            </button>
          </div>
        </form>
      )}

      {/* Content: Agents Grid */}
      {activeView === 'AGENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {agents.map((agent) => {
            const isDirector = agent.role === 'DIRECTEUR_GENERAL';
            const dept = departments.find(d => d.id === agent.departmentId);
            const isPaused = agent.status === 'PAUSED';

            return (
              <div
                key={agent.id}
                className={`bg-slate-950/70 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md ${
                  isDirector 
                    ? 'border-blue-500/60 ring-1 ring-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-950/80' 
                    : isPaused 
                      ? 'border-slate-800 opacity-70' 
                      : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow">
                        {agent.avatar}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{agent.name}</span>
                          {isDirector && <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white font-semibold rounded">CEO</span>}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">{agent.codeName}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                      agent.status === 'ACTIVE' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    {agent.specialty}
                  </p>

                  {/* Telemetry metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 text-[10px] mb-3">
                    <div>
                      <span className="text-slate-500 block">Succès</span>
                      <span className="font-bold text-emerald-400">{agent.metrics.successRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tâches</span>
                      <span className="font-bold text-slate-200">{agent.metrics.tasksCompleted}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tokens</span>
                      <span className="font-bold text-purple-400">{agent.metrics.tokensConsumed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {dept ? dept.name : 'Direction Centrale'}
                  </span>

                  {!isDirector && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAgentStatus(agent.id)}
                        className="p-1 text-slate-400 hover:text-white"
                        title={isPaused ? 'Réactiver l\'agent' : 'Mettre en pause'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                      <button
                        onClick={() => onDeleteAgent(agent.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Archiver et supprimer l'agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Content: Departments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shadow"
                      style={{ backgroundColor: dept.color }}
                    />
                    <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                    {dept.code}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Agents affectés</span>
                  <span className="font-bold text-slate-200">{dept.agentCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Tâches en cours</span>
                  <span className="font-bold text-blue-400">{dept.activeTasks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

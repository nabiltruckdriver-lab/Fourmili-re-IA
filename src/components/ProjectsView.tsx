import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Lock, 
  Users, 
  Activity,
  ArrowRight,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Project, Agent, Department, Task } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId?: string;
  onSelectActiveProject: (projectId: string) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'tokensUsed' | 'metrics'>) => void;
  agents: Agent[];
  departments: Department[];
  tasks: Task[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectActiveProject,
  onCreateProject,
  agents,
  departments,
  tasks
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectObjective, setNewProjectObjective] = useState('');
  const [newProjectIsolation, setNewProjectIsolation] = useState<'STRICT' | 'SHARED_READ_ONLY' | 'FEDERATED'>('STRICT');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['agent-dg-001']);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(['dept-core']);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectCode.trim()) return;

    onCreateProject({
      name: newProjectName.trim(),
      code: newProjectCode.trim().toUpperCase(),
      description: newProjectDesc.trim() || 'Espace de projet dédié avec isolation des contextes.',
      objective: newProjectObjective.trim() || 'Objectif stratégique du projet.',
      status: 'ACTIVE',
      assignedAgentIds: selectedAgentIds,
      departmentIds: selectedDeptIds,
      taskIds: [],
      isolationPolicy: newProjectIsolation
    });

    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectCode('');
    setNewProjectDesc('');
    setNewProjectObjective('');
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.objective.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Isolation Principles (Chapter 36 & 37) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-950 text-blue-300 border border-blue-800">
                Chapitres 36 & 37 • Espaces Logiques & Ségrégation
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                Zero-Trust Context Isolation
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              Gestion des Projets & Isolation des Données
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Chaque projet dispose d&apos;un espace logique cloisonné. La chaîne d&apos;autorisation applique strictement :
              <code className="mx-1 text-xs px-1.5 py-0.5 rounded bg-slate-950 text-blue-300 font-mono">
                Utilisateur → Projet → Département → Agent → Permission → Ressource
              </code>
            </p>
          </div>

          <button
            id="btn-create-project-open"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nouveau Projet Cloisonné
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrer les projets par nom, code ou objectif..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            {projects.length} projet(s) configuré(s)
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const projectAgents = agents.filter(a => project.assignedAgentIds.includes(a.id));
          const projectDepts = departments.filter(d => project.departmentIds.includes(d.id));

          return (
            <div
              key={project.id}
              className={`rounded-2xl border p-5 transition-all shadow-lg relative ${
                isActive 
                  ? 'bg-slate-900/95 border-blue-500/80 shadow-blue-500/10 ring-1 ring-blue-500/30' 
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Active Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {project.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                      {project.name}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {project.code}
                      </span>
                    </h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      project.isolationPolicy === 'STRICT'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : project.isolationPolicy === 'SHARED_READ_ONLY'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      <Lock className="w-2.5 h-2.5" />
                      Isolation : {project.isolationPolicy}
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-select-project-${project.id}`}
                  onClick={() => onSelectActiveProject(project.id)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isActive ? '✓ Espace Actif' : 'Activer'}
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Strategic Objective */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-3">
                <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Objectif Stratégique Déclaré :
                </div>
                <div className="text-xs text-blue-200 font-medium italic">
                  &quot;{project.objective}&quot;
                </div>
              </div>

              {/* Metrics & Scope */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Agents Autorisés</div>
                  <div className="font-bold text-slate-200 text-sm mt-0.5">{projectAgents.length}</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Chambres / Dpt</div>
                  <div className="font-bold text-slate-200 text-sm mt-0.5">{projectDepts.length}</div>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400">Taux de Succès</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">{project.metrics?.successRate || 100}%</div>
                </div>
              </div>

              {/* Footer with Tokens and Tasks */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  {(project.tokensUsed || 0).toLocaleString()} tokens
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-400" />
                  {projectTasks.length} mission(s) liée(s)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-400" />
                Créer un Espace Projet Cloisonné
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom du Projet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Modernisation Pipeline Données"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Code Projet (Identifiant Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="PRJ-DATA-26"
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Politique d&apos;Isolation</label>
                  <select
                    value={newProjectIsolation}
                    onChange={(e) => setNewProjectIsolation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="STRICT">STRICT (Cloisonnement Total)</option>
                    <option value="SHARED_READ_ONLY">SHARED_READ_ONLY (Lecture seule partagée)</option>
                    <option value="FEDERATED">FEDERATED (Fédération contrôlée)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Objectif Stratégique Défini par l&apos;Utilisateur</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Concevoir un ETL temps réel avec validation Zero Trust et archivage automatique."
                  value={newProjectObjective}
                  onChange={(e) => setNewProjectObjective(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Périmètre Opérationnel</label>
                <textarea
                  rows={2}
                  placeholder="Détails du périmètre, contraintes et livrables attendus."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20"
                >
                  Valider & Créer l&apos;Espace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

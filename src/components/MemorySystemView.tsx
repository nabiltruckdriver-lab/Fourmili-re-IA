import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Tag, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Download, 
  BookOpen, 
  Brain, 
  Compass, 
  History,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types';

interface MemorySystemViewProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>) => void;
  onDeleteMemory: (memoryId: string) => void;
}

export const MemorySystemView: React.FC<MemorySystemViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('semantic');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImportance, setNewImportance] = useState<number>(4);

  const categories: { id: string; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'ALL', label: 'Toutes les partitions', icon: Database, color: 'text-slate-200', desc: 'Vue consolidée de l\'ensemble des connaissances' },
    { id: 'user', label: 'Mémoire Utilisateur', icon: Brain, color: 'text-blue-400', desc: 'Profils, préférences et objectifs stratégiques' },
    { id: 'projects', label: 'Mémoire Projets', icon: Compass, color: 'text-emerald-400', desc: 'Contextes de projets et feuilles de route' },
    { id: 'episodic', label: 'Mémoire Épisodique', icon: History, color: 'text-amber-400', desc: 'Historique des événements et résultats de missions' },
    { id: 'semantic', label: 'Mémoire Sémantique', icon: BookOpen, color: 'text-purple-400', desc: 'Faits vérifiés, concepts et index de connaissances' },
    { id: 'procedural', label: 'Mémoire Procédurale', icon: FileText, color: 'text-cyan-400', desc: 'Guides opérationnels, protocoles et playbooks' },
    { id: 'performance', label: 'Mémoire Performances', icon: Sparkles, color: 'text-pink-400', desc: 'Métriques, optimisations et retours d\'apprentissage' }
  ];

  const filteredMemories = memories.filter(m => {
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddMemory({
      category: newCategory,
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      importance: newImportance,
      confidenceScore: 0.98,
      sourceAgentId: 'agent-dg-001'
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAdding(false);
  };

  const exportMemoriesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fourmiliere-memory-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/80 flex items-center justify-center text-purple-300 shadow">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Système de Mémoire Persistante & Connaissances</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-900/60 text-purple-300 border border-purple-700 rounded-full">
                Vector Index Synced
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Isolation stricte • 6 partitions persistantes contextualisées et versionnées
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportMemoriesJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Exporter l'index mémoire"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sauvegarder JSON</span>
          </button>

          <button
            id="btn-add-memory"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enregistrer une Mémoire</span>
          </button>
        </div>
      </div>

      {/* Add Memory Modal / Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-slate-950 rounded-xl border border-purple-500/40 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Indexation d'une Nouvelle Mémoire Persistante
            </span>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Titre de la mémoire</label>
              <input
                type="text"
                required
                placeholder="ex: Directives budgétaires 2026"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Partition / Catégorie</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as MemoryCategory)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="user">Mémoire Utilisateur (Profil & Objectifs)</option>
                <option value="projects">Mémoire Projets</option>
                <option value="episodic">Mémoire Épisodique (Événements)</option>
                <option value="semantic">Mémoire Sémantique (Connaissances)</option>
                <option value="procedural">Mémoire Procédurale (Protocoles)</option>
                <option value="performance">Mémoire Performances</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Contenu textuel structuré</label>
            <textarea
              rows={3}
              required
              placeholder="Rédigez les détails précis à mémoriser durablement..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Tags (séparés par des virgules)</label>
              <input
                type="text"
                placeholder="sécurité, zero-trust, finance"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Importance (1 à 5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={newImportance}
                onChange={e => setNewImportance(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-md"
            >
              Sauvegarder dans la mémoire
            </button>
          </div>
        </form>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm' 
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par concept, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1">
        {filteredMemories.map((mem) => {
          const catInfo = categories.find(c => c.id === mem.category) || categories[0];
          const Icon = catInfo.icon;
          return (
            <div
              key={mem.id}
              className="bg-slate-950/70 border border-slate-800/90 hover:border-purple-500/40 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 group shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {catInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: mem.importance }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-[10px]">★</span>
                    ))}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  {mem.title}
                </h3>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  {mem.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <div className="flex flex-wrap items-center gap-1">
                  {mem.tags.map((tag, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span>Accès : {mem.accessCount}x</span>
                  <span>Confiance : {Math.round(mem.confidenceScore * 100)}%</span>
                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    title="Supprimer la mémoire"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

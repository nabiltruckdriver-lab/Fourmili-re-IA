import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  PowerOff, 
  Layers, 
  MessageSquare, 
  ListTodo, 
  Database, 
  Users, 
  Wrench, 
  Lock, 
  Monitor, 
  BarChart3,
  AlertTriangle,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  RefreshCw,
  FolderGit2,
  Sparkles
} from 'lucide-react';
import { AutonomyLevel, SystemState } from '../types';
import { User } from 'firebase/auth';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  systemState: SystemState;
  onToggleEmergency: () => void;
  onChangeAutonomy: (level: AutonomyLevel) => void;
  pendingApprovalsCount: number;
  user: User | null;
  isAuthLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  firestoreConnected: boolean;
  isSyncing: boolean;
  activeProjectCode?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  systemState,
  onToggleEmergency,
  onChangeAutonomy,
  pendingApprovalsCount,
  user,
  isAuthLoading,
  onLogin,
  onLogout,
  firestoreConnected,
  isSyncing,
  activeProjectCode = 'PRJ-CORE'
}) => {
  const tabs = [
    { id: '3d-colony', label: 'Fourmilière 3D', icon: Layers, badge: 'Live' },
    { id: 'director-chat', label: 'Directeur Général IA', icon: MessageSquare },
    { id: 'projects', label: 'Projets & Isolation', icon: FolderGit2, badge: activeProjectCode },
    { id: 'tasks-orchestrator', label: 'Orchestrateur & DAG', icon: ListTodo, badge: systemState.activeTasksCount ? `${systemState.activeTasksCount}` : undefined },
    { id: 'evolution', label: 'Évolution & Auto-Org', icon: Sparkles },
    { id: 'memory-system', label: 'Mémoire 6-Partitions', icon: Database },
    { id: 'agent-registry', label: 'Agents & Départements', icon: Users, badge: `${systemState.activeAgentsCount}` },
    { id: 'tool-sandbox', label: 'Outils & Sandbox', icon: Wrench },
    { id: 'governance', label: 'Zero Trust & Gouvernance', icon: Lock, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} req` : undefined, badgeColor: 'bg-amber-500' },
    { id: 'desktop-bridge', label: 'Passerelle Desktop', icon: Monitor },
    { id: 'analytics', label: 'Observabilité', icon: BarChart3 }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top Banner / Colony Health Bar */}
      <div className="px-4 py-2 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemState.emergencyLockdown ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemState.emergencyLockdown ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-300">
              {systemState.emergencyLockdown ? 'COLONIE EN ARRÊT D\'URGENCE' : 'COLONIE EN LIGNE (CLOUD-NATIVE)'}
            </span>
          </div>

          {/* Firestore Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
            <Cloud className={`w-3.5 h-3.5 ${firestoreConnected ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-[11px]">
              Firestore : <strong className={firestoreConnected ? 'text-amber-300' : 'text-slate-400'}>
                {firestoreConnected ? 'europe-west2 (Connecté)' : 'Initialisation...'}
              </strong>
            </span>
            {isSyncing && (
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin ml-1" title="Synchronisation Firestore active" />
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Zero Trust : <strong className="text-slate-200">Score {systemState.securityScore}%</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-3">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandbox : <strong className="text-emerald-300">{systemState.sandboxHealthScore}/100</strong></span>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-3">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Tokens consommés : <strong className="text-slate-200">{systemState.totalTokensUsed.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Right side controls: Autonomy selector + KillSwitch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Autonomie :</span>
            {(['SUPERVISED', 'BALANCED', 'AUTONOMOUS'] as AutonomyLevel[]).map((level) => {
              const active = systemState.autonomyLevel === level;
              const labels = { SUPERVISED: 'Supervisé', BALANCED: 'Équilibré', AUTONOMOUS: 'Autonome' };
              return (
                <button
                  key={level}
                  id={`autonomy-btn-${level.toLowerCase()}`}
                  onClick={() => onChangeAutonomy(level)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all ${
                    active 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labels[level]}
                </button>
              );
            })}
          </div>

          <button
            id="emergency-killswitch-btn"
            onClick={onToggleEmergency}
            title="Arrêt d'urgence immédiat de tous les agents"
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              systemState.emergencyLockdown
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/80'
            }`}
          >
            {systemState.emergencyLockdown ? (
              <>
                <PowerOff className="w-3.5 h-3.5" />
                <span>Rétablir la Colonie</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Arrêt d'Urgence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header & Tab Navigation */}
      <div className="px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white text-xl">
            🐜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Fourmilière IA</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60 rounded-full">
                SaaS Cloud-Native v1.0
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded-full flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Firebase Firestore
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Écosystème Évolutif Multi-Agents • Piloté par le Directeur Général
            </p>
          </div>
        </div>

        {/* Right Header Area: Evolution Stage + Google Auth */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400">Évolution :</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              ⭐ Étape {systemState.evolutionLevel}/6
            </span>
          </div>

          {/* User Profile / Google Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-lg">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Utilisateur'} 
                  className="w-6 h-6 rounded-full border border-slate-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-medium text-slate-200 truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 inline" /> Sync Firestore
                </p>
              </div>
              <button
                id="auth-logout-btn"
                onClick={onLogout}
                title="Déconnexion Firebase"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="auth-login-btn"
              onClick={onLogin}
              disabled={isAuthLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-sm transition-all border border-blue-400/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isAuthLoading ? 'Connexion...' : 'Connexion Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Scrollable Bar */}
      <div className="px-4 overflow-x-auto no-scrollbar border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-1 py-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    tab.badgeColor ? `${tab.badgeColor} text-white` : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


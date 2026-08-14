import React, { useState } from 'react';
import { 
  INITIAL_DIRECTOR_AGENT, 
  INITIAL_DEPARTMENTS, 
  INITIAL_TOOLS, 
  INITIAL_MEMORIES, 
  INITIAL_TASKS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_GOVERNANCE_REQUESTS, 
  EVOLUTION_STAGES, 
  INITIAL_SYSTEM_STATE, 
  INITIAL_CHAT_MESSAGES 
} from './data/initialState';
import { 
  Agent, 
  Department, 
  Task, 
  MemoryItem, 
  Tool, 
  AuditLog, 
  GovernanceRequest, 
  EvolutionStage, 
  SystemState, 
  ChatMessage, 
  AutonomyLevel 
} from './types';
import { Navigation } from './components/Navigation';
import { Anthill3D } from './components/Anthill3D';
import { DirectorGeneralChat } from './components/DirectorGeneralChat';
import { TaskManager } from './components/TaskManager';
import { MemorySystemView } from './components/MemorySystemView';
import { AgentRegistryView } from './components/AgentRegistryView';
import { ToolRegistryAndSandbox } from './components/ToolRegistryAndSandbox';
import { GovernanceAndZeroTrust } from './components/GovernanceAndZeroTrust';
import { DesktopBridgeView } from './components/DesktopBridgeView';
import { AnalyticsView } from './components/AnalyticsView';

export default function App() {
  // Global State
  const [currentTab, setCurrentTab] = useState<string>('3d-colony');
  const [systemState, setSystemState] = useState<SystemState>(INITIAL_SYSTEM_STATE);
  const [agents, setAgents] = useState<Agent[]>([INITIAL_DIRECTOR_AGENT]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [governanceRequests, setGovernanceRequests] = useState<GovernanceRequest[]>(INITIAL_GOVERNANCE_REQUESTS);
  const [evolutionStages, setEvolutionStages] = useState<EvolutionStage[]>(EVOLUTION_STAGES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Helper to add Zero Trust Audit Log
  const addAuditLog = (action: string, target: string, details: string, status: 'ALLOWED' | 'DENIED' = 'ALLOWED') => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: 'agent-dg-001',
      agentName: 'Directeur Général IA',
      action,
      target,
      status,
      details,
      ip: '10.0.4.12 (Zero-Trust VPC)',
      zeroTrustVerification: {
        authenticated: true,
        authorized: status === 'ALLOWED',
        rateLimitOk: true,
        signatureValid: true
      }
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Chat message sender (Calls Server-Side Gemini API)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'USER',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: chatMessages.slice(-6),
          colonyContext: {
            agentsCount: agents.length,
            evolutionLevel: systemState.evolutionLevel,
            autonomyLevel: systemState.autonomyLevel,
            tasksCount: tasks.filter(t => t.status === 'IN_PROGRESS').length
          }
        })
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-dg-${Date.now()}`,
        sender: 'DIRECTEUR_GENERAL',
        agentId: 'agent-dg-001',
        agentName: 'Directeur Général IA',
        content: data.reply || "Directive analysée et intégrée dans le plan de vol.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [],
        thoughtProcess: data.thoughtProcess
      };

      setChatMessages(prev => [...prev, aiMsg]);
      addAuditLog('CONVERSE_WITH_USER', 'Interaction Prompt', `Message traité par le Directeur Général : "${text.slice(0, 40)}..."`);
      
      // Update consumed tokens metric
      setSystemState(prev => ({
        ...prev,
        totalTokensUsed: prev.totalTokensUsed + (data.reply ? Math.round(data.reply.length * 1.5) : 350)
      }));

    } catch (e) {
      console.error("Chat error:", e);
      const fallbackMsg: ChatMessage = {
        id: `msg-dg-${Date.now()}`,
        sender: 'DIRECTEUR_GENERAL',
        agentId: 'agent-dg-001',
        agentName: 'Directeur Général IA',
        content: `J'ai bien reçu votre consigne : "${text}".\n\nNos mécanismes d'orchestration sont prêts. Souhaitez-vous que je crée une tâche dans l'Orchestrateur pour lancer l'exécution ?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Créer une mission dans l\'Orchestrateur', action: 'CREATE_TASK', payload: { title: text } }
        ],
        thoughtProcess: 'Réponse locale de résilience active.'
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Execute chat action suggestion
  const handleExecuteSuggestedAction = (action: string, payload?: Record<string, unknown>) => {
    if (action === 'VIEW_3D') {
      setCurrentTab('3d-colony');
    } else if (action === 'VIEW_GOVERNANCE') {
      setCurrentTab('governance');
    } else if (action === 'VIEW_MEMORY') {
      setCurrentTab('memory-system');
    } else if (action === 'START_MISSION' || action === 'CREATE_TASK') {
      const title = (payload?.title as string) || "Nouvelle mission stratégique";
      handleCreateTask({
        title,
        description: "Mission planifiée par le Directeur Général",
        departmentId: 'dept-dev',
        assignedAgentId: 'agent-dg-001',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        tokensBudget: 6000,
        steps: [
          { title: "Cadrage et extraction des données", toolUsed: 'tool-search-01' },
          { title: "Test et validation en Sandbox", toolUsed: 'tool-code-02' },
          { title: "Enregistrement dans la mémoire persistante", toolUsed: 'tool-mem-03' }
        ]
      });
      setCurrentTab('tasks-orchestrator');
    }
  };

  // Task creation handler
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'progress' | 'steps' | 'tokensUsed'> & { steps: { title: string; toolUsed?: string }[] }) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      progress: 0,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
      steps: newTaskData.steps.map((s, idx) => ({
        id: `step-${idx + 1}`,
        title: s.title,
        toolUsed: s.toolUsed || 'tool-search-01',
        status: idx === 0 ? 'RUNNING' : 'PENDING'
      }))
    };

    setTasks(prev => [newTask, ...prev]);
    setSystemState(prev => ({
      ...prev,
      activeTasksCount: prev.activeTasksCount + 1
    }));

    addAuditLog('CREATE_TASK', newTask.title, `Mission orchestrée créée sous priorité ${newTask.priority}`);
  };

  // Step execution runner
  const handleExecuteStep = (taskId: string, stepId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const updatedSteps = task.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: 'DONE' as const,
            output: `Exécution réussie sous Zero-Trust (${step.toolUsed || 'outil'}). Résultat validé sans anomalie.`,
            timestamp: new Date().toLocaleTimeString()
          };
        }
        return step;
      });

      const doneCount = updatedSteps.filter(s => s.status === 'DONE').length;
      const progress = Math.round((doneCount / updatedSteps.length) * 100);
      const isFinished = progress === 100;

      return {
        ...task,
        steps: updatedSteps,
        progress,
        status: isFinished ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
        tokensUsed: task.tokensUsed + 750
      };
    }));

    addAuditLog('EXECUTE_TASK_STEP', `Task ${taskId} / ${stepId}`, 'Étape de mission exécutée avec succès.');
  };

  // Run full task simulation
  const handleRunFullTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const allDoneSteps = task.steps.map((step, idx) => ({
        ...step,
        status: 'DONE' as const,
        output: `Validation complète de l'étape ${idx + 1}.`,
        timestamp: new Date().toLocaleTimeString()
      }));

      return {
        ...task,
        steps: allDoneSteps,
        progress: 100,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
        tokensUsed: task.tokensBudget
      };
    }));

    // Add outcome to episodic memory
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      handleAddMemory({
        category: 'episodic',
        title: `Résultat de mission : ${targetTask.title}`,
        content: `La mission a été menée à terme par l'orchestrateur avec 100% des étapes validées. Tokens consommés : ${targetTask.tokensBudget}.`,
        tags: ['mission-terminée', 'orchestration', 'succès'],
        importance: 4,
        confidenceScore: 0.99,
        sourceAgentId: 'agent-dg-001'
      });
    }

    addAuditLog('RUN_FULL_TASK', taskId, 'Exécution complète de la mission achevée avec succès.');
  };

  // Memory additions
  const handleAddMemory = (newMemData: Omit<MemoryItem, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>) => {
    const newMem: MemoryItem = {
      ...newMemData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      accessCount: 1
    };
    setMemories(prev => [newMem, ...prev]);
    addAuditLog('ADD_MEMORY', newMem.title, `Nouvelle mémoire indexée dans la partition [${newMem.category}]`);
  };

  // Memory deletion
  const handleDeleteMemory = (memId: string) => {
    setMemories(prev => prev.filter(m => m.id !== memId));
    addAuditLog('DELETE_MEMORY', memId, 'Mémoire purgée selon la politique de rétention.');
  };

  // Agent Creation
  const handleCreateAgent = (newAgentData: Omit<Agent, 'id' | 'createdAt' | 'metrics' | 'version'>) => {
    const newAgent: Agent = {
      ...newAgentData,
      id: `agent-${Date.now()}`,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      metrics: {
        tasksCompleted: 0,
        successRate: 100,
        avgExecutionTimeMs: 450,
        tokensConsumed: 0,
        errorCount: 0,
        lastActive: new Date().toISOString()
      }
    };

    setAgents(prev => [...prev, newAgent]);
    setSystemState(prev => ({
      ...prev,
      activeAgentsCount: prev.activeAgentsCount + 1,
      evolutionLevel: Math.max(prev.evolutionLevel, 5)
    }));

    // Mark Stage 5 as achieved
    setEvolutionStages(prev => prev.map(s => s.level === 5 ? { ...s, achieved: true } : s));

    addAuditLog('INSTANTIATE_AGENT', newAgent.name, `Sous-agent instancié sous rôle ${newAgent.role} dans le département ${newAgent.departmentId}`);
  };

  // Agent status toggle
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const nextStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      addAuditLog('TOGGLE_AGENT_STATUS', a.name, `Statut modifié vers ${nextStatus}`);
      return { ...a, status: nextStatus };
    }));
  };

  // Agent deletion
  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    setSystemState(prev => ({ ...prev, activeAgentsCount: Math.max(1, prev.activeAgentsCount - 1) }));
    addAuditLog('DELETE_AGENT', agentId, 'Sous-agent révoqué et supprimé du registre.');
  };

  // Department creation
  const handleCreateDepartment = (deptData: Omit<Department, 'id' | 'createdAt' | 'agentCount' | 'activeTasks'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agentCount: 0,
      activeTasks: 0
    };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('CREATE_DEPARTMENT', newDept.name, `Chambre départementale créée avec code ${newDept.code}`);
  };

  // Tool addition
  const handleAddTool = (toolData: Omit<Tool, 'id' | 'usageCount'>) => {
    const newTool: Tool = {
      ...toolData,
      id: `tool-${Date.now()}`,
      usageCount: 0
    };
    setTools(prev => [...prev, newTool]);
    addAuditLog('ADD_TOOL_SANDBOX', newTool.name, 'Outil enregistré dans le banc d\'essai Sandbox.');
  };

  // Promote tool to Production
  const handlePromoteTool = (toolId: string) => {
    setTools(prev => prev.map(t => {
      if (t.id !== toolId) return t;
      return { ...t, status: 'PRODUCTION' as const, version: '1.0.0-prod' };
    }));
    addAuditLog('PROMOTE_TOOL_PRODUCTION', toolId, 'Outil validé et déployé en production après test hermétique en Sandbox.');
  };

  // Governance Request Approval
  const handleApproveRequest = (requestId: string) => {
    const targetReq = governanceRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    setGovernanceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' as const } : r));

    if (targetReq.actionType === 'CREATE_AGENT' && targetReq.payload) {
      handleCreateAgent({
        name: (targetReq.payload.proposedName as string) || 'Sentinelle Spécialiste',
        codeName: 'AGENT-SPEC-01',
        role: 'SPECIALIST',
        departmentId: 'dept-research',
        status: 'ACTIVE',
        avatar: '🤖',
        model: 'gemini-3.7-flash',
        specialty: 'Recherche documentaire et analyse approfondie',
        description: 'Sous-agent instancié sous approbation humaine explicite.',
        systemPrompt: 'Tu es un sous-agent de recherche spécialisé.',
        permissions: [
          { resource: 'LOCAL_TASK', action: 'EXECUTE', scope: 'LOCAL', requiresHumanApproval: false }
        ],
        toolsAllowed: ['tool-search-01', 'tool-mem-03'],
        memoryAccess: ['working', 'semantic']
      });
    }

    addAuditLog('HUMAN_APPROVAL_GRANTED', targetReq.title, `Autorisation accordée par l'utilisateur pour l'action ${targetReq.actionType}`);
  };

  // Governance Request Rejection
  const handleRejectRequest = (requestId: string) => {
    setGovernanceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' as const } : r));
    addAuditLog('HUMAN_APPROVAL_REJECTED', requestId, 'Action refusée par l\'autorité humaine.', 'DENIED');
  };

  // Change autonomy level
  const handleChangeAutonomy = (level: AutonomyLevel) => {
    setSystemState(prev => ({ ...prev, autonomyLevel: level }));
    addAuditLog('CHANGE_AUTONOMY_LEVEL', level, `Niveau d'autonomie ajusté sur ${level}`);
  };

  // Toggle Emergency Lockdown
  const handleToggleEmergency = () => {
    setSystemState(prev => {
      const nextLock = !prev.emergencyLockdown;
      addAuditLog('EMERGENCY_LOCKDOWN', 'Colony Core', nextLock ? 'Arrêt d\'urgence enclenché !' : 'Colonie réarmée et opérationnelle.', nextLock ? 'DENIED' : 'ALLOWED');
      return { ...prev, emergencyLockdown: nextLock };
    });
  };

  // Toggle Desktop Bridge connection
  const handleToggleDesktopBridge = () => {
    setSystemState(prev => ({ ...prev, desktopBridgeConnected: !prev.desktopBridgeConnected }));
    addAuditLog('DESKTOP_BRIDGE_TOGGLE', 'Desktop Gateway', 'Statut du pont client Desktop synchronisé.');
  };

  const directorAgent = agents.find(a => a.role === 'DIRECTEUR_GENERAL') || agents[0];
  const pendingApprovalsCount = governanceRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation & Colony Status Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        systemState={systemState}
        onToggleEmergency={handleToggleEmergency}
        onChangeAutonomy={handleChangeAutonomy}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {currentTab === '3d-colony' && (
          <Anthill3D
            agents={agents}
            departments={departments}
            tasks={tasks}
            memories={memories}
            tools={tools}
            onSelectAgent={() => setCurrentTab('agent-registry')}
            onSelectTask={() => setCurrentTab('tasks-orchestrator')}
          />
        )}

        {currentTab === 'director-chat' && (
          <DirectorGeneralChat
            messages={chatMessages}
            directorAgent={directorAgent}
            systemState={systemState}
            onSendMessage={handleSendMessage}
            onExecuteSuggestedAction={handleExecuteSuggestedAction}
            isLoading={isChatLoading}
          />
        )}

        {currentTab === 'tasks-orchestrator' && (
          <TaskManager
            tasks={tasks}
            departments={departments}
            agents={agents}
            tools={tools}
            onCreateTask={handleCreateTask}
            onExecuteStep={handleExecuteStep}
            onRunFullTask={handleRunFullTask}
          />
        )}

        {currentTab === 'memory-system' && (
          <MemorySystemView
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {currentTab === 'agent-registry' && (
          <AgentRegistryView
            agents={agents}
            departments={departments}
            tools={tools}
            onCreateAgent={handleCreateAgent}
            onToggleAgentStatus={handleToggleAgentStatus}
            onDeleteAgent={handleDeleteAgent}
            onCreateDepartment={handleCreateDepartment}
          />
        )}

        {currentTab === 'tool-sandbox' && (
          <ToolRegistryAndSandbox
            tools={tools}
            onAddTool={handleAddTool}
            onPromoteTool={handlePromoteTool}
          />
        )}

        {currentTab === 'governance' && (
          <GovernanceAndZeroTrust
            governanceRequests={governanceRequests}
            auditLogs={auditLogs}
            systemState={systemState}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onChangeAutonomy={handleChangeAutonomy}
          />
        )}

        {currentTab === 'desktop-bridge' && (
          <DesktopBridgeView
            systemState={systemState}
            onToggleBridgeConnection={handleToggleDesktopBridge}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            systemState={systemState}
            evolutionStages={evolutionStages}
            agents={agents}
            departments={departments}
          />
        )}
      </main>
    </div>
  );
}

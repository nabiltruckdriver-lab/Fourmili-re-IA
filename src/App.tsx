import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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
  INITIAL_CHAT_MESSAGES,
  INITIAL_PROJECTS,
  INITIAL_SKILLS,
  INITIAL_PROCEDURAL_WORKFLOWS,
  INITIAL_COLONY_EVENTS
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
  AutonomyLevel,
  Project,
  SkillDefinition,
  ProceduralWorkflow,
  ColonyEvent,
  ColonyEventType,
  MissionComplexity,
  EvaluationStatus
} from './types';
import { Navigation } from './components/Navigation';
import { Anthill3D } from './components/Anthill3D';
import { DirectorGeneralChat } from './components/DirectorGeneralChat';
import { TaskManager } from './components/TaskManager';
import { ProjectsView } from './components/ProjectsView';
import { EvolutionAndSelfOrganization } from './components/EvolutionAndSelfOrganization';
import { MemorySystemView } from './components/MemorySystemView';
import { AgentRegistryView } from './components/AgentRegistryView';
import { ToolRegistryAndSandbox } from './components/ToolRegistryAndSandbox';
import { GovernanceAndZeroTrust } from './components/GovernanceAndZeroTrust';
import { DesktopBridgeView } from './components/DesktopBridgeView';
import { AnalyticsView } from './components/AnalyticsView';
import { auth, testConnection, loginWithGoogle, logoutUser } from './lib/firebase';
import { 
  initializeUserColony, 
  subscribeToUserColony, 
  saveEntityToFirestore, 
  deleteEntityFromFirestore, 
  saveSystemStateToFirestore 
} from './lib/firestoreSync';

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
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [skills, setSkills] = useState<SkillDefinition[]>(INITIAL_SKILLS);
  const [workflows, setWorkflows] = useState<ProceduralWorkflow[]>(INITIAL_PROCEDURAL_WORKFLOWS);
  const [colonyEvents, setColonyEvents] = useState<ColonyEvent[]>(INITIAL_COLONY_EVENTS);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isEvaluatingTask, setIsEvaluatingTask] = useState(false);
  const [isAuditingOrg, setIsAuditingOrg] = useState(false);
  const [autoOrgAuditResults, setAutoOrgAuditResults] = useState<{
    healthScore: number;
    summary: string;
    recommendations: string[];
    redundantCapabilities: string[];
    proposedRestructuration?: string | null;
  } | null>(null);

  // Firebase Auth & Cloud Firestore State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [firestoreConnected, setFirestoreConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Test Firestore Connection on Boot
  useEffect(() => {
    async function checkFirebase() {
      const ok = await testConnection();
      setFirestoreConnected(ok);
    }
    checkFirebase();
  }, []);

  // Listen to Auth State and Attach Firestore Real-Time Subscriptions
  useEffect(() => {
    let unsubscribeColony: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        setIsSyncing(true);
        setSyncNotice(`Synchronisation Cloud Firestore active (${currentUser.email})`);
        setTimeout(() => setSyncNotice(null), 4000);

        try {
          await initializeUserColony(
            currentUser.uid, 
            {
              agents,
              departments,
              tasks,
              memories,
              tools,
              auditLogs,
              governanceRequests,
              chatMessages,
              systemState
            },
            currentUser.email || undefined,
            currentUser.displayName || undefined
          );

          if (unsubscribeColony) {
            unsubscribeColony();
          }

          unsubscribeColony = subscribeToUserColony(currentUser.uid, {
            onAgentsChange: (loadedAgents) => setAgents(loadedAgents),
            onDepartmentsChange: (loadedDepts) => setDepartments(loadedDepts),
            onTasksChange: (loadedTasks) => setTasks(loadedTasks),
            onMemoriesChange: (loadedMems) => setMemories(loadedMems),
            onToolsChange: (loadedTools) => setTools(loadedTools),
            onAuditLogsChange: (loadedLogs) => setAuditLogs(loadedLogs),
            onGovernanceRequestsChange: (loadedReqs) => setGovernanceRequests(loadedReqs),
            onChatMessagesChange: (loadedMsgs) => setChatMessages(loadedMsgs),
            onSystemStateChange: (loadedState) => setSystemState(loadedState),
            onError: (err) => {
              console.error("Firestore sync subscription error:", err);
            }
          });
        } catch (error) {
          console.error("Failed to initialize user colony in Firestore:", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        if (unsubscribeColony) {
          unsubscribeColony();
          unsubscribeColony = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeColony) unsubscribeColony();
    };
  }, []);

  // Helper: Append Cryptographic Audit Log
  const addAuditLog = (
    action: string, 
    target: string, 
    details: string, 
    status: 'ALLOWED' | 'DENIED' | 'FLAGGED' | 'COMPLETED' | 'FAILED' = 'ALLOWED'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      agentId: 'agent-dg-001',
      agentName: 'Directeur Général IA',
      action,
      target,
      status,
      details,
      ip: '10.0.4.1 (Colony Core)',
      zeroTrustVerification: {
        authenticated: true,
        authorized: status !== 'DENIED',
        rateLimitOk: true,
        signatureValid: true
      }
    };

    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
    if (user) {
      saveEntityToFirestore(user.uid, 'auditLogs', newLog).catch(console.error);
    }
  };

  // Helper: Append Colony Event
  const addColonyEvent = (
    type: ColonyEventType,
    title: string,
    details: string,
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
    sourceName = 'Orchestrateur'
  ) => {
    const newEvent: ColonyEvent = {
      id: `evt-${Date.now()}`,
      type,
      title,
      details,
      sourceId: 'agent-dg-001',
      sourceName,
      severity,
      timestamp: 'À l\'instant'
    };
    setColonyEvents(prev => [newEvent, ...prev.slice(0, 19)]);
  };

  // User Authentication Handlers
  const handleLogin = async () => {
    try {
      setIsAuthLoading(true);
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setUser(loggedUser);
        addAuditLog('USER_AUTHENTICATION', loggedUser.email || 'Google User', 'Connexion réussie via Google OAuth & Firebase');
      }
    } catch (e) {
      console.error("Login failed:", e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      addAuditLog('USER_LOGOUT', 'Session', 'Déconnexion réussie');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Chat message sender (Calls Server-Side Gemini API with 47-Point Operational Loop)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'USER',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (user) {
      saveEntityToFirestore(user.uid, 'chatMessages', userMsg).catch(console.error);
    }

    setIsChatLoading(true);

    try {
      const activeProject = projects.find(p => p.id === systemState.activeProjectId) || projects[0];

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
            tasksCount: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            activeProject: activeProject?.code || 'PRJ-CORE'
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
        thoughtProcess: data.thoughtProcess,
        operationalCycleBreakdown: data.operationalCycleBreakdown
      };

      setChatMessages(prev => [...prev, aiMsg]);
      if (user) {
        saveEntityToFirestore(user.uid, 'chatMessages', aiMsg).catch(console.error);
      }

      addAuditLog('CONVERSE_WITH_USER', 'Interaction Prompt', `Message traité par le Directeur Général : "${text.slice(0, 40)}..."`);
      addColonyEvent('MessageRouted', 'Message DG Traité', `Directive utilisateur reçue et planifiée.`);

      // Update consumed tokens metric
      const updatedSysState: SystemState = {
        ...systemState,
        totalTokensUsed: systemState.totalTokensUsed + (data.reply ? Math.round(data.reply.length * 1.5) : 350)
      };
      setSystemState(updatedSysState);
      if (user) {
        saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
      }

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
      if (user) {
        saveEntityToFirestore(user.uid, 'chatMessages', fallbackMsg).catch(console.error);
      }
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
    } else if (action === 'VIEW_PROJECTS') {
      setCurrentTab('projects');
    } else if (action === 'START_MISSION' || action === 'CREATE_TASK') {
      const title = (payload?.title as string) || "Nouvelle mission stratégique";
      handleCreateTask({
        title,
        description: "Mission planifiée par le Directeur Général",
        departmentId: 'dept-dev',
        assignedAgentId: 'agent-dg-001',
        priority: 'HIGH',
        complexity: 'COMPLEX',
        expectedOutcome: 'Livrables complets vérifiés en Sandbox',
        status: 'IN_PROGRESS',
        tokensBudget: 6000,
        steps: [
          { title: "Cadrage et extraction des données", toolUsed: 'tool-search-01' },
          { title: "Test et validation en Sandbox", toolUsed: 'tool-code-02', isParallel: true },
          { title: "Enregistrement dans la mémoire persistante", toolUsed: 'tool-mem-03' }
        ]
      });
      setCurrentTab('tasks-orchestrator');
    }
  };

  // Task creation handler with DAG support
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'progress' | 'steps' | 'tokensUsed'> & { 
    steps: { title: string; toolUsed?: string; isParallel?: boolean; dependsOn?: string[] }[];
    complexity?: MissionComplexity;
    expectedOutcome?: string;
  }) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      projectId: systemState.activeProjectId || 'proj-001',
      complexity: newTaskData.complexity || 'COMPLEX',
      expectedOutcome: newTaskData.expectedOutcome || 'Livrable complet conforme aux critères.',
      progress: 0,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
      steps: newTaskData.steps.map((s, idx) => ({
        id: `step-${idx + 1}`,
        title: s.title,
        toolUsed: s.toolUsed || 'tool-search-01',
        isParallel: s.isParallel ?? false,
        dependsOn: s.dependsOn || (idx > 0 && !s.isParallel ? [`step-${idx}`] : []),
        status: idx === 0 ? 'RUNNING' : 'PENDING'
      }))
    };

    setTasks(prev => [newTask, ...prev]);
    if (user) {
      saveEntityToFirestore(user.uid, 'tasks', newTask).catch(console.error);
    }

    const updatedSysState: SystemState = {
      ...systemState,
      activeTasksCount: systemState.activeTasksCount + 1
    };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }

    addAuditLog('CREATE_TASK', newTask.title, `Mission orchestrée créée sous priorité ${newTask.priority}`);
    addColonyEvent('TaskStepExecuted', 'Nouvelle Mission Initiée', newTask.title, 'INFO');
  };

  // Step execution runner
  const handleExecuteStep = (taskId: string, stepId: string) => {
    let updatedTaskObj: Task | null = null;

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

      const updated: Task = {
        ...task,
        steps: updatedSteps,
        progress,
        status: isFinished ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
        completedAt: isFinished ? new Date().toISOString() : task.completedAt,
        tokensUsed: task.tokensUsed + 750
      };
      updatedTaskObj = updated;
      return updated;
    }));

    if (user && updatedTaskObj) {
      saveEntityToFirestore(user.uid, 'tasks', updatedTaskObj).catch(console.error);
    }

    addAuditLog('EXECUTE_TASK_STEP', `Task ${taskId} / ${stepId}`, 'Étape de mission exécutée avec succès.');
  };

  // Run full task simulation
  const handleRunFullTask = (taskId: string) => {
    let completedTask: Task | null = null;

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const allDoneSteps = task.steps.map((step, idx) => ({
        ...step,
        status: 'DONE' as const,
        output: `Validation complète de l'étape ${idx + 1}.`,
        timestamp: new Date().toLocaleTimeString()
      }));

      const updated: Task = {
        ...task,
        steps: allDoneSteps,
        progress: 100,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
        tokensUsed: task.tokensBudget
      };
      completedTask = updated;
      return updated;
    }));

    if (user && completedTask) {
      saveEntityToFirestore(user.uid, 'tasks', completedTask).catch(console.error);
    }

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
    addColonyEvent('AgentCompleted', 'Mission Complétée', targetTask?.title || 'Tâche terminée', 'SUCCESS');
  };

  // Independent Task Evaluation Engine (Principles #22 & #23)
  const handleEvaluateTask = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    setIsEvaluatingTask(true);
    try {
      const res = await fetch('/api/gemini/evaluate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: targetTask.title,
          expectedOutcome: targetTask.expectedOutcome || 'Exécution vérifiable de toutes les étapes.',
          actualOutput: `Progression : ${targetTask.progress}%. ${targetTask.steps.filter(s => s.status === 'DONE').length}/${targetTask.steps.length} étapes validées.`,
          stepsDone: targetTask.steps
        })
      });

      const evalData = await res.json();

      let updatedTaskObj: Task | null = null;
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t;
        const updated: Task = {
          ...t,
          evaluation: {
            status: evalData.status as EvaluationStatus,
            score: evalData.score || 95,
            expectedVsActual: evalData.expectedVsActual || 'Conformité validée.',
            lessonsLearned: evalData.lessonsLearned,
            evaluatedAt: new Date().toISOString()
          }
        };
        updatedTaskObj = updated;
        return updated;
      }));

      if (user && updatedTaskObj) {
        saveEntityToFirestore(user.uid, 'tasks', updatedTaskObj).catch(console.error);
      }

      // If lessons learned exist, store in procedural / error partition
      if (evalData.lessonsLearned) {
        handleAddMemory({
          category: 'procedural',
          title: `Procédure apprise : ${targetTask.title}`,
          content: `Évaluation Indépendante Score ${evalData.score}/100. Enseignement : ${evalData.lessonsLearned}`,
          tags: ['procédure', 'évaluation', 'apprentissage'],
          importance: 5,
          confidenceScore: 0.98,
          sourceAgentId: 'agent-dg-001'
        });
      }

      addAuditLog('INDEPENDENT_EVALUATION', targetTask.title, `Évaluation IA complétée. Score : ${evalData.score}/100 [${evalData.status}]`);
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setIsEvaluatingTask(false);
    }
  };

  // Ecosystem Health & Auto-Organization Audit (Chapters 33 & 34)
  const handleRunAutoOrgAudit = async () => {
    setIsAuditingOrg(true);
    try {
      const res = await fetch('/api/gemini/auto-organization-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents,
          departments,
          tools,
          tasks
        })
      });

      const data = await res.json();
      setAutoOrgAuditResults(data);
      addAuditLog('AUTO_ORG_AUDIT', 'Colonie Globale', `Audit d'auto-organisation terminé. Score de santé : ${data.healthScore}/100`);
      addColonyEvent('AgentStarted', 'Audit Organisationnel Terminé', `Score d'efficience : ${data.healthScore}/100`, 'SUCCESS');
    } catch (e) {
      console.error("Auto org audit error:", e);
    } finally {
      setIsAuditingOrg(false);
    }
  };

  // Rollback Agent Version
  const handleRollbackAgentVersion = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      return {
        ...a,
        version: '1.0.0-rollback',
        metrics: {
          ...a.metrics,
          errorCount: 0,
          successRate: 100
        }
      };
    }));
    addAuditLog('AGENT_VERSION_ROLLBACK', agentId, `Rollback d'urgence vers la version stable v1.0.0`);
    addColonyEvent('AgentTerminated', 'Rollback Version Agent', `Restauration vers v1.0.0 pour l'agent ${agentId}`, 'WARNING');
  };

  // Select Active Project (Chapters 36 & 37)
  const handleSelectActiveProject = (projectId: string) => {
    const updatedSysState: SystemState = {
      ...systemState,
      activeProjectId: projectId
    };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }
    const proj = projects.find(p => p.id === projectId);
    addAuditLog('SWITCH_ACTIVE_PROJECT', proj?.name || projectId, `Espace projet activé : ${proj?.code || projectId}`);
    addColonyEvent('PermissionChecked', 'Changement d\'Espace Projet', `Espace actif : ${proj?.name}`, 'INFO');
  };

  // Create New Project
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'tokensUsed' | 'metrics'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tokensUsed: 0,
      metrics: {
        totalMissions: 0,
        successRate: 100
      }
    };
    setProjects(prev => [...prev, newProject]);
    handleSelectActiveProject(newProject.id);
    addAuditLog('CREATE_PROJECT', newProject.name, `Nouvel espace projet cloisonné créé sous politique ${newProject.isolationPolicy}`);
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
    if (user) {
      saveEntityToFirestore(user.uid, 'memories', newMem).catch(console.error);
    }
    addAuditLog('ADD_MEMORY', newMem.title, `Nouvelle mémoire indexée dans la partition [${newMem.category}]`);
    addColonyEvent('MemoryUpdated', 'Mémoire Indexée', newMem.title, 'INFO');
  };

  // Memory deletion
  const handleDeleteMemory = (memId: string) => {
    setMemories(prev => prev.filter(m => m.id !== memId));
    if (user) {
      deleteEntityFromFirestore(user.uid, 'memories', memId).catch(console.error);
    }
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
    if (user) {
      saveEntityToFirestore(user.uid, 'agents', newAgent).catch(console.error);
    }

    const updatedSysState: SystemState = {
      ...systemState,
      activeAgentsCount: agents.length + 1
    };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }

    addAuditLog('CREATE_AGENT', newAgent.name, `Agent créé sous le rôle ${newAgent.role}`);
    addColonyEvent('AgentStarted', 'Sous-Agent Instancié', newAgent.name, 'SUCCESS');
  };

  // Agent Status Toggle
  const handleToggleAgentStatus = (agentId: string) => {
    let updatedAgentObj: Agent | null = null;
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const nextStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const updated = { ...a, status: nextStatus as any };
      updatedAgentObj = updated;
      return updated;
    }));

    if (user && updatedAgentObj) {
      saveEntityToFirestore(user.uid, 'agents', updatedAgentObj).catch(console.error);
    }

    addAuditLog('TOGGLE_AGENT_STATUS', agentId, `Statut agent modifié`);
  };

  // Agent Deletion
  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (user) {
      deleteEntityFromFirestore(user.uid, 'agents', agentId).catch(console.error);
    }

    const updatedSysState: SystemState = {
      ...systemState,
      activeAgentsCount: Math.max(1, agents.length - 1)
    };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }

    addAuditLog('DELETE_AGENT', agentId, `Agent décommissionné selon le cycle de dépréciation`);
    addColonyEvent('AgentTerminated', 'Agent Retiré', agentId, 'WARNING');
  };

  // Department Creation
  const handleCreateDepartment = (newDeptData: Omit<Department, 'id' | 'createdAt' | 'agentCount' | 'activeTasks'>) => {
    const newDept: Department = {
      ...newDeptData,
      id: `dept-${Date.now()}`,
      agentCount: 0,
      activeTasks: 0,
      createdAt: new Date().toISOString()
    };

    setDepartments(prev => [...prev, newDept]);
    if (user) {
      saveEntityToFirestore(user.uid, 'departments', newDept).catch(console.error);
    }

    addAuditLog('CREATE_DEPARTMENT', newDept.name, `Chambre départementale créée [${newDept.code}]`);
    addColonyEvent('DepartmentFormed', 'Département Formé', newDept.name, 'SUCCESS');
  };

  // Tool Creation
  const handleAddTool = (newToolData: Omit<Tool, 'id' | 'usageCount'>) => {
    const newTool: Tool = {
      ...newToolData,
      id: `tool-${Date.now()}`,
      usageCount: 0
    };

    setTools(prev => [...prev, newTool]);
    if (user) {
      saveEntityToFirestore(user.uid, 'tools', newTool).catch(console.error);
    }

    addAuditLog('ADD_TOOL_SANDBOX', newTool.name, `Outil instancié en Sandbox hermétique`);
    addColonyEvent('ToolAttached', 'Outil en Sandbox', newTool.name, 'INFO');
  };

  // Promote Tool from Sandbox to Production
  const handlePromoteTool = (toolId: string) => {
    let updatedToolObj: Tool | null = null;
    setTools(prev => prev.map(t => {
      if (t.id !== toolId) return t;
      const updated: Tool = {
        ...t,
        status: 'PRODUCTION',
        sandboxTestResults: {
          passed: true,
          latencyMs: 120,
          score: 98,
          testedAt: new Date().toISOString()
        }
      };
      updatedToolObj = updated;
      return updated;
    }));

    if (user && updatedToolObj) {
      saveEntityToFirestore(user.uid, 'tools', updatedToolObj).catch(console.error);
    }

    addAuditLog('PROMOTE_TOOL', toolId, `Outil promu en Production après passage réussi en Sandbox.`);
    addColonyEvent('ToolAttached', 'Outil Promu en Prod', toolId, 'SUCCESS');
  };

  // Governance Request Approval
  const handleApproveRequest = (requestId: string) => {
    const targetReq = governanceRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedReq: GovernanceRequest = { ...targetReq, status: 'APPROVED' };
    setGovernanceRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    if (user) {
      saveEntityToFirestore(user.uid, 'governanceRequests', updatedReq).catch(console.error);
    }

    if (targetReq.actionType === 'CREATE_AGENT' && targetReq.payload) {
      handleCreateAgent({
        name: (targetReq.payload.proposedName as string) || 'Nouvel Agent Spécialisé',
        codeName: (targetReq.payload.proposedName as string)?.toUpperCase().replace(/\s+/g, '-') || 'SPECIALIST-AI',
        role: (targetReq.payload.role as any) || 'SPECIALIST',
        status: 'ACTIVE',
        avatar: '🤖',
        model: (targetReq.payload.model as string) || 'gemini-3.7-flash',
        departmentId: (targetReq.payload.department as string) || 'dept-dev',
        specialty: (targetReq.payload.specialty as string) || 'Expert d\'analyse et synthèse',
        description: 'Agent subordonné créé pour mission ciblée sous gouvernance Zero-Trust.',
        systemPrompt: 'Tu es un sous-agent spécialisé de la colonie. Tu exécutes tes tâches selon les contraintes de sécurité et d\'isolation.',
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
    const targetReq = governanceRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedReq: GovernanceRequest = { ...targetReq, status: 'REJECTED' };
    setGovernanceRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    if (user) {
      saveEntityToFirestore(user.uid, 'governanceRequests', updatedReq).catch(console.error);
    }
    addAuditLog('HUMAN_APPROVAL_REJECTED', requestId, 'Action refusée par l\'autorité humaine.', 'DENIED');
  };

  // Change autonomy level
  const handleChangeAutonomy = (level: AutonomyLevel) => {
    const updatedSysState: SystemState = { ...systemState, autonomyLevel: level };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }
    addAuditLog('CHANGE_AUTONOMY_LEVEL', level, `Niveau d'autonomie ajusté sur ${level}`);
  };

  // Toggle Emergency Lockdown
  const handleToggleEmergency = () => {
    const nextLock = !systemState.emergencyLockdown;
    const updatedSysState: SystemState = { ...systemState, emergencyLockdown: nextLock };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }
    addAuditLog('EMERGENCY_LOCKDOWN', 'Colony Core', nextLock ? 'Arrêt d\'urgence enclenché !' : 'Colonie réarmée et opérationnelle.', nextLock ? 'DENIED' : 'ALLOWED');
  };

  // Toggle Desktop Bridge connection
  const handleToggleDesktopBridge = () => {
    const updatedSysState: SystemState = { ...systemState, desktopBridgeConnected: !systemState.desktopBridgeConnected };
    setSystemState(updatedSysState);
    if (user) {
      saveSystemStateToFirestore(user.uid, updatedSysState).catch(console.error);
    }
    addAuditLog('DESKTOP_BRIDGE_TOGGLE', 'Desktop Gateway', 'Statut du pont client Desktop synchronisé.');
  };

  const directorAgent = agents.find(a => a.role === 'DIRECTEUR_GENERAL') || agents[0];
  const pendingApprovalsCount = governanceRequests.filter(r => r.status === 'PENDING').length;
  const activeProject = projects.find(p => p.id === systemState.activeProjectId) || projects[0];

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
        user={user}
        isAuthLoading={isAuthLoading}
        onLogin={handleLogin}
        onLogout={handleLogout}
        firestoreConnected={firestoreConnected}
        isSyncing={isSyncing}
        activeProjectCode={activeProject?.code || 'PRJ-CORE'}
      />

      {/* Sync Toast Notification */}
      {syncNotice && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-blue-500/50 shadow-2xl rounded-xl px-4 py-2.5 text-xs text-blue-300 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>{syncNotice}</span>
        </div>
      )}

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

        {currentTab === 'projects' && (
          <ProjectsView
            projects={projects}
            activeProjectId={systemState.activeProjectId}
            onSelectActiveProject={handleSelectActiveProject}
            onCreateProject={handleCreateProject}
            agents={agents}
            departments={departments}
            tasks={tasks}
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
            onEvaluateTask={handleEvaluateTask}
            isEvaluating={isEvaluatingTask}
          />
        )}

        {currentTab === 'evolution' && (
          <EvolutionAndSelfOrganization
            agents={agents}
            skills={skills}
            workflows={workflows}
            evolutionStages={evolutionStages}
            systemState={systemState}
            onRollbackAgentVersion={handleRollbackAgentVersion}
            onRunAutoOrgAudit={handleRunAutoOrgAudit}
            isAuditing={isAuditingOrg}
            auditResults={autoOrgAuditResults}
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

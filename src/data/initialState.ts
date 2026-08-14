import { Agent, Department, Task, MemoryItem, Tool, AuditLog, GovernanceRequest, EvolutionStage, SystemState, ChatMessage } from '../types';

export const INITIAL_DIRECTOR_AGENT: Agent = {
  id: 'agent-dg-001',
  name: 'Directeur Général IA',
  codeName: 'NEXUS-PRIME',
  role: 'DIRECTEUR_GENERAL',
  status: 'ACTIVE',
  avatar: '👑',
  model: 'gemini-3.7-flash',
  specialty: 'Orchestration stratégique, planification, gouvernance Zero Trust & auto-évolution',
  description: 'Agent central de la colonie. Coordonne les missions, gère la mémoire, pilote la création progressive d’outils, de départements et de sous-agents sous supervision humaine.',
  systemPrompt: `Tu es le Directeur Général IA (CEO) d'un écosystème d'agents en colonie "Fourmilière IA".
Tes principes fondamentaux :
1. Commencer petit, créer uniquement ce qui est nécessaire et justifié.
2. Respecter scrupuleusement l'architecture Zero Trust : toute action sensible requiert autorisation.
3. Décomposer les missions complexes en étapes claires, assignables à des outils ou à des sous-agents spécialisés si la complexité le justifie.
4. Mémoriser durablement les enseignements, préférences et retours d'expérience.
5. Être précis, poli, concis, proactif et pédagogue avec l'utilisateur.`,
  permissions: [
    { resource: 'SYSTEM_MEMORY', action: 'WRITE', scope: 'GLOBAL', requiresHumanApproval: false },
    { resource: 'TASK_ORCHESTRATION', action: 'EXECUTE', scope: 'GLOBAL', requiresHumanApproval: false },
    { resource: 'AGENT_CREATION', action: 'DELEGATE', scope: 'GLOBAL', requiresHumanApproval: true },
    { resource: 'DEPARTMENT_CREATION', action: 'DELEGATE', scope: 'GLOBAL', requiresHumanApproval: true },
    { resource: 'SANDBOX_EXECUTION', action: 'EXECUTE', scope: 'LOCAL', requiresHumanApproval: false },
    { resource: 'DESKTOP_BRIDGE', action: 'EXECUTE', scope: 'LOCAL', requiresHumanApproval: true }
  ],
  toolsAllowed: ['tool-search-01', 'tool-code-02', 'tool-mem-03', 'tool-file-04', 'tool-api-05'],
  memoryAccess: ['working', 'user', 'projects', 'episodic', 'semantic', 'procedural', 'performance'],
  metrics: {
    tasksCompleted: 14,
    successRate: 98.4,
    avgExecutionTimeMs: 1240,
    tokensConsumed: 42350,
    errorCount: 1,
    lastActive: new Date().toISOString()
  },
  createdAt: '2026-08-01T08:00:00.000Z',
  version: '1.0.0'
};

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-core',
    name: 'Direction Générale & Stratégie',
    code: 'DGS',
    leadAgentId: 'agent-dg-001',
    color: '#3B82F6', // Blue
    description: 'Chambre centrale de gouvernance, arbitrage des ressources et planification globale.',
    mission: 'Assurer la cohérence stratégique et le respect des politiques de sécurité.',
    agentCount: 1,
    activeTasks: 1,
    createdAt: '2026-08-01T08:00:00.000Z',
    level: 0
  },
  {
    id: 'dept-dev',
    name: 'Ingénierie & Développement',
    code: 'DEV',
    leadAgentId: 'agent-dg-001',
    color: '#10B981', // Emerald
    description: 'Conception logicielle, écriture de scripts, prototypage et tests en sandbox.',
    mission: 'Fabriquer des solutions techniques fiables, testées et reproductibles.',
    agentCount: 0,
    activeTasks: 0,
    createdAt: '2026-08-05T10:00:00.000Z',
    level: 1
  },
  {
    id: 'dept-research',
    name: 'Recherche & Connaissances',
    code: 'RES',
    leadAgentId: 'agent-dg-001',
    color: '#8B5CF6', // Purple
    description: 'Veille technologique, synthèse documentaire, extraction sémantique et mémoire épisodique.',
    mission: 'Fournir des données vérifiées et enrichir la base de connaissances commune.',
    agentCount: 0,
    activeTasks: 0,
    createdAt: '2026-08-08T14:30:00.000Z',
    level: 2
  }
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 'tool-search-01',
    name: 'Web & Deep Knowledge Search',
    category: 'SEARCH',
    version: '1.2.0',
    description: 'Recherche d’informations vérifiées sur le web et extraction structurée de sources fiables.',
    riskLevel: 'LOW',
    status: 'PRODUCTION',
    parametersSchema: '{"query": "string", "maxResults": "number", "requireSources": "boolean"}',
    sandboxTestResults: { passed: true, latencyMs: 310, score: 99, testedAt: '2026-08-10T12:00:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL', 'DEPT_LEAD', 'SPECIALIST'],
    usageCount: 128
  },
  {
    id: 'tool-code-02',
    name: 'Python/TS Sandbox Runner',
    category: 'CODE',
    version: '2.0.1',
    description: 'Exécution de code dans un conteneur sécurisé éphémère sans accès réseau non autorisé.',
    riskLevel: 'MEDIUM',
    status: 'PRODUCTION',
    parametersSchema: '{"language": "python|typescript", "code": "string", "timeoutMs": "number"}',
    sandboxTestResults: { passed: true, latencyMs: 640, score: 96, testedAt: '2026-08-12T09:15:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL', 'DEPT_LEAD', 'SPECIALIST', 'TOOL_BUILDER'],
    usageCount: 84
  },
  {
    id: 'tool-mem-03',
    name: 'Persistent Vector Memory Indexer',
    category: 'ANALYSIS',
    version: '1.1.0',
    description: 'Indexation sémantique et recherche vectorielle des mémoires de la colonie.',
    riskLevel: 'LOW',
    status: 'PRODUCTION',
    parametersSchema: '{"category": "string", "query": "string", "limit": "number"}',
    sandboxTestResults: { passed: true, latencyMs: 120, score: 100, testedAt: '2026-08-01T08:00:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL', 'DEPT_LEAD', 'SPECIALIST'],
    usageCount: 412
  },
  {
    id: 'tool-file-04',
    name: 'Secure Cloud Artifacts Manager',
    category: 'FILE',
    version: '1.0.4',
    description: 'Lecture, écriture et versionnement de rapports, schémas et livrables sécurisés.',
    riskLevel: 'MEDIUM',
    status: 'PRODUCTION',
    parametersSchema: '{"path": "string", "operation": "read|write|diff", "content": "string"}',
    sandboxTestResults: { passed: true, latencyMs: 180, score: 98, testedAt: '2026-08-04T16:20:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL', 'DEPT_LEAD'],
    usageCount: 57
  },
  {
    id: 'tool-api-05',
    name: 'REST API & Webhook Connector',
    category: 'API',
    version: '1.3.0',
    description: 'Appels d’APIs externes sécurisées avec rotation des jetons et vérification SSL.',
    riskLevel: 'HIGH',
    status: 'PRODUCTION',
    parametersSchema: '{"endpoint": "string", "method": "GET|POST|PUT", "headers": "object", "body": "object"}',
    sandboxTestResults: { passed: true, latencyMs: 450, score: 94, testedAt: '2026-08-09T11:40:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL', 'SECURITY_GUARD'],
    usageCount: 39
  },
  {
    id: 'tool-desktop-06',
    name: 'Secure Desktop Agent Bridge (V2 Preview)',
    category: 'DESKTOP',
    version: '0.9.0-alpha',
    description: 'Passerelle chiffrée de communication avec l’agent local Desktop (exécution locale sous validation humaine).',
    riskLevel: 'HIGH',
    status: 'SANDBOX',
    parametersSchema: '{"command": "string", "targetApp": "string", "userConfirmationHash": "string"}',
    sandboxTestResults: { passed: true, latencyMs: 220, score: 91, testedAt: '2026-08-14T10:00:00Z' },
    allowedRoles: ['DIRECTEUR_GENERAL'],
    usageCount: 6
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-001',
    category: 'user',
    title: 'Objectifs Stratégiques Utilisateur',
    content: 'L\'utilisateur souhaite construire une colonie d\'agents autonome, agile et hyper-sécurisée, capable d\'automatiser la recherche, le code et l\'organisation de projets tout en gardant le contrôle humain complet.',
    tags: ['vision', 'priorités', 'gouvernance'],
    importance: 5,
    sourceAgentId: 'agent-dg-001',
    createdAt: '2026-08-01T09:00:00Z',
    lastAccessedAt: '2026-08-14T11:00:00Z',
    accessCount: 48,
    confidenceScore: 0.99
  },
  {
    id: 'mem-002',
    category: 'procedural',
    title: 'Protocole de Création de Sous-Agent',
    content: 'Avant d\'instancier un sous-agent : 1. Valider le besoin fonctionnel. 2. Définir des permissions minimales (Least Privilege). 3. Soumettre la requête au filtre Zero Trust / Gouvernance. 4. Tester en Sandbox. 5. Déployer avec métriques.',
    tags: ['protocole', 'lifecycle', 'zero-trust'],
    importance: 5,
    sourceAgentId: 'agent-dg-001',
    createdAt: '2026-08-02T14:20:00Z',
    lastAccessedAt: '2026-08-14T10:15:00Z',
    accessCount: 31,
    confidenceScore: 0.98
  },
  {
    id: 'mem-003',
    category: 'episodic',
    title: 'Initialisation de la Fourmilière Cloud-Native',
    content: 'Démarrage du système avec le Directeur Général NEXUS-PRIME. Configuration de la chambre de données, mise en place des partitions de mémoire et activation de la surveillance télémétrique en temps réel.',
    tags: ['démarrage', 'historique', 'setup'],
    importance: 4,
    sourceAgentId: 'agent-dg-001',
    createdAt: '2026-08-01T08:00:00Z',
    lastAccessedAt: '2026-08-13T18:00:00Z',
    accessCount: 19,
    confidenceScore: 1.0
  },
  {
    id: 'mem-004',
    category: 'semantic',
    title: 'Règles de Sécurité Zero Trust',
    content: 'Principe "Ne jamais faire confiance, toujours vérifier". Toute interaction agent-outil, agent-mémoire ou agent-agent est soumise à signature cryptographique, contrôle de portée et journalisation immuable.',
    tags: ['sécurité', 'zero-trust', 'isolation'],
    importance: 5,
    sourceAgentId: 'agent-dg-001',
    createdAt: '2026-08-03T11:10:00Z',
    lastAccessedAt: '2026-08-14T09:40:00Z',
    accessCount: 65,
    confidenceScore: 0.99
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Supervision & Diagnostic Initial de l\'Écosystème',
    description: 'Vérification de l\'état de santé de la mémoire, de la sandbox de test et de la connectivité du Directeur Général.',
    departmentId: 'dept-core',
    assignedAgentId: 'agent-dg-001',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    progress: 75,
    steps: [
      { id: 's1', title: 'Audit des partitions de mémoire persistante', status: 'DONE', timestamp: '11:00:10', output: '4 partitions vérifiées avec succès.' },
      { id: 's2', title: 'Test d\'intégrité de la Sandbox d\'outils', status: 'DONE', timestamp: '11:02:40', output: 'Score sandbox 98/100, latence nominale.' },
      { id: 's3', title: 'Initialisation de l\'interface Fourmilière 3D', status: 'RUNNING', timestamp: '11:05:00' },
      { id: 's4', title: 'Mise en veille des récepteurs de mission', status: 'PENDING' }
    ],
    tokensBudget: 5000,
    tokensUsed: 2150,
    createdAt: '2026-08-14T10:45:00Z'
  },
  {
    id: 'task-002',
    title: 'Structuration du Registre d\'Outils & Projets R&D',
    description: 'Classification des compétences techniques et préparation des protocoles de délégation pour futurs sous-agents.',
    departmentId: 'dept-dev',
    assignedAgentId: 'agent-dg-001',
    priority: 'MEDIUM',
    status: 'PLANNING',
    progress: 30,
    steps: [
      { id: 's2-1', title: 'Analyse des besoins en outils de veille', status: 'DONE', timestamp: '10:10:00', output: 'Outils web search et sandbox validés.' },
      { id: 's2-2', title: 'Spécification de l\'agent Archiviste Sémantique', status: 'PENDING' }
    ],
    tokensBudget: 8000,
    tokensUsed: 1420,
    createdAt: '2026-08-14T09:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-08-14T11:20:00Z',
    agentId: 'agent-dg-001',
    agentName: 'Directeur Général IA',
    action: 'READ_MEMORY',
    target: 'mem-001 (Objectifs Utilisateur)',
    status: 'ALLOWED',
    details: 'Accès autorisé dans le cadre de la planification globale de la colonie.',
    ip: '10.0.4.12 (Internal Mesh)',
    zeroTrustVerification: { authenticated: true, authorized: true, rateLimitOk: true, signatureValid: true }
  },
  {
    id: 'audit-002',
    timestamp: '2026-08-14T11:15:30Z',
    agentId: 'agent-dg-001',
    agentName: 'Directeur Général IA',
    action: 'SANDBOX_EXECUTE',
    target: 'tool-code-02',
    status: 'ALLOWED',
    details: 'Exécution d\'un script de test de validation mémoire dans un environnement hermétique.',
    ip: '10.0.4.12 (Internal Mesh)',
    zeroTrustVerification: { authenticated: true, authorized: true, rateLimitOk: true, signatureValid: true }
  },
  {
    id: 'audit-003',
    timestamp: '2026-08-14T10:55:12Z',
    agentId: 'agent-dg-001',
    agentName: 'Directeur Général IA',
    action: 'TOKEN_QUOTA_CHECK',
    target: 'Gemini Engine Budget',
    status: 'ALLOWED',
    details: 'Consommation de 1250 tokens vérifiée conforme au budget alloué par heure.',
    ip: '10.0.4.12 (Internal Mesh)',
    zeroTrustVerification: { authenticated: true, authorized: true, rateLimitOk: true, signatureValid: true }
  }
];

export const INITIAL_GOVERNANCE_REQUESTS: GovernanceRequest[] = [
  {
    id: 'gov-001',
    agentId: 'agent-dg-001',
    agentName: 'Directeur Général IA',
    actionType: 'CREATE_AGENT',
    title: 'Création du sous-agent spécialisé "Analyste de Recherche"',
    justification: 'La charge d\'analyse documentaire et de veille technologique justifie l\'instanciation d\'un sous-agent dédié pour accélérer le traitement sans surcharger le Directeur Général.',
    payload: {
      proposedName: 'Sentinelle de Recherche',
      role: 'SPECIALIST',
      department: 'dept-research',
      model: 'gemini-3.7-flash',
      tools: ['tool-search-01', 'tool-mem-03'],
      permissions: ['READ_MEMORY', 'WEB_SEARCH']
    },
    createdAt: '2026-08-14T11:10:00Z',
    status: 'PENDING',
    riskScore: 28
  }
];

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    level: 1,
    name: 'Agent Central Seul',
    description: 'Directeur Général opérationnel avec capacités d’interaction, planification et mémoire immédiate.',
    achieved: true,
    requirements: 'Point de départ : 1 agent central actif.'
  },
  {
    level: 2,
    name: 'Agent + Mémoire Active',
    description: 'Mémoire persistante structurée (utilisateur, épisodique, sémantique, procédurale).',
    achieved: true,
    requirements: 'Mémoire active avec au moins 4 partitions indexées.'
  },
  {
    level: 3,
    name: 'Agent + Outils & Sandbox',
    description: 'Registre d’outils opérationnel avec banc d’essai sandbox et évaluation de sécurité.',
    achieved: true,
    requirements: 'Au moins 3 outils validés en production après test sandbox.'
  },
  {
    level: 4,
    name: 'Agent + Départements Structurés',
    description: 'Création de chambres fonctionnelles spécialisées pour organiser les futurs flux.',
    achieved: true,
    requirements: 'Définition des départements (DGS, DEV, RES) sous supervision.'
  },
  {
    level: 5,
    name: 'Agent + Sous-Agents Spécialisés',
    description: 'Instanciation dynamique de sous-agents dédiés sous approbation Zero Trust.',
    achieved: false,
    requirements: 'Validation humaine de l\'instanciation d\'au moins un sous-agent.'
  },
  {
    level: 6,
    name: 'Écosystème Fourmilière Multi-Départements',
    description: 'Colonie autonome, auto-évaluée, auto-améliorée, contrôlée via la Fourmilière 3D et le pont Desktop.',
    achieved: false,
    requirements: 'Orchestration multi-agents autonome avec 95%+ de taux de succès.'
  }
];

export const INITIAL_SYSTEM_STATE: SystemState = {
  appName: 'Fourmilière IA - Colonie Cloud-Native',
  evolutionLevel: 4,
  autonomyLevel: 'BALANCED',
  emergencyLockdown: false,
  activeAgentsCount: 1,
  activeTasksCount: 2,
  totalTokensUsed: 42350,
  sandboxHealthScore: 98,
  desktopBridgeConnected: false,
  securityScore: 99
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    sender: 'DIRECTEUR_GENERAL',
    agentId: 'agent-dg-001',
    agentName: 'Directeur Général IA',
    content: `Bonjour. Je suis le **Directeur Général IA** de votre plateforme Fourmilière.

Notre architecture Cloud-Native est opérationnelle sous protocole **Zero Trust**. Je dispose d'une mémoire persistante structurée, d'un registre d'outils et de départements prêts à accueillir de futures compétences.

Que souhaitez-vous accomplir aujourd'hui ? Je peux :
1. Planifier et exécuter une mission complexe pas à pas.
2. Analyser ou indexer de nouvelles connaissances dans notre mémoire.
3. Proposer la création justifiée d'un sous-agent spécialisé si votre tâche le requiert.
4. Explorer l'état opérationnel via la **Fourmilière 3D**.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      { label: '🚀 Lancer une mission de recherche & dev', action: 'START_MISSION', payload: { title: 'Veille sur les architectures Multi-Agents 2026' } },
      { label: '🐜 Explorer la Fourmilière 3D', action: 'VIEW_3D' },
      { label: '🛡️ Examiner la gouvernance Zero Trust', action: 'VIEW_GOVERNANCE' },
      { label: '🧠 Consulter la mémoire persistante', action: 'VIEW_MEMORY' }
    ],
    thoughtProcess: 'Initialisation réussie. Audit mémoire validé. Attente des instructions stratégiques de l\'utilisateur.'
  }
];

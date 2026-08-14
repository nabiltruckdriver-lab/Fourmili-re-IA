/**
 * Fourmilière IA - Type Definitions
 * Cloud-Native Multi-Agent SaaS Architecture
 */

export type AgentRole = 'DIRECTEUR_GENERAL' | 'DEPT_LEAD' | 'SPECIALIST' | 'SECURITY_GUARD' | 'TOOL_BUILDER';

export type AgentStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'SANDBOXING' | 'PAUSED' | 'ARCHIVED';

export type AutonomyLevel = 'SUPERVISED' | 'BALANCED' | 'AUTONOMOUS';

export interface AgentPermission {
  resource: string;
  action: 'READ' | 'WRITE' | 'EXECUTE' | 'DELEGATE';
  scope: 'LOCAL' | 'DEPARTMENT' | 'GLOBAL';
  requiresHumanApproval: boolean;
}

export interface AgentMetric {
  tasksCompleted: number;
  successRate: number; // 0-100
  avgExecutionTimeMs: number;
  tokensConsumed: number;
  errorCount: number;
  lastActive: string;
}

export interface AgentVersion {
  version: string;
  releasedAt: string;
  changelog: string;
  sandboxScore: number;
  isActive: boolean;
  canRollback: boolean;
}

export interface Agent {
  id: string;
  name: string;
  codeName: string;
  role: AgentRole;
  departmentId?: string;
  status: AgentStatus;
  avatar: string;
  model: string;
  specialty: string;
  description: string;
  systemPrompt: string;
  permissions: AgentPermission[];
  toolsAllowed: string[]; // Tool IDs
  memoryAccess: ('working' | 'user' | 'projects' | 'episodic' | 'semantic' | 'procedural' | 'performance' | 'error')[];
  metrics: AgentMetric;
  createdAt: string;
  version: string;
  versionHistory?: AgentVersion[];
  parentAgentId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  leadAgentId: string;
  color: string;
  description: string;
  mission: string;
  agentCount: number;
  activeTasks: number;
  createdAt: string;
  level: number; // Layer in the 3D anthill
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'BACKLOG' | 'PLANNING' | 'IN_PROGRESS' | 'SANDBOX_TEST' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'FAILED';
export type MissionComplexity = 'SIMPLE' | 'COMPOSITE' | 'COMPLEX' | 'LONG_TERM' | 'RECURRENT' | 'EXPERIMENTAL' | 'SENSITIVE';
export type EvaluationStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'REQUIRES_REVIEW';

export interface TaskStep {
  id: string;
  title: string;
  assignedAgentId?: string;
  toolUsed?: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  output?: string;
  timestamp?: string;
  dependsOn?: string[]; // IDs of required prior steps for parallel execution
  isParallel?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  departmentId?: string;
  assignedAgentId?: string;
  priority: TaskPriority;
  complexity?: MissionComplexity;
  expectedOutcome?: string;
  status: TaskStatus;
  progress: number; // 0-100
  steps: TaskStep[];
  tokensBudget: number;
  tokensUsed: number;
  createdAt: string;
  completedAt?: string;
  parentTaskId?: string;
  requiresHumanApproval?: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // Operational Cycle Details
  instructionVsGoal?: {
    rawInstruction: string;
    actualGoal: string;
    contextDetected: string;
    missingInfo?: string[];
  };
  evaluation?: {
    status: EvaluationStatus;
    score: number; // 0-100
    expectedVsActual: string;
    evaluatorAgentId?: string;
    evaluatedAt: string;
    lessonsLearned?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  assignedAgentIds: string[];
  departmentIds: string[];
  taskIds: string[];
  isolationPolicy: 'STRICT' | 'SHARED_READ_ONLY' | 'FEDERATED';
  tokensUsed: number;
  createdAt: string;
  metrics: {
    totalMissions: number;
    successRate: number;
  };
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: string;
  objective: string;
  requiredKnowledge: string[];
  procedure: string;
  toolsRequired: string[];
  constraints: string[];
  successCriteria: string[];
  validationMethod: string;
  testedInSandbox: boolean;
  status: 'PROPOSED' | 'VALIDATED' | 'PRODUCTION';
  createdAt: string;
}

export interface ProceduralWorkflow {
  id: string;
  name: string;
  code: string;
  description: string;
  triggerCondition: string;
  steps: {
    order: number;
    name: string;
    toolId?: string;
    roleRequired: AgentRole;
  }[];
  successCount: number;
  averageExecutionTimeSec: number;
  confidenceScore: number;
  createdAt: string;
}

export type ColonyEventType = 
  | 'AgentCreated' 
  | 'AgentStarted' 
  | 'AgentCompleted' 
  | 'AgentFailed' 
  | 'AgentUpdated' 
  | 'AgentArchived' 
  | 'AgentTerminated'
  | 'DepartmentCreated' 
  | 'DepartmentFormed'
  | 'TaskCreated' 
  | 'TaskStepExecuted' 
  | 'TaskCompleted' 
  | 'TaskFailed' 
  | 'ToolAttached'
  | 'MemoryCreated' 
  | 'MemoryUpdated' 
  | 'MessageRouted'
  | 'WorkflowSynthesized' 
  | 'PermissionChecked' 
  | 'EvaluationCompleted' 
  | 'EmergencyLockdown' 
  | 'AutoOrganizationAudit';

export interface ColonyEvent {
  id: string;
  type: ColonyEventType;
  title: string;
  details: string;
  sourceId: string;
  sourceName: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
}

export type MemoryCategory = 'working' | 'user' | 'projects' | 'episodic' | 'semantic' | 'procedural' | 'performance' | 'error';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  importance: number; // 1-5
  sourceAgentId?: string;
  relatedProjectId?: string;
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
  confidenceScore: number; // 0-1
  isDeprecated?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  category: 'SEARCH' | 'CODE' | 'FILE' | 'API' | 'ANALYSIS' | 'AUTOMATION' | 'DESKTOP';
  version: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PRODUCTION' | 'SANDBOX' | 'DISABLED';
  parametersSchema: string;
  sandboxTestResults?: {
    passed: boolean;
    latencyMs: number;
    score: number;
    testedAt: string;
  };
  allowedRoles: AgentRole[];
  usageCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  action: string;
  target: string;
  status: 'ALLOWED' | 'DENIED' | 'FLAGGED' | 'COMPLETED' | 'FAILED';
  details: string;
  ip: string;
  zeroTrustVerification: {
    authenticated: boolean;
    authorized: boolean;
    rateLimitOk: boolean;
    signatureValid: boolean;
  };
}

export interface GovernanceRequest {
  id: string;
  agentId: string;
  agentName: string;
  actionType: 'CREATE_AGENT' | 'CREATE_DEPT' | 'EXECUTE_HIGH_RISK_TOOL' | 'DEPLOY_PRODUCTION_CODE' | 'ACCESS_SECRET' | 'CHANGE_GOVERNANCE';
  title: string;
  justification: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskScore: number; // 1-100
}

export interface EvolutionStage {
  level: number;
  name: string;
  description: string;
  achieved: boolean;
  requirements: string;
}

export interface SystemState {
  appName: string;
  evolutionLevel: number;
  autonomyLevel: AutonomyLevel;
  emergencyLockdown: boolean;
  activeAgentsCount: number;
  activeTasksCount: number;
  totalTokensUsed: number;
  sandboxHealthScore: number;
  desktopBridgeConnected: boolean;
  securityScore: number;
  activeProjectId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'DIRECTEUR_GENERAL' | 'SYSTEM';
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
  relatedTaskId?: string;
  thoughtProcess?: string;
  operationalCycleBreakdown?: {
    rawInstruction: string;
    actualGoal: string;
    context: string;
    memoryRetrieved: string[];
    classification: MissionComplexity;
    capacityCheckResult: string;
    creationHierarchyDecision: string;
    planSummary: string;
    evaluationCriteria: string;
  };
}

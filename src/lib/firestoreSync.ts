import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  Agent, 
  Department, 
  Task, 
  MemoryItem, 
  Tool, 
  AuditLog, 
  GovernanceRequest, 
  ChatMessage, 
  SystemState 
} from '../types';

export interface ColonyData {
  agents: Agent[];
  departments: Department[];
  tasks: Task[];
  memories: MemoryItem[];
  tools: Tool[];
  auditLogs: AuditLog[];
  governanceRequests: GovernanceRequest[];
  chatMessages: ChatMessage[];
  systemState: SystemState;
}

export interface ColonySubscribers {
  onAgentsChange: (agents: Agent[]) => void;
  onDepartmentsChange: (departments: Department[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  onMemoriesChange: (memories: MemoryItem[]) => void;
  onToolsChange: (tools: Tool[]) => void;
  onAuditLogsChange: (auditLogs: AuditLog[]) => void;
  onGovernanceRequestsChange: (reqs: GovernanceRequest[]) => void;
  onChatMessagesChange: (msgs: ChatMessage[]) => void;
  onSystemStateChange: (state: SystemState) => void;
  onError?: (err: unknown) => void;
}

/**
 * Initialize user colony data in Firestore if not already present
 */
export async function initializeUserColony(userId: string, initialData: ColonyData, userEmail?: string, displayName?: string): Promise<void> {
  try {
    const userDocPath = `users/${userId}`;
    
    // Set user profile
    await setDoc(doc(db, 'users', userId), {
      userId,
      email: userEmail || 'user@example.com',
      displayName: displayName || 'Utilisateur Colonie',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Check if systemState exists
    const systemStatePath = `users/${userId}/systemState`;
    const sysSnapshot = await getDocs(collection(db, systemStatePath));

    if (sysSnapshot.empty) {
      console.log(`[Firestore] Initializing new colony for user ${userId}...`);
      const batch = writeBatch(db);

      // System State
      const sysDocRef = doc(db, systemStatePath, 'main');
      batch.set(sysDocRef, { ...initialData.systemState, id: 'main', userId });

      // Director Agent
      initialData.agents.forEach(agent => {
        const ref = doc(db, `users/${userId}/agents`, agent.id);
        batch.set(ref, { ...agent, userId });
      });

      // Departments
      initialData.departments.forEach(dept => {
        const ref = doc(db, `users/${userId}/departments`, dept.id);
        batch.set(ref, { ...dept, userId });
      });

      // Tasks
      initialData.tasks.forEach(task => {
        const ref = doc(db, `users/${userId}/tasks`, task.id);
        batch.set(ref, { ...task, userId });
      });

      // Memories
      initialData.memories.forEach(mem => {
        const ref = doc(db, `users/${userId}/memories`, mem.id);
        batch.set(ref, { ...mem, userId });
      });

      // Tools
      initialData.tools.forEach(tool => {
        const ref = doc(db, `users/${userId}/tools`, tool.id);
        batch.set(ref, { ...tool, userId });
      });

      // Audit Logs
      initialData.auditLogs.forEach(log => {
        const ref = doc(db, `users/${userId}/auditLogs`, log.id);
        batch.set(ref, { ...log, userId });
      });

      // Governance Requests
      initialData.governanceRequests.forEach(req => {
        const ref = doc(db, `users/${userId}/governanceRequests`, req.id);
        batch.set(ref, { ...req, userId });
      });

      // Chat Messages
      initialData.chatMessages.forEach(msg => {
        const ref = doc(db, `users/${userId}/chatMessages`, msg.id);
        batch.set(ref, { ...msg, userId });
      });

      await batch.commit();
      console.log(`[Firestore] Colony successfully seeded in Firestore for ${userId}`);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Subscribe to all user colony collections in real time
 */
export function subscribeToUserColony(userId: string, subscribers: ColonySubscribers): () => void {
  const unsubs: Unsubscribe[] = [];

  // 1. Agents
  const agentsPath = `users/${userId}/agents`;
  try {
    const unsub = onSnapshot(
      collection(db, agentsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedAgents = snapshot.docs.map(d => d.data() as Agent);
          subscribers.onAgentsChange(loadedAgents);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, agentsPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 2. Departments
  const deptPath = `users/${userId}/departments`;
  try {
    const unsub = onSnapshot(
      collection(db, deptPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as Department);
          subscribers.onDepartmentsChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, deptPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 3. Tasks
  const tasksPath = `users/${userId}/tasks`;
  try {
    const unsub = onSnapshot(
      collection(db, tasksPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as Task);
          subscribers.onTasksChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, tasksPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 4. Memories
  const memoriesPath = `users/${userId}/memories`;
  try {
    const unsub = onSnapshot(
      collection(db, memoriesPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as MemoryItem);
          subscribers.onMemoriesChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, memoriesPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 5. Tools
  const toolsPath = `users/${userId}/tools`;
  try {
    const unsub = onSnapshot(
      collection(db, toolsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as Tool);
          subscribers.onToolsChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, toolsPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 6. Audit Logs
  const auditPath = `users/${userId}/auditLogs`;
  try {
    const unsub = onSnapshot(
      collection(db, auditPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as AuditLog);
          // Sort by timestamp desc
          loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          subscribers.onAuditLogsChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, auditPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 7. Governance Requests
  const govPath = `users/${userId}/governanceRequests`;
  try {
    const unsub = onSnapshot(
      collection(db, govPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as GovernanceRequest);
          subscribers.onGovernanceRequestsChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, govPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 8. Chat Messages
  const chatPath = `users/${userId}/chatMessages`;
  try {
    const unsub = onSnapshot(
      collection(db, chatPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as ChatMessage);
          subscribers.onChatMessagesChange(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, chatPath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  // 9. System State
  const sysStatePath = `users/${userId}/systemState/main`;
  try {
    const unsub = onSnapshot(
      doc(db, `users/${userId}/systemState`, 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          subscribers.onSystemStateChange(snapshot.data() as SystemState);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, sysStatePath)
    );
    unsubs.push(unsub);
  } catch (err) {
    subscribers.onError?.(err);
  }

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}

/**
 * Persist an entity modification to Firestore
 */
export async function saveEntityToFirestore<T extends { id: string }>(
  userId: string, 
  collectionName: 'agents' | 'departments' | 'tasks' | 'memories' | 'tools' | 'auditLogs' | 'governanceRequests' | 'chatMessages',
  entity: T
): Promise<void> {
  const path = `users/${userId}/${collectionName}/${entity.id}`;
  try {
    await setDoc(doc(db, `users/${userId}/${collectionName}`, entity.id), {
      ...entity,
      userId
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete an entity from Firestore
 */
export async function deleteEntityFromFirestore(
  userId: string,
  collectionName: 'agents' | 'departments' | 'tasks' | 'memories' | 'tools' | 'governanceRequests' | 'chatMessages',
  entityId: string
): Promise<void> {
  const path = `users/${userId}/${collectionName}/${entityId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/${collectionName}`, entityId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save System State to Firestore
 */
export async function saveSystemStateToFirestore(userId: string, systemState: SystemState): Promise<void> {
  const path = `users/${userId}/systemState/main`;
  try {
    await setDoc(doc(db, `users/${userId}/systemState`, 'main'), {
      ...systemState,
      id: 'main',
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

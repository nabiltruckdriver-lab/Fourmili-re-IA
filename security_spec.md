# Security Specification - Fourmilière IA (Firestore Hardened Rules)

## 1. Data Invariants
1. **Master Gate Isolation**: All resources (agents, departments, tasks, memories, tools, auditLogs, governanceRequests, chatMessages, systemState) reside strictly under `/users/{userId}/...` and can only be accessed or modified by the authenticated owner `request.auth.uid == userId`.
2. **Identity Integrity**: `userId` in document payloads must strictly match `request.auth.uid`.
3. **Audit Log Immutability**: Audit logs are append-only. Once created, they cannot be updated or deleted by anyone to preserve Zero Trust tamper resistance.
4. **ID Sanitization**: All path variables and ID fields must conform to `^[a-zA-Z0-9_\-]+$` with max size 128 chars.
5. **No Blanket Reads**: No query delegation to the client. List queries are strictly scoped to the authenticated user.
6. **Volumetric Protection**: All strings and collections have strict upper bounds to prevent Denial of Wallet attacks.

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Identity Theft)**: An attacker authenticated as `user_B` attempts to read `/users/user_A/agents/agent-001`. -> Result: `PERMISSION_DENIED`.
2. **Payload 2 (Ghost Field Injection)**: Attempt to create a task with an unwhitelisted root property `__adminEscalation: true`. -> Result: `PERMISSION_DENIED`.
3. **Payload 3 (Audit Tampering)**: Attempt to update or delete an existing audit log in `/users/{userId}/auditLogs/{logId}`. -> Result: `PERMISSION_DENIED`.
4. **Payload 4 (Oversized Payload / Denial of Wallet)**: Attempt to inject a 2MB string into `task.description`. -> Result: `PERMISSION_DENIED`.
5. **Payload 5 (Unauthenticated Write)**: Write to `/users/{userId}/tasks/t-1` with `request.auth == null`. -> Result: `PERMISSION_DENIED`.
6. **Payload 6 (Cross-User Write)**: `user_A` attempts to insert a memory into `/users/user_B/memories/m-1`. -> Result: `PERMISSION_DENIED`.
7. **Payload 7 (Path Poisoning)**: Write to `/users/{userId}/tools/../../../hack`. -> Result: `PERMISSION_DENIED`.
8. **Payload 8 (Invalid Enum Role)**: Create an agent with `role: "SUPER_ROOT_OVERLORD"`. -> Result: `PERMISSION_DENIED`.
9. **Payload 9 (Negative Token Budget)**: Create a task with `tokensBudget: -50000`. -> Result: `PERMISSION_DENIED`.
10. **Payload 10 (Governance Status Bypassing)**: Non-admin trying to force approve an unverified request. -> Result: `PERMISSION_DENIED`.
11. **Payload 11 (Spoofed Email Verification)**: Using an unverified provider token to modify colony critical config. -> Result: `PERMISSION_DENIED`.
12. **Payload 12 (Blanket Collection Scraping)**: Attempting to query `collectionGroup('tasks')` across all tenants. -> Result: `PERMISSION_DENIED`.

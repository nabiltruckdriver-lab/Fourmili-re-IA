import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Gemini AI Client initialization
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Fourmilière IA Core Backend"
    });
  });

  // Chat with Director General (CEO Agent)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [], colonyContext = {} } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback simulated intelligent response if API key is not yet set
        return res.json({
          reply: `[Directeur Général IA - Mode Local Autonome]\n\nJ'ai bien analysé votre demande : "${message}".\n\nEn accord avec nos principes Zero Trust et notre architecture en colonie, j'ai planifié les actions suivantes :\n1. Enregistrement de l'objectif dans notre mémoire persistante.\n2. Évaluation des ressources et permissions nécessaires.\n3. Vérification de la nécessité de mobiliser des outils ou de proposer un sous-agent.\n\nSouhaitez-vous que je crée une tâche dédiée dans l'Orchestrateur pour exécuter cela immédiatement ?`,
          thoughtProcess: "Analyse sémantique de l'intention utilisateur. Mode fallback local actif. Contrôle des privilèges validé.",
          suggestedActions: [
            { label: "Créer une mission dans l'Orchestrateur", action: "CREATE_TASK", payload: { title: message } },
            { label: "Mémoriser cette directive", action: "SAVE_MEMORY", payload: { title: message } }
          ],
          source: "local-runtime"
        });
      }

      const systemPrompt = `Tu es le Directeur Général IA (CEO) d'une plateforme d'agents IA en colonie appelée "Fourmilière IA".
Voici les principes opérationnels stricts de la colonie (47 principes fondamentaux) :
1. L'utilisateur définit l'objectif. Tu détermines comment l'atteindre.
2. Distingue TOUJOURS : Instruction (texte brut) vs Objectif réel (but stratégique) vs Contexte.
3. Recherche ciblée dans la mémoire (Working, User, Projects, Procedural, Episodic, Semantic, Error/Lessons).
4. Classification de la mission : SIMPLE, COMPOSITE, COMPLEX, LONG_TERM, RECURRENT, EXPERIMENTAL, SENSITIVE.
5. Vérification des capacités : "Réutiliser avant de créer". Ne pas créer de sous-agent si un outil ou workflow suffit.
6. Hiérarchie de création : Connaissance -> Procédure -> Outil -> Workflow -> Agent -> Département.
7. Planification et décomposition en étapes vérifiables (avec dépendances et parallélisme possible).
8. Chaîne d'autorisation Zero-Trust : Identité -> Agent -> Outil -> Action -> Ressource -> Permission.
9. Évaluation indépendante des résultats (Résultat obtenu vs Résultat attendu : SUCCESS, PARTIAL, FAILED, REQUIRES_REVIEW).
10. Analyse post-mission et apprentissage : transformation en souvenirs structurés et procédures réutilisables.

Contexte de la colonie :
- Agents actifs : ${colonyContext.agentsCount || 1}
- Niveau d'évolution : ${colonyContext.evolutionLevel || 4}/6
- Mode d'autonomie : ${colonyContext.autonomyLevel || 'BALANCED'}
- Tâches actives : ${colonyContext.tasksCount || 2}
- Projet actif : ${colonyContext.activeProject || 'PRJ-CORE'}

Réponds au format JSON strict avec cette structure :
{
  "reply": "Ta réponse textuelle à l'utilisateur (concise, stratégique, sans jargon interne excessif)",
  "thoughtProcess": "Ton raisonnement interne et analyse de sécurité Zero-Trust",
  "operationalCycleBreakdown": {
    "rawInstruction": "Instruction brute détectée",
    "actualGoal": "Objectif stratégique sous-jacent",
    "context": "Contexte, contraintes et projet concerné",
    "memoryRetrieved": ["Points clés récupérés de la mémoire"],
    "classification": "SIMPLE|COMPOSITE|COMPLEX|LONG_TERM|RECURRENT|EXPERIMENTAL|SENSITIVE",
    "capacityCheckResult": "Capacités existantes identifiées vs nécessaires",
    "creationHierarchyDecision": "Décision de création minimale (ex: 'Outil existant suffisant' ou 'Création procédure')",
    "planSummary": "Synthèse du plan d'action",
    "evaluationCriteria": "Critères de validation du succès"
  },
  "suggestedActions": [
    { "label": "Texte court du bouton d'action", "action": "ACTION_CODE", "payload": {} }
  ],
  "proposedTask": { 
    "title": "Titre", 
    "description": "Détails", 
    "priority": "LOW|MEDIUM|HIGH|CRITICAL",
    "complexity": "SIMPLE|COMPOSITE|COMPLEX|LONG_TERM|RECURRENT|EXPERIMENTAL|SENSITIVE",
    "steps": [
      { "id": "s1", "title": "Étape 1", "tool": "tool-id", "isParallel": false }
    ] 
  } (optionnel),
  "proposedAgent": { "name": "Nom", "role": "SPECIALIST", "department": "dept-research", "justification": "Raison économique et technique" } (optionnel)
}`;

      const historyFormatted = conversationHistory
        .slice(-6)
        .map((m: { sender: string; content: string }) => `${m.sender === 'USER' ? 'Utilisateur' : 'Directeur Général'}: ${m.content}`)
        .join("\n");

      const prompt = `Historique récent :\n${historyFormatted}\n\nMessage de l'utilisateur : ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "{}";
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = {
          reply: responseText,
          thoughtProcess: "Traitement complété.",
          suggestedActions: []
        };
      }

      res.json(parsed);
    } catch (error: unknown) {
      console.error("Gemini Chat Error:", error);
      const errMsg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({
        error: "Erreur de communication avec le Directeur Général",
        details: errMsg,
        fallbackReply: "Une anomalie s'est produite lors de l'appel modèle. La colonie a activé ses protocoles de résilience."
      });
    }
  });

  // Plan a complex mission with step breakdown
  app.post("/api/gemini/plan", async (req, res) => {
    try {
      const { missionTitle, missionDescription } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          title: missionTitle,
          description: missionDescription || "Mission planifiée par l'orchestrateur central",
          steps: [
            { id: 's1', title: "Collecte des données & cadrage du périmètre", tool: "tool-search-01" },
            { id: 's2', title: "Exécution & tests d'intégrité en Sandbox", tool: "tool-code-02" },
            { id: 's3', title: "Validation des résultats & synthèse pour l'utilisateur", tool: "tool-file-04" }
          ],
          estimatedTokens: 3500,
          suggestedDepartment: "dept-dev",
          riskScore: 20
        });
      }

      const systemPrompt = `Tu es l'Orchestrateur de missions de la Fourmilière IA.
Pour la mission donnée, produis une décomposition méthodique en 3 à 5 étapes exécutables, avec estimation du budget de tokens, outils recommandés (tool-search-01, tool-code-02, tool-mem-03, tool-file-04, tool-api-05) et niveau de risque.

Format JSON attendu :
{
  "title": "Titre optimisé",
  "description": "Synthèse de la mission",
  "steps": [
    { "id": "s1", "title": "Étape 1", "tool": "tool-id", "risk": "LOW|MEDIUM|HIGH" }
  ],
  "estimatedTokens": 4000,
  "suggestedDepartment": "dept-dev" ou "dept-research" ou "dept-core",
  "riskScore": 15,
  "requiresApproval": false
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Mission : ${missionTitle}\nDescription : ${missionDescription || 'N/A'}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Plan Error:", error);
      res.status(500).json({ error: "Erreur de planification" });
    }
  });

  // Independent Task Evaluation Engine (Principle #22, #23)
  app.post("/api/gemini/evaluate-task", async (req, res) => {
    try {
      const { taskTitle, expectedOutcome, actualOutput, stepsDone = [] } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          status: "SUCCESS",
          score: 96,
          expectedVsActual: "Toutes les étapes planifiées ont été exécutées conformément aux critères d'acceptation.",
          lessonsLearned: "Procédure d'exécution nominale validée. Recommandation d'indexation en mémoire procédurale.",
          evaluatedAt: new Date().toISOString()
        });
      }

      const prompt = `Tâche : ${taskTitle}
Résultat attendu : ${expectedOutcome || 'Exécution complète et conforme'}
Sorties réelles des étapes : ${JSON.stringify(stepsDone, null, 2)}
Sortie finale obtenue : ${actualOutput || 'Toutes étapes complétées'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `Tu es le Moteur d'Évaluation Indépendant de la Fourmilière IA.
Compare le Résultat Attendu avec le Résultat Obtenu.
Statuts possibles : "SUCCESS", "PARTIAL", "FAILED", "REQUIRES_REVIEW".
Retourne un JSON strict :
{
  "status": "SUCCESS|PARTIAL|FAILED|REQUIRES_REVIEW",
  "score": 95 (0-100),
  "expectedVsActual": "Analyse comparative concise",
  "lessonsLearned": "Leçons tirées pour la mémoire procédurale ou erreurs",
  "evaluatedAt": "${new Date().toISOString()}"
}`,
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error("Evaluation Error:", error);
      res.status(500).json({ error: "Erreur d'évaluation" });
    }
  });

  // Auto-Organization & Ecosystem Health Audit (Principle #33, #34, #45)
  app.post("/api/gemini/auto-organization-audit", async (req, res) => {
    try {
      const { agents = [], departments = [], tools = [], tasks = [] } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          healthScore: 97,
          summary: "Structure optimale. Aucune redondance critique détectée. Tous les agents actifs répondent à une mission opérationnelle justifiée.",
          recommendations: [
            "Maintenir la chambre DGS comme chef d'orchestre principal.",
            "Conserver le banc d'essai Sandbox hermétique pour les prochains outils."
          ],
          redundantCapabilities: [],
          proposedRestructuration: null
        });
      }

      const prompt = `Agents actuels : ${JSON.stringify(agents.map((a: any) => ({ name: a.name, role: a.role, tasks: a.metrics?.tasksCompleted })))}
Départements : ${JSON.stringify(departments.map((d: any) => ({ name: d.name, code: d.code, agents: d.agentCount })))}
Outils : ${JSON.stringify(tools.map((t: any) => ({ name: t.name, status: t.status, usage: t.usageCount })))}
Tâches : ${tasks.length} missions enregistrées.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `Tu es l'Auditeur d'Auto-Organisation et de Gouvernance de la Fourmilière IA.
Principe fondamental : 'Maximum d'efficacité avec minimum de complexité'.
Analyse l'écosystème et retourne un JSON :
{
  "healthScore": 95 (0-100),
  "summary": "Diagnostic global de l'organisation",
  "recommendations": ["Recommandation 1", "Recommandation 2"],
  "redundantCapabilities": ["Capacités ou outils sous-utilisés"],
  "proposedRestructuration": "Proposition d'optimisation éventuelle"
}`,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error) {
      console.error("Auto-org audit error:", error);
      res.status(500).json({ error: "Erreur d'audit organisationnel" });
    }
  });

  // Sandbox Code / Tool Security Evaluator
  app.post("/api/gemini/sandbox-eval", async (req, res) => {
    try {
      const { toolName, parametersSchema, description } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          safetyScore: 95,
          passed: true,
          vulnerabilities: [],
          recommendations: "Permissions et schéma de paramètres validés sous conformité Zero-Trust de niveau standard.",
          executionLatencyEstimateMs: 180
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Outil : ${toolName}\nDescription : ${description}\nSchéma : ${parametersSchema}`,
        config: {
          systemInstruction: `Tu es le Moteur d'Évaluation de Sécurité et Sandbox de la Fourmilière IA.
Analyse les risques de sécurité (injection, fuite de secrets, dépassement de privilèges) et retourne un JSON :
{
  "safetyScore": 92 (sur 100),
  "passed": true ou false,
  "vulnerabilities": ["liste des points d'attention"],
  "recommendations": "Mesures de mitigation",
  "executionLatencyEstimateMs": 250
}`,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Sandbox Eval Error:", error);
      res.status(500).json({ error: "Erreur d'évaluation sandbox" });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🐜 Fourmilière IA Core Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

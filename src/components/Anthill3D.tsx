import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Maximize2, 
  RotateCcw, 
  Play, 
  Pause, 
  Layers, 
  Info, 
  Shield, 
  Activity, 
  Zap, 
  ChevronRight,
  Database,
  Users,
  Box
} from 'lucide-react';
import { Agent, Department, Task, MemoryItem, Tool } from '../types';

interface Anthill3DProps {
  agents: Agent[];
  departments: Department[];
  tasks: Task[];
  memories: MemoryItem[];
  tools: Tool[];
  onSelectAgent?: (agentId: string) => void;
  onSelectTask?: (taskId: string) => void;
}

interface SelectedNodeInfo {
  type: 'CEO' | 'DEPT' | 'AGENT' | 'MEMORY' | 'SANDBOX' | 'TOOL';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  metrics?: Record<string, string | number>;
}

export const Anthill3D: React.FC<Anthill3DProps> = ({
  agents,
  departments,
  tasks,
  memories,
  tools,
  onSelectAgent,
  onSelectTask
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [viewMode, setViewMode] = useState<'3D' | 'TOPOLOGY'>('3D');
  const [colonyActivityRate, setColonyActivityRate] = useState(84);

  // References for Three.js cleanup and animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 16, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x88ccff, 2.5);
    dirLight.position.set(10, 30, 15);
    scene.add(dirLight);

    const centerGlow = new THREE.PointLight(0x3b82f6, 4, 30);
    centerGlow.position.set(0, 4, 0);
    scene.add(centerGlow);

    // Interactive clickable meshes registry
    const clickableObjects: { mesh: THREE.Object3D; data: SelectedNodeInfo }[] = [];

    // Helper: Create Glowing Core Ring
    const gridHelper = new THREE.GridHelper(40, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 5. Build Anthill Tiers / Chamber Topology
    // Chamber 0: Central Queen Chamber (Directeur Général)
    const ceoGeometry = new THREE.DodecahedronGeometry(2.2, 1);
    const ceoMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const ceoMesh = new THREE.Mesh(ceoGeometry, ceoMaterial);
    ceoMesh.position.set(0, 4, 0);
    scene.add(ceoMesh);

    // Outer CEO Wireframe Hologram Shield
    const ceoShieldGeo = new THREE.IcosahedronGeometry(3.0, 1);
    const ceoShieldMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const ceoShield = new THREE.Mesh(ceoShieldGeo, ceoShieldMat);
    ceoShield.position.set(0, 4, 0);
    scene.add(ceoShield);

    clickableObjects.push({
      mesh: ceoMesh,
      data: {
        type: 'CEO',
        id: 'agent-dg-001',
        title: 'Directeur Général IA (NEXUS-PRIME)',
        subtitle: 'Chambre Centrale & Cœur Stratégique',
        description: 'Supervise l\'ensemble des départements, arbitre les ressources et maintient la gouvernance Zero Trust.',
        status: 'Opérationnel - Haute Disponibilité',
        metrics: {
          'Taux de succès': '98.4%',
          'Mémoire active': '7 partitions',
          'Autonomie': 'Équilibrée',
          'Tokens gérés': '42.3k'
        }
      }
    });

    // 6. Departments Rings (Tier 1 & Tier 2 Chambers)
    const deptMeshes: THREE.Mesh[] = [];
    const deptPositions: { x: number; y: number; z: number }[] = [
      { x: -9, y: 1, z: 6 },   // Dev & Code
      { x: 9, y: 1, z: 6 },    // Research & Knowledge
      { x: 0, y: -1, z: -10 }, // Operations & Tools
      { x: -10, y: -2, z: -6 }, // Security & Zero Trust
      { x: 10, y: -2, z: -6 }   // Sandbox Testing Facility
    ];

    departments.forEach((dept, index) => {
      const pos = deptPositions[index % deptPositions.length];
      const deptGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 8);
      const deptColor = new THREE.Color(dept.color || '#10b981');
      const deptMat = new THREE.MeshStandardMaterial({
        color: deptColor,
        emissive: deptColor,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.7
      });
      const deptMesh = new THREE.Mesh(deptGeo, deptMat);
      deptMesh.position.set(pos.x, pos.y, pos.z);
      scene.add(deptMesh);
      deptMeshes.push(deptMesh);

      // Connecting Cyber Tunnel / Data Line to CEO
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(pos.x * 0.5, (pos.y + 4) * 0.5 + 1.5, pos.z * 0.5),
        new THREE.Vector3(pos.x, pos.y + 0.6, pos.z)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.12, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: deptColor,
        transparent: true,
        opacity: 0.5
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      clickableObjects.push({
        mesh: deptMesh,
        data: {
          type: 'DEPT',
          id: dept.id,
          title: `Département : ${dept.name}`,
          subtitle: `Code: ${dept.code} • Niveau ${dept.level}`,
          description: dept.description,
          status: 'Actif & Synchronisé',
          metrics: {
            'Agents affectés': dept.agentCount,
            'Tâches actives': dept.activeTasks,
            'Mission': dept.mission
          }
        }
      });
    });

    // 7. Sub-Agents Nodes (Orbiting their respective departments)
    const agentMeshes: THREE.Mesh[] = [];
    agents.filter(a => a.role !== 'DIRECTEUR_GENERAL').forEach((agent, i) => {
      const parentDeptIndex = i % deptPositions.length;
      const parentPos = deptPositions[parentDeptIndex];
      const angle = (i * 2 * Math.PI) / Math.max(1, agents.length - 1);
      const radius = 3.2;

      const agentGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const agentMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const agentMesh = new THREE.Mesh(agentGeo, agentMat);
      agentMesh.position.set(
        parentPos.x + Math.cos(angle) * radius,
        parentPos.y + 1.2,
        parentPos.z + Math.sin(angle) * radius
      );
      scene.add(agentMesh);
      agentMeshes.push(agentMesh);

      // Connecting tether
      const tetherGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(parentPos.x, parentPos.y, parentPos.z),
        agentMesh.position
      ]);
      const tetherMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
      const tetherLine = new THREE.Line(tetherGeo, tetherMat);
      scene.add(tetherLine);

      clickableObjects.push({
        mesh: agentMesh,
        data: {
          type: 'AGENT',
          id: agent.id,
          title: `Agent : ${agent.name}`,
          subtitle: `${agent.role} • Modèle ${agent.model}`,
          description: agent.specialty,
          status: `Statut: ${agent.status}`,
          metrics: {
            'Succès': `${agent.metrics.successRate}%`,
            'Tâches': agent.metrics.tasksCompleted,
            'Tokens': agent.metrics.tokensConsumed
          }
        }
      });
    });

    // 8. Memory Chamber & Floating Synaptic Nodes (Lower Tier)
    const memoryCoreGeo = new THREE.OctahedronGeometry(1.8, 0);
    const memoryCoreMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.7,
      wireframe: false
    });
    const memoryCore = new THREE.Mesh(memoryCoreGeo, memoryCoreMat);
    memoryCore.position.set(0, -3.5, 0);
    scene.add(memoryCore);

    clickableObjects.push({
      mesh: memoryCore,
      data: {
        type: 'MEMORY',
        id: 'mem-core',
        title: 'Noyau de Mémoire Persistante',
        subtitle: `${memories.length} mémoires indexées • 6 partitions`,
        description: 'Conserve durablement l\'historique épisodique, sémantique, procédural et les retours d\'expérience.',
        status: 'Indexation vectorielle synchronisée',
        metrics: {
          'Partitions': '6 actives',
          'Accès total': '180+',
          'Confiance moy.': '99%'
        }
      }
    });

    // 9. Particle Flow System (Active Task Ants / Cyber Pulses)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 24;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 12 + 1;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 24;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.04
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 10. Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects.map(o => o.mesh));

      if (intersects.length > 0) {
        const hit = clickableObjects.find(o => o.mesh === intersects[0].object);
        if (hit) {
          setSelectedNode(hit.data);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 11. Mouse Drag to Orbit
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = 0;
    let cameraElevation = 16;
    let cameraDistance = 28;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle -= deltaX * 0.006;
      cameraElevation = Math.max(-2, Math.min(30, cameraElevation + deltaY * 0.06));

      camera.position.x = Math.sin(cameraAngle) * cameraDistance;
      camera.position.z = Math.cos(cameraAngle) * cameraDistance;
      camera.position.y = cameraElevation;
      camera.lookAt(0, 1, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance = Math.max(12, Math.min(45, cameraDistance + e.deltaY * 0.02));
      camera.position.x = Math.sin(cameraAngle) * cameraDistance;
      camera.position.z = Math.cos(cameraAngle) * cameraDistance;
      camera.lookAt(0, 1, 0);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // 12. Animation Loop
    let clock = 0;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      clock += 0.02;

      // Rotate CEO and Core elements
      ceoMesh.rotation.y += 0.01;
      ceoMesh.rotation.x = Math.sin(clock * 0.5) * 0.1;
      ceoShield.rotation.y -= 0.006;
      ceoShield.rotation.z += 0.004;

      memoryCore.rotation.y += 0.015;
      memoryCore.rotation.z = Math.cos(clock * 0.6) * 0.15;

      // Animate department pulsation
      deptMeshes.forEach((mesh, idx) => {
        mesh.rotation.y += 0.008 * (idx % 2 === 0 ? 1 : -1);
      });

      // Animate Particles (Ant Task Stream)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleVelocities[i].x;
        positions[idx + 1] += particleVelocities[i].y;
        positions[idx + 2] += particleVelocities[i].z;

        // Reset if too far
        if (Math.abs(positions[idx]) > 16 || Math.abs(positions[idx + 2]) > 16) {
          positions[idx] = (Math.random() - 0.5) * 4;
          positions[idx + 1] = 4;
          positions[idx + 2] = (Math.random() - 0.5) * 4;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Auto rotation when enabled
      if (isAutoRotating && !isDragging) {
        cameraAngle += 0.003;
        camera.position.x = Math.sin(cameraAngle) * cameraDistance;
        camera.position.z = Math.cos(cameraAngle) * cameraDistance;
        camera.lookAt(0, 1, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. Responsive Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 580;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [agents, departments, memories, tools, isAutoRotating]);

  const resetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 16, 28);
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-200 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold">Vue Fourmilière 3D Dynamique</span>
          <span className="text-slate-500">•</span>
          <span className="text-blue-400 font-mono">{agents.length} Agent(s)</span>
          <span className="text-slate-500">•</span>
          <span className="text-purple-400 font-mono">{departments.length} Départements</span>
        </div>

        <button
          id="btn-toggle-rotate-3d"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-300 transition-all shadow-lg"
          title="Activer/Désactiver la rotation automatique"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isAutoRotating ? 'Pause' : 'Rotation'}</span>
        </button>

        <button
          id="btn-reset-camera-3d"
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-300 transition-all shadow-lg"
          title="Réinitialiser l'angle de vue"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
          <span>Recentrer</span>
        </button>
      </div>

      {/* Right Telemetry Legend Panel */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 max-w-xs">
        <div className="p-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-slate-300 shadow-xl space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-100 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Couches de la Colonie</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
              Live Flow
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
              <span className="text-slate-300">Chambre Reine : Directeur Général IA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Chambres des Départements (DGS, DEV, RES)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span className="text-slate-300">Sous-Agents Spécialisés (Orbitaux)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-slate-300">Noyau Synaptique de Mémoire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse"></span>
              <span className="text-slate-300">Flux de Tâches & Particules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Inspector Modal / Overlay (When user clicks any 3D entity) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-4 text-slate-200 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                {selectedNode.type}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{selectedNode.title}</h3>
              <p className="text-xs text-slate-400">{selectedNode.subtitle}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 my-2.5 leading-relaxed">{selectedNode.description}</p>

          {selectedNode.metrics && (
            <div className="grid grid-cols-2 gap-2 my-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
              {Object.entries(selectedNode.metrics).map(([key, val]) => (
                <div key={key}>
                  <span className="text-slate-400 block text-[10px]">{key}</span>
                  <span className="font-semibold text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            {selectedNode.type === 'AGENT' && onSelectAgent && (
              <button
                onClick={() => {
                  onSelectAgent(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <span>Inspecter l'Agent</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Bottom helper prompt */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
        <span>💡 Astuce : <strong>Cliquez</strong> sur un nœud pour l'inspecter • <strong>Glissez</strong> pour tourner</span>
      </div>
    </div>
  );
};

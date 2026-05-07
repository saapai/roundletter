"use client";

import { useRef, useEffect, useState } from "react";

/* ── curated data ──────────────────────────────────────────────── */

interface MemoryNode {
  id: string;
  agent: string;
  text: string;
  confidence: number;
  type: "claim" | "prediction" | "observation" | "correction";
  age: number; // 0=newest, 1=oldest
}

interface TensionEdge {
  src: string;
  tgt: string;
  tension: number;
  kind: "contradiction" | "support";
}

const AGENT_COLORS: Record<string, number> = {
  bull: 0x5f8b4e,
  bear: 0x8b3a2e,
  macro: 0xa67a3a,
  flow: 0x5e7098,
  historian: 0x6b6560,
};

const AGENT_COLOR_HEX: Record<string, string> = {
  bull: "#5F8B4E",
  bear: "#8B3A2E",
  macro: "#A67A3A",
  flow: "#5E7098",
  historian: "#6B6560",
};

const nodes: MemoryNode[] = [
  // Bull coil
  { id: "bull-1", agent: "bull", text: "IONQ's 10-year thesis overrides short-term noise", confidence: 0.70, type: "claim", age: 0.3 },
  { id: "bull-2", agent: "bull", text: "roughly 40% thesis, 30% sector beta, 20% flow squeeze", confidence: 0.52, type: "claim", age: 0.5 },
  { id: "bull-3", agent: "bull", text: "pre-revenue optionality is systematically underpriced", confidence: 0.70, type: "prediction", age: 0.2 },
  { id: "bull-4", agent: "bull", text: "up on IONQ at 0.70 confidence", confidence: 0.70, type: "prediction", age: 0.1 },
  { id: "bull-5", agent: "bull", text: "quantum sector momentum is structural", confidence: 0.65, type: "claim", age: 0.4 },
  // Bear coil
  { id: "bear-1", agent: "bear", text: "IONQ ATM shelf creates 60%+ drawdown risk", confidence: 0.70, type: "claim", age: 0.2 },
  { id: "bear-2", agent: "bear", text: "structural dilution is the silent killer", confidence: 0.70, type: "claim", age: 0.3 },
  { id: "bear-3", agent: "bear", text: "pre-revenue names drop 15%+ within 60 days", confidence: 0.58, type: "prediction", age: 0.5 },
  { id: "bear-4", agent: "bear", text: "this is distribution, not accumulation", confidence: 0.70, type: "claim", age: 0.1 },
  // Macro coil
  { id: "macro-1", agent: "macro", text: "macro regime binds IONQ to liquidity", confidence: 0.70, type: "claim", age: 0.3 },
  { id: "macro-2", agent: "macro", text: "10Y yield compresses quantum valuations", confidence: 0.55, type: "observation", age: 0.6 },
  { id: "macro-3", agent: "macro", text: "rate environment overrides stock-level thesis", confidence: 0.70, type: "claim", age: 0.2 },
  // Flow coil
  { id: "flow-1", agent: "flow", text: "60-70% dealer gamma, rest is retail", confidence: 0.62, type: "observation", age: 0.4 },
  { id: "flow-2", agent: "flow", text: "flow diverges from consensus — bearish", confidence: 0.70, type: "claim", age: 0.2 },
  { id: "flow-3", agent: "flow", text: "put/call ratio signals downside", confidence: 0.70, type: "claim", age: 0.3 },
  { id: "flow-4", agent: "flow", text: "changed from up to down on IONQ", confidence: 0.70, type: "correction", age: 0.05 },
  // Historian coil
  { id: "hist-1", agent: "historian", text: "90%+ of pre-revenue pure-plays fail at 10yr", confidence: 0.68, type: "claim", age: 0.5 },
  { id: "hist-2", agent: "historian", text: "1999 dot-com: indices beat individual names", confidence: 0.70, type: "claim", age: 0.7 },
  { id: "hist-3", agent: "historian", text: "survivorship bias infects every bull case", confidence: 0.70, type: "observation", age: 0.4 },
];

const edges: TensionEdge[] = [
  { src: "bull-1", tgt: "hist-1", tension: 1.74, kind: "contradiction" },
  { src: "bull-3", tgt: "bear-1", tension: 1.65, kind: "contradiction" },
  { src: "bull-1", tgt: "macro-1", tension: 1.60, kind: "contradiction" },
  { src: "flow-4", tgt: "bull-4", tension: 1.65, kind: "contradiction" },
  { src: "bear-4", tgt: "bull-5", tension: 1.59, kind: "contradiction" },
  // some lower-tension supports for visual variety
  { src: "bear-1", tgt: "bear-2", tension: 0.6, kind: "support" },
  { src: "macro-2", tgt: "macro-3", tension: 0.5, kind: "support" },
  { src: "hist-1", tgt: "hist-3", tension: 0.4, kind: "support" },
  { src: "flow-2", tgt: "flow-3", tension: 0.55, kind: "support" },
  { src: "bear-3", tgt: "hist-1", tension: 1.2, kind: "contradiction" },
  { src: "flow-1", tgt: "bull-2", tension: 1.1, kind: "contradiction" },
];

/* ── component ─────────────────────────────────────────────────── */

export default function CoilVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    async function init() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      if (destroyed || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = 600;

      // ── Scene setup ──
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
      camera.position.set(12, 8, 14);
      camera.lookAt(0, 2, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // ── Controls ──
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.minDistance = 6;
      controls.maxDistance = 35;

      // ── Lighting ──
      const ambient = new THREE.AmbientLight(0x333333, 1.5);
      scene.add(ambient);
      const point = new THREE.PointLight(0xffeedd, 2, 50);
      point.position.set(0, 6, 0);
      scene.add(point);
      const point2 = new THREE.PointLight(0x8b3a2e, 0.8, 30);
      point2.position.set(-5, 3, 5);
      scene.add(point2);

      // ── Build helix positions ──
      const agentOrder = ["bull", "bear", "macro", "flow", "historian"];
      const helixRadius = 1.8;
      const helixPitch = 1.2;
      const coilSpacing = 4.5;
      const nodePositions: Record<string, any> = {};
      const nodeMeshes: any[] = [];
      const nodeDataMap = new Map<any, MemoryNode>();

      // Group nodes by agent
      const agentNodes: Record<string, MemoryNode[]> = {};
      for (const n of nodes) {
        if (!agentNodes[n.agent]) agentNodes[n.agent] = [];
        agentNodes[n.agent].push(n);
      }

      // Create helix backbone tubes per agent
      agentOrder.forEach((agent, ai) => {
        const agentNodeList = agentNodes[agent] || [];
        const offsetX = (ai - 2) * coilSpacing;
        const color = AGENT_COLORS[agent];
        const totalTurns = 2.5;
        const pointsPerTurn = 32;
        const totalPoints = Math.floor(totalTurns * pointsPerTurn);

        // Build helix curve for the backbone
        const curvePoints: any[] = [];
        for (let i = 0; i <= totalPoints; i++) {
          const t = (i / totalPoints) * totalTurns * Math.PI * 2;
          const x = offsetX + helixRadius * Math.cos(t);
          const y = (t / (Math.PI * 2)) * helixPitch * 2;
          const z = helixRadius * Math.sin(t);
          curvePoints.push(new THREE.Vector3(x, y, z));
        }

        // Tube backbone
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.04, 6, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.15,
          transparent: true,
          opacity: 0.4,
          roughness: 0.7,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tube);

        // Place nodes along the helix
        agentNodeList.forEach((node, ni) => {
          const frac = (ni + 0.5) / agentNodeList.length;
          const t = frac * totalTurns * Math.PI * 2;
          const x = offsetX + helixRadius * Math.cos(t);
          const y = (t / (Math.PI * 2)) * helixPitch * 2;
          const z = helixRadius * Math.sin(t);
          const pos = new THREE.Vector3(x, y, z);
          nodePositions[node.id] = pos;

          // Node sphere — size by confidence, opacity by recency
          const radius = 0.15 + node.confidence * 0.25;
          const geo = new THREE.IcosahedronGeometry(radius, 1);
          const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.4 + (1 - node.age) * 0.6,
            roughness: 0.4,
            metalness: 0.2,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(pos);
          scene.add(mesh);
          nodeMeshes.push(mesh);
          nodeDataMap.set(mesh, node);
        });
      });

      // ── Edges ──
      const edgeMeshes: {
        line: any;
        tension: number;
        kind: string;
      }[] = [];

      edges.forEach((edge) => {
        const p1 = nodePositions[edge.src];
        const p2 = nodePositions[edge.tgt];
        if (!p1 || !p2) return;

        const points = [p1, p2];
        const geo = new THREE.BufferGeometry().setFromPoints(points);

        const isContra = edge.kind === "contradiction";
        const color = isContra ? 0xcc4433 : 0x444444;
        const opacity = isContra
          ? Math.min(1, 0.3 + edge.tension * 0.35)
          : 0.2;

        const mat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          linewidth: 1,
        });

        const line = new THREE.Line(geo, mat);
        scene.add(line);
        edgeMeshes.push({ line, tension: edge.tension, kind: edge.kind });

        // Glow effect for high-tension edges
        if (isContra && edge.tension > 1.5) {
          // Add a wider, dimmer line for glow
          const glowMat = new THREE.LineBasicMaterial({
            color: 0xff6644,
            transparent: true,
            opacity: 0.12,
            linewidth: 1,
          });
          const glowLine = new THREE.Line(geo.clone(), glowMat);
          scene.add(glowLine);
          edgeMeshes.push({
            line: glowLine,
            tension: edge.tension,
            kind: "glow",
          });

          // Small glowing sphere at midpoint for high-tension bonds
          const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.5);
          const glowSphereGeo = new THREE.SphereGeometry(0.06, 8, 8);
          const glowSphereMat = new THREE.MeshBasicMaterial({
            color: 0xff5533,
            transparent: true,
            opacity: 0.6,
          });
          const glowSphere = new THREE.Mesh(glowSphereGeo, glowSphereMat);
          glowSphere.position.copy(mid);
          scene.add(glowSphere);
        }
      });

      // ── Tension field (topographic wireframe surface) ──
      const planeSize = 24;
      const planeSegments = 48;
      const planeGeo = new THREE.PlaneGeometry(
        planeSize,
        planeSize,
        planeSegments,
        planeSegments
      );
      planeGeo.rotateX(-Math.PI / 2);
      const planePositions = planeGeo.attributes.position;
      const planeColors = new Float32Array(planePositions.count * 3);

      // Collect high-tension node positions
      const tensionSources: { pos: any; weight: number }[] = [];
      edges.forEach((e) => {
        if (e.kind === "contradiction") {
          const p1 = nodePositions[e.src];
          const p2 = nodePositions[e.tgt];
          if (p1 && p2) {
            const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.5);
            tensionSources.push({ pos: mid, weight: e.tension });
          }
        }
      });

      for (let i = 0; i < planePositions.count; i++) {
        const x = planePositions.getX(i);
        const z = planePositions.getZ(i);
        let height = 0;
        for (const src of tensionSources) {
          const dx = x - src.pos.x;
          const dz = z - src.pos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          height += (src.weight * 1.2) / (1 + dist * dist * 0.3);
        }
        planePositions.setY(i, -1.5 + height * 0.3);

        // Color: black to amber at peaks
        const t = Math.min(1, height / 3);
        planeColors[i * 3] = t * 0.65; // R
        planeColors[i * 3 + 1] = t * 0.48; // G
        planeColors[i * 3 + 2] = t * 0.15; // B
      }

      planeGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(planeColors, 3)
      );
      planeGeo.computeVertexNormals();

      const planeMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      scene.add(planeMesh);

      // ── Raycaster + Tooltip ──
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let hoveredMesh: any = null;

      function onMouseMove(event: MouseEvent) {
        if (!containerRef.current || !tooltipRef.current) return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);

        if (intersects.length > 0) {
          const mesh = intersects[0].object as any;
          const data = nodeDataMap.get(mesh);
          if (data && tooltipRef.current) {
            hoveredMesh = mesh;
            const tip = tooltipRef.current;
            tip.style.display = "block";
            tip.style.left = `${event.clientX - rect.left + 12}px`;
            tip.style.top = `${event.clientY - rect.top - 12}px`;
            tip.innerHTML = `<span style="color:${AGENT_COLOR_HEX[data.agent]};font-weight:600">${data.agent}</span> <span style="opacity:0.5">${data.type}</span><br/><span style="font-size:11px;opacity:0.85">${data.text}</span><br/><span style="font-size:10px;opacity:0.5">confidence: ${data.confidence.toFixed(2)} · age: ${((1 - data.age) * 100).toFixed(0)}% recent</span>`;
          }
        } else {
          hoveredMesh = null;
          if (tooltipRef.current) tooltipRef.current.style.display = "none";
        }
      }

      renderer.domElement.addEventListener("mousemove", onMouseMove);

      // ── Animate ──
      let time = 0;

      function animate() {
        if (destroyed) return;
        frameRef.current = requestAnimationFrame(animate);
        time += 0.016;

        // Breathing
        const breathe = 0.98 + Math.sin(time * 0.5) * 0.02;
        scene.scale.set(breathe, breathe, breathe);

        // Pulse contradiction edges
        edgeMeshes.forEach(({ line, tension, kind }) => {
          if (kind === "contradiction" || kind === "glow") {
            const mat = line.material as any;
            const base =
              kind === "glow" ? 0.08 : Math.min(1, 0.3 + tension * 0.3);
            const pulse = Math.sin(time * 2 + tension * 3) * 0.15;
            mat.opacity = Math.max(0.05, base + pulse);
          }
        });

        // Highlight hovered node
        nodeMeshes.forEach((mesh) => {
          const mat = mesh.material as any;
          if (mesh === hoveredMesh) {
            mat.emissiveIntensity = 0.8;
          } else {
            mat.emissiveIntensity = 0.3;
          }
        });

        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      setReady(true);

      // ── Resize ──
      function onResize() {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = 600;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      // ── Cleanup ──
      return () => {
        destroyed = true;
        cancelAnimationFrame(frameRef.current);
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
        renderer.dispose();
        if (
          container &&
          renderer.domElement &&
          container.contains(renderer.domElement)
        ) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    const cleanup = init();
    return () => {
      cleanup.then((fn) => fn?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", margin: "2rem 0" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: 600,
          borderRadius: 6,
          overflow: "hidden",
          background: "#0a0a0a",
          cursor: "grab",
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          pointerEvents: "none",
          background: "rgba(10,10,10,0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4,
          padding: "8px 12px",
          color: "#ccc",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 12,
          lineHeight: 1.5,
          maxWidth: 320,
          zIndex: 10,
          backdropFilter: "blur(6px)",
        }}
      />
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
          }}
        >
          loading molecular structure...
        </div>
      )}
      <p
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 11,
          color: "#6B6560",
          textAlign: "center",
          marginTop: 8,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
        }}
      >
        the memory graph — {nodes.length} nodes from 5 agents. red bonds =
        unresolved contradictions. brightness = tension strength.
      </p>
    </div>
  );
}

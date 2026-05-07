// Entrenched Coils — Tension-Graph Memory System
// Public API

export { getMemoryDb, closeMemoryDb, insertNode, insertEdge, getNode, resolveNode, getGraphStats } from "./db";
export { retrieve, formatMemoryForPrompt } from "./traverse";
export { extractAndStore } from "./update";
export { computeEdgeWeights, computeCurrentSalience, computeTensionWeight } from "./weights";
export { runSleepCycle, slowWaveSleep, remSleep, wakePrep, formatMorningBriefing } from "./sleep";
export { applyReconsolidationOnRetrieval, restabilizeExpiredNodes, updateLabilNode, isNodeLabile, getReconsolidationStats, ensureReconsolidationSchema } from "./reconsolidation";
export { applyDopamineUpdate, computeRPE, resolvePredictionsWithDopamine, getDopamineStats, ensureDopamineSchema } from "./dopamine";
export type { PredictionOutcome, DopamineUpdateResult } from "./dopamine";
export type { MemoryNode, MemoryEdge, MemoryContext, RetrievedMemory, InsertNodeInput, InsertEdgeInput, AgentIdentitySnapshot } from "./types";
export type { SleepParams, SleepCycleResult, SlowWaveResult, RemResult, WakePrepResult } from "./sleep";

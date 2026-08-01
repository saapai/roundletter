// Entrenched Coils — Tension-Graph Memory System
// Public API

export { getMemoryDb, closeMemoryDb, insertNode, insertEdge, getNode, resolveNode, getGraphStats } from "./db";
export { retrieve, formatMemoryForPrompt, computeNeuromodState } from "./traverse";
export { extractAndStore } from "./update";
export { computeEdgeWeights, computeCurrentSalience, computeTensionWeight } from "./weights";
export { runSleepCycle, slowWaveSleep, remSleep, wakePrep, formatMorningBriefing } from "./sleep";
export { applyReconsolidationOnRetrieval, restabilizeExpiredNodes, updateLabilNode, isNodeLabile, getReconsolidationStats, ensureReconsolidationSchema } from "./reconsolidation";
export { applyDopamineUpdate, computeRPE, resolvePredictionsWithDopamine, getDopamineStats, ensureDopamineSchema, computeTradeRPE, applyTradeRPE } from "./dopamine";
export type { PredictionOutcome, DopamineUpdateResult, TradeOutcome } from "./dopamine";
export { ingestSignals, writeTensionHistory, ensureTensionHistorySchema, computeTensionVelocity } from "./signal-ingestion";
export type { SignalInput, CoilsHolding } from "./signal-ingestion";
export type { MemoryNode, MemoryEdge, MemoryContext, RetrievedMemory, InsertNodeInput, InsertEdgeInput, AgentIdentitySnapshot, MemoryAgentId, NeuromodState } from "./types";
export type { SleepParams, SleepCycleResult, SlowWaveResult, RemResult, WakePrepResult } from "./sleep";

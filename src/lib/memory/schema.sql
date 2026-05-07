-- Entrenched Coils: Tension-Graph Memory Architecture
-- Weighted directed graph where nodes are memory units and edges encode
-- temporal proximity, conviction strength, and contradiction tension.
-- Retrieval walks high-tension edges first — contradictions are information.

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ── MEMORY NODES ────────────────────────────────────────────────────────────
-- Each node is a discrete memory unit: a claim, prediction, or observation

CREATE TABLE IF NOT EXISTS memory_nodes (
  id              TEXT PRIMARY KEY,
  agent_id        TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  last_accessed   TEXT NOT NULL,
  access_count    INTEGER NOT NULL DEFAULT 0,

  content         TEXT NOT NULL,
  content_type    TEXT NOT NULL CHECK(content_type IN (
    'claim', 'prediction', 'observation', 'correction', 'identity'
  )),

  debate_id       TEXT,
  ticker          TEXT,
  direction       TEXT CHECK(direction IN ('up', 'down', 'flat')),
  confidence      REAL,

  salience        REAL NOT NULL DEFAULT 1.0,
  decay_rate      REAL NOT NULL DEFAULT 0.05,
  is_compressed   INTEGER NOT NULL DEFAULT 0,
  compressed_from TEXT,

  resolved        INTEGER NOT NULL DEFAULT 0,
  outcome_correct INTEGER,
  brier_component REAL
);

CREATE INDEX IF NOT EXISTS idx_mn_agent ON memory_nodes(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mn_ticker ON memory_nodes(ticker, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mn_type ON memory_nodes(content_type, agent_id);
CREATE INDEX IF NOT EXISTS idx_mn_salience ON memory_nodes(agent_id, salience DESC);
CREATE INDEX IF NOT EXISTS idx_mn_unresolved ON memory_nodes(agent_id, resolved, content_type);

-- ── MEMORY EDGES (the "coils") ──────────────────────────────────────────────
-- Directed edges encoding tension, agreement, or sequence

CREATE TABLE IF NOT EXISTS memory_edges (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id       TEXT NOT NULL REFERENCES memory_nodes(id),
  target_id       TEXT NOT NULL REFERENCES memory_nodes(id),
  agent_id        TEXT NOT NULL,

  edge_type       TEXT NOT NULL CHECK(edge_type IN (
    'contradicts', 'supports', 'follows', 'corrects', 'evolves'
  )),

  w_temporal      REAL NOT NULL DEFAULT 1.0,
  w_conviction    REAL NOT NULL DEFAULT 0.5,
  w_tension       REAL NOT NULL DEFAULT 0.0,
  weight          REAL NOT NULL DEFAULT 1.0,

  created_at      TEXT NOT NULL,
  last_traversed  TEXT,
  traversal_count INTEGER NOT NULL DEFAULT 0,

  UNIQUE(source_id, target_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_me_source ON memory_edges(source_id, weight DESC);
CREATE INDEX IF NOT EXISTS idx_me_target ON memory_edges(target_id, weight DESC);
CREATE INDEX IF NOT EXISTS idx_me_agent ON memory_edges(agent_id, weight DESC);
CREATE INDEX IF NOT EXISTS idx_me_tension ON memory_edges(agent_id, w_tension DESC);

-- ── AGENT IDENTITY ──────────────────────────────────────────────────────────
-- Persistent evolving persona state — versioned snapshots

CREATE TABLE IF NOT EXISTS agent_identity (
  agent_id        TEXT NOT NULL,
  version         INTEGER NOT NULL,
  updated_at      TEXT NOT NULL,
  identity_text   TEXT NOT NULL,
  core_beliefs    TEXT NOT NULL,
  prediction_bias TEXT,
  avg_confidence  REAL,
  calibration     REAL,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (agent_id, version)
);

-- ── BENCHMARK TRACKING ──────────────────────────────────────────────────────
-- A/B: tension-graph vs flat retrieval vs no memory

CREATE TABLE IF NOT EXISTS benchmark_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id       TEXT NOT NULL,
  ts              TEXT NOT NULL,
  method          TEXT NOT NULL CHECK(method IN ('tension_graph', 'flat_cosine', 'no_memory')),
  agent_id        TEXT NOT NULL,
  memories_retrieved INTEGER NOT NULL,
  avg_tension     REAL,
  max_tension     REAL,
  retrieval_ms    INTEGER NOT NULL,
  prediction      TEXT CHECK(prediction IN ('up', 'down', 'flat')),
  confidence      REAL,
  outcome_correct INTEGER,
  brier_score     REAL
);

CREATE INDEX IF NOT EXISTS idx_bench_method ON benchmark_runs(method, ts DESC);

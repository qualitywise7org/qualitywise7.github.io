// ============================================================
// Findme dimension helpers (LOGIC ONLY — no data).
//
// The cluster/dimension DATA (dim_groups, dim_info, clusters, products,
// stages) now lives in the database and arrives in the loaded bank
// (see findme-app.js loadQuestionBank -> tests/findme_career_v1 payload).
// This module holds only the small pure functions that DERIVE things from
// that data, which used to be constants/functions in the old
// findme-clusters.js. They take the data as arguments instead of importing it.
//
// Pure ES module: no DOM, no network, so the Node tests run the same logic.
// ============================================================

// Flat list of every dimension, in group order (was the DIMS const).
//   dimsOf(bank.dim_groups) === the old DIMS
export function dimsOf(dimGroups) {
  return Object.values(dimGroups || {}).flatMap((g) => g.dims);
}

// The group name ("riasec" | "big5" | "talent" | "values") that owns a dim.
export function dimGroupOf(dimGroups, dim) {
  for (const [name, g] of Object.entries(dimGroups || {})) if (g.dims.includes(dim)) return name;
  return null;
}

// Cluster keys, in definition order (was the CLUSTER_KEYS const).
export function clusterKeysOf(clusters) {
  return Object.keys(clusters || {});
}

// Full-length vector for a cluster (missing dims = 0), in dims order.
// (was clusterVector(key) in findme-clusters.js)
export function clusterVectorOf(clusters, dims, key) {
  const v = (clusters[key] && clusters[key].vector) || {};
  return dims.map((d) => v[d] || 0);
}

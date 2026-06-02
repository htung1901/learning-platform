import Course from "../models/Course.js";

/**
 * Build a map of courseId -> course document for candidates.
 * @param {Array} courses
 * @returns {Map<string, Object>}
 */
function buildCourseMap(courses) {
  const map = new Map();
  for (const c of courses) map.set(String(c._id), c);
  return map;
}

/**
 * Topological sort (Kahn) on courses using `prerequisites` edges.
 * Returns an array of courseIds in topo order if acyclic, otherwise null.
 */
function topoSort(courses) {
  const map = buildCourseMap(courses);
  const inDeg = new Map();
  const adj = new Map();
  for (const [id, c] of map) {
    inDeg.set(id, 0);
    adj.set(id, new Set());
  }
  for (const [id, c] of map) {
    for (const pre of c.prerequisites || []) {
      if (!map.has(pre)) continue;
      adj.get(pre).add(id);
      inDeg.set(id, inDeg.get(id) + 1);
    }
  }
  const q = [];
  for (const [id, deg] of inDeg) if (deg === 0) q.push(id);
  const out = [];
  while (q.length) {
    const n = q.shift();
    out.push(n);
    for (const nb of adj.get(n)) {
      inDeg.set(nb, inDeg.get(nb) - 1);
      if (inDeg.get(nb) === 0) q.push(nb);
    }
  }
  if (out.length !== map.size) return null;
  return out;
}

/**
 * Compute prerequisite closure for each course (memoized DFS).
 * Returns Map courseId -> Set(courseId...)
 */
function computeClosures(courses) {
  const map = buildCourseMap(courses);
  const memo = new Map();
  const visit = (id, seen = new Set()) => {
    if (memo.has(id)) return memo.get(id);
    const res = new Set();
    const course = map.get(id);
    if (!course) return res;
    for (const pre of course.prerequisites || []) {
      if (!map.has(pre)) continue;
      if (seen.has(pre)) continue; // avoid cycles
      seen.add(pre);
      res.add(pre);
      const sub = visit(pre, seen);
      for (const x of sub) res.add(x);
    }
    memo.set(id, res);
    return res;
  };
  for (const id of map.keys()) visit(id, new Set());
  return memo;
}

/**
 * Build bundles: for each course, the closure set + the course itself.
 * Bundle has ids set, totalDuration (seconds), totalValueScore.
 */
function buildBundles(courses) {
  const map = buildCourseMap(courses);
  const closures = computeClosures(courses);
  const bundles = [];
  for (const [id, course] of map) {
    const set = new Set(closures.get(id) || []);
    set.add(id);
    let duration = 0;
    let value = 0;
    for (const cid of set) {
      const c = map.get(cid);
      if (!c) continue;
      duration += c.totalDuration || 0;
      value += c.valueScore || 0;
    }
    bundles.push({ ids: Array.from(set), duration, value, root: id });
  }
  return bundles;
}

/**
 * Convert seconds to knapsack minutes so the DP works on a smaller scale.
 * We round up to avoid undercounting short lessons.
 */
function toKnapsackMinutes(seconds) {
  return Math.max(1, Math.ceil((Number(seconds) || 0) / 60));
}

/**
 * Select bundles using 0/1 knapsack DP in minutes.
 */
function selectBundlesDP(bundles, capacityMinutes) {
  const cap = Math.max(0, Math.floor(Number(capacityMinutes) || 0));
  const n = bundles.length;
  const w = bundles.map((b) => toKnapsackMinutes(b.duration));
  const v = bundles.map((b) => b.value);
  // DP table 1D
  const dp = new Array(cap + 1).fill(0);
  const pick = Array.from({ length: n }, () => new Array(cap + 1).fill(false));
  for (let i = 0; i < n; i++) {
    for (let j = cap; j >= w[i]; j--) {
      const cand = dp[j - w[i]] + v[i];
      if (cand > dp[j]) {
        dp[j] = cand;
        pick[i][j] = true;
      }
    }
  }
  // Reconstruct picks
  let j = cap;
  const chosen = new Set();
  for (let i = n - 1; i >= 0; i--) {
    if (pick[i][j]) {
      chosen.add(i);
      j -= w[i];
    }
  }
  // Combine chosen bundles into course set, preserving topo ordering later
  const chosenCourseIds = new Set();
  let totalDuration = 0;
  let totalValue = 0;
  for (const idx of chosen) {
    for (const cid of bundles[idx].ids) chosenCourseIds.add(cid);
    totalDuration += bundles[idx].duration;
    totalValue += bundles[idx].value;
  }
  return { chosenCourseIds, totalDuration, totalValue };
}

/**
 * Fallback greedy heuristic for large input: sort by value/minute ratio.
 */
function heuristicSelect(bundles, capacityMinutes) {
  const items = bundles.map((b) => ({
    ...b,
    minutes: toKnapsackMinutes(b.duration),
    ratio: b.value / Math.max(1, toKnapsackMinutes(b.duration)),
  }));
  items.sort((a, b) => b.ratio - a.ratio);
  const chosenCourseIds = new Set();
  let usedMinutes = 0;
  let totalValue = 0;
  for (const it of items) {
    // skip if any id already included
    const overlap = it.ids.some((id) => chosenCourseIds.has(id));
    if (overlap) continue;
    if (usedMinutes + it.minutes <= capacityMinutes) {
      for (const id of it.ids) chosenCourseIds.add(id);
      usedMinutes += it.minutes;
      totalValue += it.value;
    }
  }
  return { chosenCourseIds, totalDuration: usedMinutes * 60, totalValue };
}

/**
 * Main entry: generate learning path for a user given time limit (seconds).
 * Filters: only approved courses, excludes instructor-owned and enrolled courses (caller handles filter)
 */
export async function generateLearningPath({
  candidateFilter = {},
  timeLimitSeconds = 0,
}) {
  // Fetch candidate courses
  const courses = await Course.find(candidateFilter).lean();
  if (!courses || courses.length === 0)
    return { coursesOrdered: [], totalDuration: 0, totalValue: 0 };
  // Build bundles and try DP if small enough
  const bundles = buildBundles(courses);
  const timeLimitMinutes = toKnapsackMinutes(timeLimitSeconds);
  if (bundles.length <= 60) {
    const dpRes = selectBundlesDP(bundles, timeLimitMinutes);
    const topo = topoSort(courses) || courses.map((c) => String(c._id));
    // Order chosen courses by topo
    const chosen = Array.from(dpRes.chosenCourseIds);
    const chosenSet = new Set(chosen);
    const ordered = topo
      .filter((id) => chosenSet.has(id))
      .map((id) => courses.find((c) => String(c._id) === id));
    return {
      coursesOrdered: ordered,
      totalDuration: dpRes.totalDuration,
      totalValue: dpRes.totalValue,
    };
  }
  // fallback heuristic
  const heur = heuristicSelect(bundles, timeLimitMinutes);
  const topo = topoSort(courses) || courses.map((c) => String(c._id));
  const chosenSet = new Set(Array.from(heur.chosenCourseIds));
  const ordered = topo
    .filter((id) => chosenSet.has(id))
    .map((id) => courses.find((c) => String(c._id) === id));
  return {
    coursesOrdered: ordered,
    totalDuration: heur.totalDuration,
    totalValue: heur.totalValue,
  };
}

export {
  buildCourseMap,
  topoSort,
  computeClosures,
  buildBundles,
  toKnapsackMinutes,
  selectBundlesDP,
  heuristicSelect,
};

export default { generateLearningPath };

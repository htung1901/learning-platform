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



function branchAndBoundSelect(courses, timeLimitSeconds) {
  let bestValue = 0;
  let bestChosen = new Set();
  let bestDuration = 0;

  const map = buildCourseMap(courses);
  const out = topoSort(courses);
  const topo = out || courses.map((c) => String(c._id));
  const n = topo.length;
  const items = topo.map((id) => map.get(id));

  // Compute descendants to quickly invalidate paths
  const descendants = new Map();
  for (const id of topo) descendants.set(id, new Set());
  for (const id of topo) {
    const c = map.get(id);
    for (const pre of c.prerequisites || []) {
      if (descendants.has(pre)) {
        descendants.get(pre).add(id);
      }
    }
  }

  const descClosure = new Map();
  const getDesc = (id) => {
    if (descClosure.has(id)) return descClosure.get(id);
    const res = new Set();
    for (const child of descendants.get(id)) {
      res.add(child);
      for (const gc of getDesc(child)) res.add(gc);
    }
    descClosure.set(id, res);
    return res;
  };
  for (const id of topo) getDesc(id);

  function getUpperBound(idx, currentWeight, currentValue, validSet) {
    const remain = [];
    for (let i = idx; i < n; i++) {
      if (validSet.has(topo[i])) {
        const c = items[i];
        if (c)
          remain.push({
            id: topo[i],
            w: c.totalDuration || 0,
            v: c.valueScore || 0,
          });
      }
    }
    remain.sort((a, b) => b.v / Math.max(1, b.w) - a.v / Math.max(1, a.w));

    let bound = currentValue;
    let cap = timeLimitSeconds - currentWeight;
    for (const item of remain) {
      if (item.w <= cap) {
        cap -= item.w;
        bound += item.v;
      } else {
        bound += item.v * (cap / Math.max(1, item.w));
        break;
      }
    }
    return bound;
  }

  const startTime = Date.now();
  const MAX_EXECUTION_TIME_MS = 3000; // 3 seconds max for B&B

  function dfs(idx, currentWeight, currentValue, validSet, chosenSet) {
    if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) return;

    if (idx === n) {
      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestChosen = new Set(chosenSet);
        bestDuration = currentWeight;
      }
      return;
    }

    const bound = getUpperBound(idx, currentWeight, currentValue, validSet);
    if (bound <= bestValue) return; // Prune

    const id = topo[idx];
    const course = items[idx];
    const weight = course ? course.totalDuration || 0 : 0;
    const value = course ? course.valueScore || 0 : 0;

    // Branch 1: Pick item
    if (validSet.has(id) && currentWeight + weight <= timeLimitSeconds) {
      let prereqsMet = true;
      for (const pre of course.prerequisites || []) {
        if (map.has(pre) && !chosenSet.has(pre)) {
          prereqsMet = false;
          break;
        }
      }
      if (prereqsMet) {
        chosenSet.add(id);
        dfs(
          idx + 1,
          currentWeight + weight,
          currentValue + value,
          validSet,
          chosenSet,
        );
        chosenSet.delete(id);
      }
    }

    // Branch 2: Do NOT pick item
    const newValidSet = new Set(validSet);
    newValidSet.delete(id);
    for (const desc of descClosure.get(id)) {
      newValidSet.delete(desc);
    }
    dfs(idx + 1, currentWeight, currentValue, newValidSet, chosenSet);
  }

  const initialValid = new Set(topo);
  dfs(0, 0, 0, initialValid, new Set());

  return {
    chosenCourseIds: bestChosen,
    totalDuration: bestDuration,
    totalValue: bestValue,
  };
}

/**
 * Main entry: generate learning path for a user given time limit (seconds).
 * Filters: only approved courses, excludes instructor-owned and enrolled courses (caller handles filter)
 * Returns empty if time limit < 60 seconds (1 minute minimum).
 */
export async function generateLearningPath({
  candidateFilter = {},
  timeLimitSeconds = 0,
}) {
  // Early return for insufficient time
  if (timeLimitSeconds < 60) {
    return { coursesOrdered: [], totalDuration: 0, totalValue: 0 };
  }

  // Fetch candidate courses
  const courses = await Course.find(candidateFilter).lean();
  if (!courses || courses.length === 0)
    return { coursesOrdered: [], totalDuration: 0, totalValue: 0 };

  const { chosenCourseIds, totalDuration, totalValue } = branchAndBoundSelect(
    courses,
    timeLimitSeconds,
  );

  const topo = topoSort(courses) || courses.map((c) => String(c._id));
  const chosenSet = new Set(Array.from(chosenCourseIds));
  const ordered = topo
    .filter((id) => chosenSet.has(id))
    .map((id) => courses.find((c) => String(c._id) === id));

  return {
    coursesOrdered: ordered,
    totalDuration,
    totalValue,
  };
}

export { buildCourseMap, topoSort, branchAndBoundSelect };

export default { generateLearningPath };

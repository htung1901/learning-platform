import Course from "../models/Course.js";

const LEVEL_DIFFICULTY_SCORE = {
  beginner: 4,
  intermediate: 7,
  advanced: 10,
};

function toOneDecimal(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function computeExerciseScore(lessons = []) {
  const practiceCount = lessons.filter(
    (lesson) => lesson?.lessonType === "practice",
  ).length;

  if (practiceCount < 3) return 3;
  if (practiceCount <= 6) return 6;
  return 10;
}

function deriveValueScoreFactors(course) {
  const ratingAvg = Number(course?.ratingAvg || 0);
  const difficultyScore =
    LEVEL_DIFFICULTY_SCORE[course?.level] ?? LEVEL_DIFFICULTY_SCORE.beginner;
  const exerciseScore = computeExerciseScore(course?.lessons || []);
  const ratingScoreCurrentModel = Math.min(10, Math.max(0, ratingAvg * 2));

  const formulaByRequestRaw =
    0.5 * ratingAvg + 0.3 * difficultyScore + 0.2 * exerciseScore;
  const formulaCurrentModelRaw =
    0.5 * ratingScoreCurrentModel + 0.3 * difficultyScore + 0.2 * exerciseScore;

  return {
    ratingAvg,
    difficultyScore,
    exerciseScore,
    ratingScoreCurrentModel,
    valueScoreByRequestedFormula: toOneDecimal(formulaByRequestRaw),
    valueScoreByCurrentModel: toOneDecimal(formulaCurrentModelRaw),
    valueScoreStored: Number(course?.valueScore || 0),
    deltaStoredVsRequested: toOneDecimal(
      Number(course?.valueScore || 0) - formulaByRequestRaw,
    ),
    deltaStoredVsCurrentModel: toOneDecimal(
      Number(course?.valueScore || 0) - formulaCurrentModelRaw,
    ),
  };
}

function toHours(seconds = 0) {
  return Number(((Number(seconds) || 0) / 3600).toFixed(2));
}

function formatDurationLabel(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`);

  return parts.join(" ");
}

function logRecommendationComputation({
  phase,
  timeLimitSeconds,
  candidateFilter,
  candidates = [],
  selected = [],
  totalDuration = 0,
  totalValue = 0,
}) {
  const selectedDurationCheck = selected.reduce(
    (sum, c) => sum + (Number(c?.totalDuration) || 0),
    0,
  );
  const selectedValueCheck = selected.reduce(
    (sum, c) => sum + (Number(c?.valueScore) || 0),
    0,
  );

  console.log("[recommendation][debug]", {
    phase,
    timeLimitSeconds,
    timeLimit: formatDurationLabel(timeLimitSeconds),
    timeLimitHours: toHours(timeLimitSeconds),
    candidateCount: candidates.length,
    selectedCount: selected.length,
    totalDurationSeconds: totalDuration,
    totalDuration: formatDurationLabel(totalDuration),
    totalDurationHours: toHours(totalDuration),
    totalDurationRecheckSeconds: selectedDurationCheck,
    totalDurationRecheck: formatDurationLabel(selectedDurationCheck),
    totalValue,
    totalValueRecheck: Number(selectedValueCheck.toFixed(2)),
    candidateFilter,
  });

  if (candidates.length > 0) {
    console.log(
      "[recommendation][debug][candidates]",
      candidates.map((c) => ({
        ...deriveValueScoreFactors(c),
        id: String(c._id),
        slug: c.slug,
        title: c.title,
        level: c.level,
        tags: c.tags,
        prerequisites: c.prerequisites || [],
        totalDurationSeconds: c.totalDuration || 0,
        totalDuration: formatDurationLabel(c.totalDuration || 0),
        totalDurationHours: toHours(c.totalDuration || 0),
        valueScore: c.valueScore || 0,
      })),
    );
  }

  if (selected.length > 0) {
    console.log(
      "[recommendation][debug][selected]",
      selected.map((c) => ({
        ...deriveValueScoreFactors(c),
        id: String(c._id),
        slug: c.slug,
        title: c.title,
        totalDurationSeconds: c.totalDuration || 0,
        totalDuration: formatDurationLabel(c.totalDuration || 0),
        totalDurationHours: toHours(c.totalDuration || 0),
        valueScore: c.valueScore || 0,
      })),
    );
  }
}

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
  debug = false,
}) {
  // Early return for insufficient time
  if (timeLimitSeconds < 60) {
    if (debug) {
      logRecommendationComputation({
        phase: "early-return-time-limit",
        timeLimitSeconds,
        candidateFilter,
      });
    }
    return { coursesOrdered: [], totalDuration: 0, totalValue: 0 };
  }

  // Fetch candidate courses
  const courses = await Course.find(candidateFilter).lean();
  if (!courses || courses.length === 0) {
    if (debug) {
      logRecommendationComputation({
        phase: "early-return-no-candidate",
        timeLimitSeconds,
        candidateFilter,
        candidates: [],
      });
    }
    return { coursesOrdered: [], totalDuration: 0, totalValue: 0 };
  }

  const { chosenCourseIds, totalDuration, totalValue } = branchAndBoundSelect(
    courses,
    timeLimitSeconds,
  );

  const topo = topoSort(courses) || courses.map((c) => String(c._id));
  const chosenSet = new Set(Array.from(chosenCourseIds));
  const ordered = topo
    .filter((id) => chosenSet.has(id))
    .map((id) => courses.find((c) => String(c._id) === id));

  if (debug) {
    logRecommendationComputation({
      phase: "final-result",
      timeLimitSeconds,
      candidateFilter,
      candidates: courses,
      selected: ordered,
      totalDuration,
      totalValue,
    });
  }

  return {
    coursesOrdered: ordered,
    totalDuration,
    totalValue,
  };
}

export { buildCourseMap, topoSort, branchAndBoundSelect };

export default { generateLearningPath };

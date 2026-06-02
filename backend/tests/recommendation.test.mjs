import assert from "assert";
import {
  topoSort,
  computeClosures,
  buildBundles,
  selectBundlesDP,
  heuristicSelect,
} from "../src/services/recommendationService.js";

function makeCourse(id, prereq = [], duration = 0, value = 1) {
  return {
    _id: id,
    prerequisites: prereq,
    totalDuration: duration,
    valueScore: value,
  };
}

export function testTopoAndClosures() {
  const a = makeCourse("A");
  const b = makeCourse("B", ["A"]);
  const c = makeCourse("C", ["A"]);
  const d = makeCourse("D", ["B", "C"]);
  const courses = [a, b, c, d];

  const topo = topoSort(courses);
  assert(topo !== null, "Topo should be acyclic");
  const idxA = topo.indexOf("A");
  const idxB = topo.indexOf("B");
  const idxC = topo.indexOf("C");
  const idxD = topo.indexOf("D");
  assert(
    idxA !== -1 && idxA < idxB && idxA < idxC,
    "A must come before B and C",
  );
  assert(idxB < idxD && idxC < idxD, "B and C must come before D");

  const closures = computeClosures(courses);
  assert(closures.get("D").has("B"), "D closure must include B");
  assert(closures.get("D").has("C"), "D closure must include C");
  assert(closures.get("B").has("A"), "B closure must include A");
}

export function testBundlesAndDP() {
  // Create simple courses with durations and values
  const a = makeCourse("A", [], 60 * 60, 3); // 1h, value 3
  const b = makeCourse("B", ["A"], 60 * 60, 4); // 1h
  const c = makeCourse("C", [], 60 * 30, 2); // 30m
  const courses = [a, b, c];
  const bundles = buildBundles(courses);
  // Expect bundles: A->{A}, B->{A,B}, C->{C}
  const bmap = new Map(bundles.map((b) => [b.root, b]));
  assert(
    bmap.get("B").ids.includes("A") && bmap.get("B").ids.includes("B"),
    "B bundle must include A and B",
  );

  // capacity: 2 hours -> 120 minutes
  const capacityMinutes = 120;
  const res = selectBundlesDP(bundles, capacityMinutes);
  // Ensure chosenCourseIds doesn't contain duplicate overlapping sets
  // With bundling, best is B (A+B value 7, duration 2h) vs A+C (value 5, duration 1.5h). DP should pick B.
  assert(res.totalValue >= 7, "DP should pick bundle with value >= 7");
}

export function testHeuristic() {
  // Many small bundles
  const courses = [];
  for (let i = 0; i < 100; i++) {
    courses.push(makeCourse(String(i), [], 60 * 30, 1)); // 30min value1
  }
  const bundles = buildBundles(courses);
  const capMinutes = 5 * 60; // 5 hours
  const res = heuristicSelect(bundles, capMinutes);
  // Should pick some courses and not exceed capacity
  assert(
    res.totalDuration <= capMinutes * 60,
    "heuristic should not exceed capacity",
  );
  assert(res.totalValue > 0, "heuristic should pick at least one item");
}

export default function runAll() {
  console.log("Running recommendation service unit tests...");
  testTopoAndClosures();
  console.log(" - topo & closures passed");
  testBundlesAndDP();
  console.log(" - bundles & DP passed");
  testHeuristic();
  console.log(" - heuristic passed");
  console.log("All tests passed");
}

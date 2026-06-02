import runAll from "./recommendation.test.mjs";

try {
  runAll();
  console.log("OK");
  process.exit(0);
} catch (err) {
  console.error("TESTS FAILED:", err);
  process.exit(1);
}

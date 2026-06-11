import jwt from "jsonwebtoken";
import Enrollment from "../models/Enrollment.js";
import { generateLearningPath } from "../services/recommendationService.js";

/**
 * Try to extract a user id from the bearer token without failing the request.
 */
function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

/**
 * POST /api/recommendations/learning-path
 * Body: { timeLimitSeconds, category }
 * Returns an ordered list of courses that fit within time limit.
 */
export async function learningPathHandler(req, res) {
  try {
    const userId = req.user?._id || getOptionalUserId(req);

    const { timeLimitSeconds = 0, category } = req.body || {};

    // Fetch enrolled course ids to exclude for logged-in users only
    const enrolledIds = userId
      ? (await Enrollment.find({ userId }).select("courseId").lean()).map((e) =>
          String(e.courseId),
        )
      : [];

    // Candidate filter: published courses, not owned by user, not enrolled
    const candidateFilter = {
      status: "published",
    };

    if (enrolledIds.length > 0) {
      candidateFilter._id = { $nin: enrolledIds };
    }

    if (userId) {
      candidateFilter.instructorId = { $ne: userId };
    }

    // Filter by category: match courses where tags array contains the category string
    if (category && category !== "Tất cả") {
      candidateFilter.tags = { $in: [category] };
    }

    const result = await generateLearningPath({
      candidateFilter,
      timeLimitSeconds,
    });

    // sanitize courses: only return necessary fields
    const courses = (result.coursesOrdered || []).map((c) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      totalDuration: c.totalDuration,
      valueScore: c.valueScore,
      instructorId: c.instructorId,
    }));

    return res.json({
      courses,
      totalDuration: result.totalDuration,
      totalValue: result.totalValue,
      matchedCount: courses.length,
    });
  } catch (error) {
    console.error("Error in learningPathHandler", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}

export default { learningPathHandler };

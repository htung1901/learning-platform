const courseLevelValues = ["beginner", "intermediate", "advanced"];

const normalizeArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return null;
};

export const createCourseValidator = (req, res, next) => {
  const {
    title,
    description,
    categoryId,
    thumbnailUrl,
    introVideoUrl,
    level,
    price,
    prerequisites,
    tags,
    status,
  } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "title là bắt buộc" });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "description phải là chuỗi" });
  }

  if (categoryId !== undefined && typeof categoryId !== "string") {
    return res.status(400).json({ message: "categoryId phải là chuỗi" });
  }

  if (thumbnailUrl !== undefined && typeof thumbnailUrl !== "string") {
    return res.status(400).json({ message: "thumbnailUrl phải là chuỗi" });
  }

  if (introVideoUrl !== undefined && typeof introVideoUrl !== "string") {
    return res.status(400).json({ message: "introVideoUrl phải là chuỗi" });
  }

  if (level !== undefined && !courseLevelValues.includes(level)) {
    return res.status(400).json({
      message: "level không hợp lệ",
    });
  }

  if (price !== undefined && Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "price phải là số" });
  }

  const normalizedPrerequisites = normalizeArray(prerequisites);
  if (normalizedPrerequisites === null) {
    return res
      .status(400)
      .json({
        message: "prerequisites phải là mảng hoặc chuỗi phân tách bởi dấu phẩy",
      });
  }

  const normalizedTags = normalizeArray(tags);
  if (normalizedTags === null) {
    return res
      .status(400)
      .json({ message: "tags phải là mảng hoặc chuỗi phân tách bởi dấu phẩy" });
  }

  if (status !== undefined && !["draft", "pending"].includes(status)) {
    return res.status(400).json({ message: "status không hợp lệ" });
  }

  req.body.prerequisites = normalizedPrerequisites;
  req.body.tags = normalizedTags;
  req.body.price = price !== undefined ? Number(price) : 0;
  req.body.level = level || "beginner";
  req.body.status = status || "draft";

  next();
};

export const updateCourseValidator = (req, res, next) => {
  const {
    title,
    description,
    categoryId,
    thumbnailUrl,
    introVideoUrl,
    level,
    price,
    prerequisites,
    tags,
  } = req.body;

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ message: "title phải là chuỗi không rỗng" });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "description phải là chuỗi" });
  }

  if (categoryId !== undefined && typeof categoryId !== "string") {
    return res.status(400).json({ message: "categoryId phải là chuỗi" });
  }

  if (thumbnailUrl !== undefined && typeof thumbnailUrl !== "string") {
    return res.status(400).json({ message: "thumbnailUrl phải là chuỗi" });
  }

  if (introVideoUrl !== undefined && typeof introVideoUrl !== "string") {
    return res.status(400).json({ message: "introVideoUrl phải là chuỗi" });
  }

  if (level !== undefined && !courseLevelValues.includes(level)) {
    return res.status(400).json({ message: "level không hợp lệ" });
  }

  if (price !== undefined && Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "price phải là số" });
  }

  const normalizedPrerequisites = normalizeArray(prerequisites);
  if (normalizedPrerequisites === null) {
    return res
      .status(400)
      .json({ message: "prerequisites phải là mảng hoặc chuỗi" });
  }

  const normalizedTags = normalizeArray(tags);
  if (normalizedTags === null) {
    return res.status(400).json({ message: "tags phải là mảng hoặc chuỗi" });
  }

  req.body.prerequisites = normalizedPrerequisites;
  req.body.tags = normalizedTags;
  if (price !== undefined) req.body.price = Number(price);

  next();
};

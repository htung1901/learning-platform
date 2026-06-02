export const getInstructorDisplayName = (course) => {
  const instructor = course?.instructorId;

  if (!instructor) return "Chưa có giảng viên";
  if (typeof instructor === "string") return "Chưa có giảng viên";

  return (
    instructor.displayName ||
    instructor.username ||
    instructor.name ||
    "Chưa có giảng viên"
  );
};

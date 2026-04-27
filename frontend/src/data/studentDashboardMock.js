export const studentProfileMock = {
  name: "Nguyen Van A",
  level: "Student",
  streakDays: 12,
  weeklyGoal: 5,
  completedThisWeek: 3,
};

export const enrolledCoursesMock = [
  {
    id: "react-01",
    title: "React & JavaScript: The Complete Guide",
    lesson: "State Management voi Zustand",
    progress: 65,
    duration: "12 phut con lai",
    totalLessons: 20,
    completedLessons: 13,
    enrolledDate: "Jan 15, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "js-advanced",
    title: "Python for Data Science & Machine Learning",
    lesson: "Model Evaluation Metrics",
    progress: 40,
    duration: "25 phut con lai",
    totalLessons: 15,
    completedLessons: 6,
    enrolledDate: "Feb 1, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "node-api",
    title: "Advanced Node.js & Backend Development",
    lesson: "Scaling API Services",
    progress: 100,
    duration: "Da hoan thanh",
    totalLessons: 18,
    completedLessons: 18,
    enrolledDate: "Mar 10, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ui-system",
    title: "Design System Fundamentals",
    lesson: "Color Tokens va Accessibility",
    progress: 72,
    duration: "16 phut con lai",
    totalLessons: 22,
    completedLessons: 16,
    enrolledDate: "Mar 20, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cloud-devops",
    title: "Cloud Fundamentals for Developers",
    lesson: "Container Basics",
    progress: 35,
    duration: "30 phut con lai",
    totalLessons: 14,
    completedLessons: 5,
    enrolledDate: "Apr 2, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ts-bootcamp",
    title: "TypeScript Bootcamp",
    lesson: "Type Narrowing Strategies",
    progress: 100,
    duration: "Da hoan thanh",
    totalLessons: 12,
    completedLessons: 12,
    enrolledDate: "Apr 10, 2024",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  },
];

export const inProgressCoursesMock = enrolledCoursesMock.filter(
  (course) => course.progress > 0 && course.progress < 100,
);

export const completedCoursesMock = enrolledCoursesMock.filter(
  (course) => course.progress === 100,
);

export const studentStatsMock = [
  {
    id: "enrolled",
    label: "Tất cả khóa học đã đăng ký",
    value: enrolledCoursesMock.length,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    id: "in-progress",
    label: "Khóa học đang học",
    value: inProgressCoursesMock.length,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "completed",
    label: "Khóa học đã hoàn thành",
    value: completedCoursesMock.length,
    accent: "from-amber-500 to-orange-500",
  },
];

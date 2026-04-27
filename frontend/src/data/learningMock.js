import { findCourseById } from "./courseCatalog";
import { enrolledCoursesMock } from "./studentDashboardMock";

const DEFAULT_LESSONS = [
  {
    id: "lesson-1",
    title: "Tong quan khoa hoc va lo trinh",
    duration: "08:30",
    type: "video",
    isLocked: false,
  },
  {
    id: "lesson-2",
    title: "Bai tap thuc hanh co huong dan",
    duration: "14:20",
    type: "practice",
    isLocked: false,
  },
  {
    id: "lesson-3",
    title: "Case study va checklist trien khai",
    duration: "18:45",
    type: "video",
    isLocked: false,
  },
  {
    id: "lesson-4",
    title: "Quiz tong ket chuong",
    duration: "09:10",
    type: "quiz",
    isLocked: false,
  },
];

const COURSE_LEARNING_MAP = {
  "js-fundamentals": {
    headline: "JavaScript Fundamentals 2026",
    module: "JavaScript Core",
    currentTopic: "Understanding Scope, Closure, and Hoisting",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
    resources: [
      "Slides bai giang Scope va Closure",
      "Source code demo DOM + fetch",
      "Cheat sheet async/await",
    ],
  },
  "react-practical": {
    headline: "React Thuc Chien",
    module: "State Management",
    currentTopic: "Global State voi Zustand + Async Action",
    videoUrl: "https://www.youtube.com/embed/wIyHSOugGGw",
    resources: [
      "Boilerplate project React + Vite",
      "Folder structure guideline",
      "Checklist toi uu rendering",
    ],
  },
  "uiux-system": {
    headline: "UI/UX Design System",
    module: "Token va Component",
    currentTopic: "From Design Token to Production Component",
    videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
    resources: [
      "Mau file Figma token",
      "Accessibility color contrast list",
      "Template design audit",
    ],
  },
};

const resolveCourseDisplay = (courseId) => {
  const catalogCourse = findCourseById(courseId);
  if (catalogCourse) {
    return {
      id: catalogCourse.id,
      title: catalogCourse.title,
      thumbnail: catalogCourse.thumbnail,
      progress: 0,
      completedLessons: 0,
      totalLessons: DEFAULT_LESSONS.length,
    };
  }

  const enrolledCourse = enrolledCoursesMock.find(
    (course) => course.id === courseId,
  );
  if (enrolledCourse) {
    return enrolledCourse;
  }

  return null;
};

export const getLearningPayload = (courseId) => {
  const course = resolveCourseDisplay(courseId);
  if (!course) return null;

  const mapped = COURSE_LEARNING_MAP[courseId] || {
    headline: course.title,
    module: "Learning Module",
    currentTopic: "Noi dung bai hoc dang cap nhat",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
    resources: [
      "Tai lieu bai hoc dang cap nhat",
      "Bai tap thuc hanh",
      "File tham khao",
    ],
  };

  return {
    course,
    module: mapped.module,
    currentTopic: mapped.currentTopic,
    headline: mapped.headline,
    videoUrl: mapped.videoUrl,
    resources: mapped.resources,
    lessons: DEFAULT_LESSONS,
  };
};

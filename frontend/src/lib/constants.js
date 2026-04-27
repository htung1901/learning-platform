// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: "/api/auth/signup",
  LOGIN: "/api/auth/signin",
  LOGOUT: "/api/auth/signout",
  REFRESH_TOKEN: "/api/auth/refresh",

  // Users
  GET_PROFILE: "/api/users/me",
  UPDATE_PROFILE: "/api/users/me",
};

// Frontend routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  STUDENT_DASHBOARD: "/student/dashboard",
  DASHBOARD: "/dashboard",
  INSTRUCTOR_CREATE_COURSE: "/dashboard/courses/create",
  INSTRUCTOR_MANAGE_COURSES: "/dashboard/courses/manage",
  INSTRUCTOR_COURSE_DETAIL: "/dashboard/courses/manage/:id",
  INSTRUCTOR_EDIT_LESSONS: "/dashboard/courses/manage/:id/edit-lessons",
  INSTRUCTOR_COMMUNICATION: "/dashboard/communication",
  INSTRUCTOR_PERFORMANCE: "/dashboard/performance",
  INSTRUCTOR_TOOLS: "/dashboard/tools",
  INSTRUCTOR_RESOURCES: "/dashboard/resources",
  COURSES: "/courses",
  COURSE_DETAIL: "/courses/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_COURSE: "/checkout/:id",
  ENROLLED_COURSES: "/my-courses",
  PURCHASE_HISTORY: "/purchase-history",
  LESSON: "/lesson/:courseId/:lessonId",
};

// Time constants
export const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds
export const REFRESH_TOKEN_EXPIRY = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

// Form messages
export const FORM_MESSAGES = {
  EMAIL_REQUIRED: "Email là bắt buộc",
  EMAIL_INVALID: "Email không hợp lệ",
  PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",
  PASSWORD_MIN: "Mật khẩu phải có ít nhất 6 ký tự",
  USERNAME_REQUIRED: "Tên người dùng là bắt buộc",
  DISPLAY_NAME_REQUIRED: "Tên hiển thị là bắt buộc",
  PHONE_INVALID: "Số điện thoại không hợp lệ",
  BIO_MAX: "Tiểu sử không được vượt quá 500 ký tự",
};

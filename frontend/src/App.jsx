import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ProfilePage from "./pages/Auth/ProfilePage";
import HomePage from "./pages/Home/HomePage";
import CoursesPage from "./pages/Courses/CoursesPage";
import CourseDetailPage from "./pages/Courses/CourseDetailPage";
import CourseCheckoutPage from "./pages/Courses/CourseCheckoutPage";
import CourseLearningPage from "./pages/Courses/CourseLearningPage";
import CartPage from "./pages/Student/CartPage";
import InstructorLayout from "./pages/Instructor/InstructorLayout";
import InstructorCourseDetailPage from "./pages/Instructor/InstructorCourseDetailPage";
import InstructorEditLessonsPage from "./pages/Instructor/InstructorEditLessonsPage";
import InstructorDashboardPage from "./pages/Instructor/InstructorDashboardPage";
import InstructorCreateCoursePage from "./pages/Instructor/InstructorCreateCoursePage";
import InstructorManageCoursesPage from "./pages/Instructor/InstructorManageCoursesPage";
import InstructorCommunicationPage from "./pages/Instructor/InstructorCommunicationPage";
import InstructorPerformancePage from "./pages/Instructor/InstructorPerformancePage";
import InstructorToolsPage from "./pages/Instructor/InstructorToolsPage";
import StudentDashboardPage from "./pages/Student/StudentDashboardPage";
import { ROUTES } from "./lib/constants";
import { Toaster } from "sonner";

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/:id" element={<CourseCheckoutPage />} />
            <Route
              path="/lesson/:courseId/:lessonId"
              element={<CourseLearningPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <InstructorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<InstructorDashboardPage />} />
              <Route
                path="courses/create"
                element={<InstructorCreateCoursePage />}
              />
              <Route
                path="courses/manage"
                element={<InstructorManageCoursesPage />}
              />
              <Route
                path="courses/manage/:id"
                element={<InstructorCourseDetailPage />}
              />
              <Route
                path="courses/manage/:id/edit-lessons"
                element={<InstructorEditLessonsPage />}
              />
              <Route
                path="communication"
                element={<InstructorCommunicationPage />}
              />
              <Route
                path="performance"
                element={<InstructorPerformancePage />}
              />
              <Route path="tools" element={<InstructorToolsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Toaster for notifications */}
      <Toaster richColors position="bottom-right" />
    </>
  );
}

export default App;

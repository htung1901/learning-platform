import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  User,
  GraduationCap,
  ShoppingCart,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { userService } from "../services/userService";
import { toast } from "sonner";
import { ROUTES } from "../lib/constants";

export default function Header() {
  const { isAuthenticated, user, logout, setUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isStudent = isAuthenticated && user?.role === "student";
  const isInstructor = isAuthenticated && user?.role === "instructor";
  const logoTarget = isInstructor ? ROUTES.DASHBOARD : ROUTES.HOME;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleSwitchRole = async () => {
    if (!user) return;

    try {
      const updated = await userService.toggleInstructor();
      setUser(updated);
      localStorage.setItem("authUser", JSON.stringify(updated));
      const newRole = updated.role === "instructor" ? "giảng viên" : "học viên";
      toast.success(`Vai trò đã đổi thành ${newRole}`);
      setIsProfileOpen(false);
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể đổi vai trò");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const renderDesktopNavItem = (to, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium relative group",
          isActive ? "text-blue-600 dark:text-blue-400" : "",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-blue-600 to-purple-600 transition-all duration-300 ${
              isActive ? "w-full" : "w-0 group-hover:w-full"
            }`}
          />
        </>
      )}
    </NavLink>
  );

  const renderMobileMenuItem = (to, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "px-4 py-2 rounded transition",
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        ].join(" ")
      }
      onClick={() => setIsOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/30 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={logoTarget}
            className="flex items-center gap-2 hover:opacity-80 transition group"
          >
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              EduHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!isInstructor && (
              <>
                {renderDesktopNavItem(ROUTES.HOME, "Home", true)}
                {renderDesktopNavItem(ROUTES.COURSES, "Khóa học")}
                {isStudent &&
                  renderDesktopNavItem(
                    ROUTES.STUDENT_DASHBOARD,
                    "Khóa học của tôi",
                  )}
              </>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isStudent && (
                  <Link
                    to={ROUTES.CART}
                    className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-slate-700 transition hover:bg-cyan-100 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300"
                    title="Giỏ hàng"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </Link>
                )}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition text-slate-700 dark:text-slate-300 hover:text-blue-600"
                    title="User Menu"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                      <button
                        onClick={handleSwitchRole}
                        className="w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition border-b border-slate-200 dark:border-slate-700"
                      >
                        {user?.role === "student" ? "Giảng viên" : "Học viên"}
                      </button>

                      <Link
                        to={ROUTES.PROFILE}
                        className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition border-b border-slate-200 dark:border-slate-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Hồ sơ
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {!isInstructor && (
              <>
                <NavLink
                  to={ROUTES.HOME}
                  end
                  className={({ isActive }) =>
                    [
                      "px-3 py-1.5 rounded-lg border text-sm font-semibold transition",
                      isActive
                        ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                        : "bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-500/30",
                    ].join(" ")
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to={ROUTES.COURSES}
                  className={({ isActive }) =>
                    [
                      "px-3 py-1.5 rounded-lg border text-sm font-semibold transition",
                      isActive
                        ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                        : "bg-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-500/30",
                    ].join(" ")
                  }
                >
                  Khóa học
                </NavLink>
              </>
            )}

            {isStudent && (
              <Link
                to={ROUTES.CART}
                className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-slate-700 transition hover:bg-cyan-100 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300"
                title="Giỏ hàng"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-800">
            <nav className="flex flex-col gap-2 mt-4">
              {!isInstructor && (
                <>
                  {renderMobileMenuItem(ROUTES.HOME, "Home", true)}
                  {renderMobileMenuItem(ROUTES.COURSES, "Khóa học")}
                  {isStudent &&
                    renderMobileMenuItem(
                      ROUTES.STUDENT_DASHBOARD,
                      "Khóa học của tôi",
                    )}
                </>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleSwitchRole}
                      className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded transition"
                    >
                      {user?.role === "student" ? "Giảng viên" : "Học viên"}
                    </button>

                    <Link
                      to={ROUTES.PROFILE}
                      className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.LOGIN}
                      className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to={ROUTES.SIGNUP}
                      className="block mt-2 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded hover:shadow-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

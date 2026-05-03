import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import adminService from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra role admin
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (user?.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [user, navigate]);

  // Lấy thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data.data);
      } catch (error) {
        toast.error("Lỗi khi lấy thống kê: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-300">
          Không thể tải thống kê
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Quản lý khóa học, người dùng và thống kê
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Tổng User
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.users.total}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instructors: {stats.users.instructors} | Students:{" "}
                  {stats.users.students}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Tổng Khóa học
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.courses.total}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Published: {stats.courses.published}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          {/* Pending Courses */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Chờ Duyệt
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.courses.pending}
                </p>
                <button
                  onClick={() => navigate("/admin/courses/pending")}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                >
                  Xem chi tiết →
                </button>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Rejected Courses */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Từ Chối
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.courses.rejected}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Khóa học Phổ biến
          </h2>
          <div className="space-y-3">
            {stats.topCourses.length > 0 ? (
              stats.topCourses.map((course, idx) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {idx + 1}. {course.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {course.totalStudents} học viên • {course.totalLessons}{" "}
                      bài học
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    ${course.price}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Không có khóa học
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => navigate("/admin/courses/pending")}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition"
          >
            Duyệt Khóa Học ({stats.courses.pending})
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition"
          >
            Quản Lý Người Dùng
          </button>
        </div>
      </div>
    </div>
  );
}

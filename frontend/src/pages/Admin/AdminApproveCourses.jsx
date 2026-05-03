import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import adminService from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

export default function AdminApproveCourses() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Kiểm tra role admin
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (user?.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [user, navigate]);

  // Lấy danh sách khóa học chờ duyệt
  const fetchCourses = useCallback(async (page = 1) => {
    try {
      const data = await adminService.getPendingCourses(page, 5);
      setCourses(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, [fetchCourses]);

  const handleApprove = async (courseId) => {
    setActionLoading(courseId);
    try {
      await adminService.approveCourse(courseId);
      toast.success("Đã duyệt khóa học");
      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (error) {
      toast.error("Lỗi khi duyệt: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(selectedCourseId);
    try {
      await adminService.rejectCourse(selectedCourseId, rejectReason);
      toast.success("Đã từ chối khóa học");
      setCourses(courses.filter((c) => c._id !== selectedCourseId));
      setIsRejectModalOpen(false);
      setRejectReason("");
      setSelectedCourseId(null);
    } catch (error) {
      toast.error("Lỗi khi từ chối: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            ← Quay lại Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Duyệt Khóa Học
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Có {pagination?.total || 0} khóa học chờ duyệt
          </p>
        </div>

        {/* Courses List */}
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
              >
                {/* Course Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {course.description?.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Instructor:</span>{" "}
                      {course.instructorId?.displayName}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-semibold">Email:</span>{" "}
                      {course.instructorId?.email}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Level:</span>{" "}
                      {course.level}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-semibold">Price:</span> $
                      {course.price}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-semibold">Lessons:</span>{" "}
                      {course.totalLessons}
                    </p>
                  </div>
                </div>

                {/* Submitted Date */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Submitted: {new Date(course.submittedAt).toLocaleString()}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(course._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {actionLoading === course._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Phê Duyệt
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course._id);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ Chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Không có khóa học chờ duyệt
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchCourses(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === i + 1
                    ? "bg-purple-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Từ Chối Khóa Học
            </h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:bg-slate-700 dark:text-white resize-none h-24"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                  setSelectedCourseId(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {actionLoading === selectedCourseId ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : null}
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

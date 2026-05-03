import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader } from "lucide-react";
import adminService from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

export default function AdminManageUsers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);

  // Kiểm tra role admin
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (user?.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [user, navigate]);

  // Lấy danh sách user
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        const data = await adminService.getAllUsers(page, 10, roleFilter);
        setUsers(data.data);
        setPagination(data.pagination);
      } catch (error) {
        toast.error("Lỗi khi lấy danh sách: " + error.message);
      } finally {
        setLoading(false);
      }
    },
    [roleFilter],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdateLoading(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success("Cập nhật role thành công");
      // Update local state
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (error) {
      toast.error("Lỗi khi cập nhật: " + error.message);
    } finally {
      setUpdateLoading(null);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            ← Quay lại Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Quản Lý Người Dùng
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Tổng cộng: {pagination?.total || 0} người dùng
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-3">
          {["student", "instructor", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                roleFilter === role
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
          {roleFilter && (
            <button
              onClick={() => setRoleFilter(null)}
              className="px-4 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Xóa Filter
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Tên Hiển Thị
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {u.displayName}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u._id, e.target.value)
                        }
                        disabled={updateLoading === u._id}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border-2 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {updateLoading === u._id && (
                        <Loader className="w-5 h-5 animate-spin text-purple-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Không tìm thấy người dùng
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchUsers(i + 1)}
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
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";

const initialLogin = {
  username: "",
  password: "",
};

const initialSignup = {
  username: "",
  email: "",
  password: "",
  displayName: "",
};

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { login, signup, logout, isLoading, user, isAuthenticated } =
    useAuthStore();

  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    toast.error("Tài khoản này không có quyền admin");
    logout();
  }, [isAuthenticated, user, navigate, logout]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      toast.error("Vui lòng nhập username và password");
      return;
    }

    await login(loginData.username, loginData.password, "admin");
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (
      !signupData.username ||
      !signupData.email ||
      !signupData.password ||
      !signupData.displayName
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    await signup({
      ...signupData,
      role: "admin",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-10 px-4">
      <div className="mx-auto max-w-xl rounded-2xl border border-indigo-400/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/20 p-2">
            <ShieldCheck className="h-7 w-7 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-sm text-slate-300">
              Đăng nhập hoặc đăng ký tài khoản quản trị
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Đăng nhập Admin
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Đăng ký Admin
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập Admin"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Display Name
              </label>
              <input
                type="text"
                value={signupData.displayName}
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="Admin User"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Username
              </label>
              <input
                type="text"
                value={signupData.username}
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-indigo-400/40 focus:ring"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {isLoading ? "Đang đăng ký..." : "Đăng ký Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

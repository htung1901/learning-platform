import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
  const { user } = useAuthStore();
  const isInstructor = user?.role === "instructor";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isInstructor && <Footer />}
    </div>
  );
}

import { NavLink, Navigate, Outlet } from "react-router-dom";
import {
  BarChart3,
  BookPlus,
  FolderKanban,
  MessageSquareText,
  Wrench,
  ChartColumn,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../lib/constants";

const sidebarGroups = [
  {
    label: "Khóa học",
    items: [
      {
        to: ROUTES.DASHBOARD,
        label: "Tổng quan",
        icon: BarChart3,
        end: true,
      },
      {
        to: ROUTES.INSTRUCTOR_CREATE_COURSE,
        label: "Tạo khóa học",
        icon: BookPlus,
      },
      {
        to: ROUTES.INSTRUCTOR_MANAGE_COURSES,
        label: "Quản lý khóa học",
        icon: FolderKanban,
      },
    ],
  },
  {
    label: "Giao tiếp",
    items: [
      {
        to: ROUTES.INSTRUCTOR_COMMUNICATION,
        label: "Hộp thư",
        icon: MessageSquareText,
      },
    ],
  },
  {
    label: "Hiệu suất",
    items: [
      {
        to: ROUTES.INSTRUCTOR_PERFORMANCE,
        label: "Báo cáo",
        icon: ChartColumn,
      },
    ],
  },
  {
    label: "Công cụ",
    items: [
      {
        to: ROUTES.INSTRUCTOR_TOOLS,
        label: "Bộ công cụ",
        icon: Wrench,
      },
    ],
  },
];

const sidebarItems = sidebarGroups.flatMap((group) => group.items);

export default function InstructorLayout() {
  const { user } = useAuthStore();

  if (user?.role !== "instructor") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="group hidden w-20 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-linear-to-b from-[#131826] via-[#0f1421] to-[#0c101a] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] transition-[width] duration-300 ease-out hover:w-72 lg:flex">
          <nav className="flex flex-1 flex-col overflow-y-auto px-2 pt-2 pb-4">
            <div className="space-y-1.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        "group/item relative mx-2 flex h-12 items-center rounded-xl px-0 text-slate-300 transition-[background-color,color,box-shadow,ring-color] duration-200",
                        "hover:bg-white/8 hover:text-white",
                        isActive
                          ? "bg-linear-to-r from-indigo-500/22 via-violet-500/18 to-cyan-400/15 text-white ring-1 ring-indigo-300/25 shadow-[0_10px_26px_-16px_rgba(79,70,229,0.9)]"
                          : "",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={[
                            "absolute left-1.5 top-1/2 flex h-9 w-9 shrink-0 -translate-y-1/2 items-center justify-center rounded-lg transition-[background-color,color] duration-200",
                            isActive
                              ? "bg-linear-to-br from-indigo-400 to-cyan-300 text-slate-950"
                              : "bg-white/6 text-slate-200 group-hover/item:bg-white/12",
                          ].join(" ")}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="pointer-events-none absolute left-14 top-1/2 min-w-0 -translate-y-1/2 overflow-hidden whitespace-nowrap text-left text-sm font-semibold opacity-0 transition-[opacity,transform] duration-200 ease-out translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 bg-[#0b0f19] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

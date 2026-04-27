import { Wand2, ShieldCheck, FileText, SlidersHorizontal } from "lucide-react";

const tools = [
  {
    title: "AI hỗ trợ tạo outline",
    description: "Gợi ý khung bài học và mục tiêu cho khóa học mới.",
    icon: Wand2,
  },
  {
    title: "Kiểm tra nội dung",
    description: "Soát lỗi chính tả, tiêu đề và mô tả trước khi xuất bản.",
    icon: ShieldCheck,
  },
  {
    title: "Mẫu tài liệu",
    description: "Xuất nhanh slide, checklist và file handout.",
    icon: FileText,
  },
  {
    title: "Tùy biến giao diện",
    description: "Điều chỉnh màu sắc, banner và style cho khóa học.",
    icon: SlidersHorizontal,
  },
];

export default function InstructorToolsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-lg sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-300">
          <Wand2 className="h-3.5 w-3.5" />
          Công cụ
        </p>
        <h2 className="mt-3 text-3xl font-black text-white">
          Bộ công cụ giảng viên
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Các công cụ hỗ trợ tạo, kiểm duyệt và chuẩn bị tài nguyên trước khi
          đẩy nội dung lên.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.title}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{tool.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

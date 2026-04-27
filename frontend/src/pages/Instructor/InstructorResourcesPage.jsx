import { BookMarked, FileText, Layers3, Upload } from "lucide-react";

const resources = [
  {
    title: "Mẫu slide bài giảng",
    description: "Bố cục tiêu chuẩn cho bài học 30-60 phút.",
    icon: Layers3,
  },
  {
    title: "Checklist xuất bản",
    description: "Xác nhận title, ảnh bìa và giá trước khi public.",
    icon: FileText,
  },
  {
    title: "Tài liệu tham khảo",
    description: "Nguồn học liệu, link đọc thêm và bài tập mẫu.",
    icon: BookMarked,
  },
  {
    title: "Upload file",
    description: "Tải lên video, PDF và phụ đề cho khóa học.",
    icon: Upload,
  },
];

export default function InstructorResourcesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-lg sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-300">
          <BookMarked className="h-3.5 w-3.5" />
          Tài nguyên
        </p>
        <h2 className="mt-3 text-3xl font-black text-white">
          Thư viện mẫu và tài liệu
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Nơi lưu template, tài liệu và file đính kèm dùng lại cho các khóa học.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <article
              key={resource.title}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                {resource.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {resource.description}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

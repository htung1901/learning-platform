import { Mail, MessageSquareText, BellRing, Send } from "lucide-react";

const threads = [
  {
    name: "Student A",
    subject: "Hỏi về bài tập React",
    preview: "Em chưa hiểu phần state management ở bài 3...",
    time: "2 phút trước",
  },
  {
    name: "Student B",
    subject: "Xin phản hồi bài nộp",
    preview: "Thầy/cô có thể xem lại bài project của em không ạ?",
    time: "18 phút trước",
  },
  {
    name: "Admin",
    subject: "Thông báo lịch workshop",
    preview: "Có buổi workshop hỗ trợ giảng viên vào thứ 6...",
    time: "1 giờ trước",
  },
];

export default function InstructorCommunicationPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-violet-900/30 px-3 py-1 text-xs font-semibold text-violet-300">
              <MessageSquareText className="h-3.5 w-3.5" />
              Giao tiếp
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              Hộp thư giảng viên
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Quản lý tin nhắn từ học viên, thông báo và các phản hồi quan
              trọng.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
            <Send className="h-4 w-4" />
            Soạn tin nhắn
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {threads.map((thread) => (
            <article
              key={thread.subject}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-900/30 text-violet-300">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{thread.name}</p>
                    <span className="text-xs text-slate-400">
                      {thread.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {thread.subject}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {thread.preview}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <BellRing className="h-4 w-4" />
              Thông báo nhanh
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Trả lời tin nhắn sớm giúp tăng tỉ lệ hoàn thành khóa học và giữ
              chân học viên.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-md">
            <h3 className="text-sm font-semibold text-slate-400">
              Mẫu phản hồi
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-800/50 px-3 py-2">
                Cảm ơn em, thầy/cô sẽ xem và phản hồi sớm.
              </div>
              <div className="rounded-xl bg-slate-800/50 px-3 py-2">
                Em có thể gửi thêm ảnh chụp màn hình lỗi nhé.
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

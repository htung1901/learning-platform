import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  BookPlus,
  ChevronDown,
  FileText,
  GraduationCap,
  ImagePlus,
  Layers3,
  ListChecks,
  PlayCircle,
  PlusCircle,
  Save,
  Search,
  Sparkles,
  Trash2,
  Video,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { instructorService } from "../../services/instructorService";

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20";

const APPROVED_COURSES = [
  {
    id: 1,
    title: "HTML & CSS Cơ bản",
    category: "Lập trình",
    level: "Beginner",
  },
  {
    id: 2,
    title: "JavaScript Nâng cao",
    category: "Lập trình",
    level: "Intermediate",
  },
  { id: 3, title: "React Cơ bản", category: "Lập trình", level: "Beginner" },
  {
    id: 4,
    title: "Node.js & Express",
    category: "Lập trình",
    level: "Intermediate",
  },
  {
    id: 5,
    title: "Figma - Thiết kế UI/UX",
    category: "Thiết kế",
    level: "Beginner",
  },
];

export default function InstructorCreateCoursePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("Lập trình");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [coursePrice, setCoursePrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: "",
      videoUrl: "",
      duration: "",
      type: "Video",
      summary: "",
    },
  ]);
  const [hasPrerequisites, setHasPrerequisites] = useState(false);
  const [searchPrerequisites, setSearchPrerequisites] = useState("");
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  const filteredCourses = APPROVED_COURSES.filter(
    (course) =>
      course.title.toLowerCase().includes(searchPrerequisites.toLowerCase()) &&
      !selectedPrerequisites.find((p) => p.id === course.id),
  );

  const handleAddPrerequisite = (course) => {
    setSelectedPrerequisites((prev) => [...prev, course]);
    setSearchPrerequisites("");
  };

  const handleRemovePrerequisite = (courseId) => {
    setSelectedPrerequisites((prev) =>
      prev.filter((course) => course.id !== courseId),
    );
  };

  const handleGoToLessons = () => {
    setStep("lessons");
  };

  const handleBackToDetails = () => {
    setStep("details");
  };

  const handleLessonChange = (lessonId, field, value) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
      ),
    );
  };

  const handleAddLesson = () => {
    setLessons((prevLessons) => [
      ...prevLessons,
      {
        id: Date.now(),
        title: "",
        videoUrl: "",
        duration: "",
        type: "Video",
        summary: "",
      },
    ]);
  };

  const handleRemoveLesson = (lessonId) => {
    setLessons((prevLessons) => {
      if (prevLessons.length === 1) return prevLessons;
      return prevLessons.filter((lesson) => lesson.id !== lessonId);
    });
  };

  const calculateTotalDuration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => {
      if (!lesson.duration) return sum;

      const parts = lesson.duration.split(":").map((part) => Number(part));
      if (parts.some((part) => Number.isNaN(part))) return sum;

      if (parts.length === 2) {
        const [minutes, seconds] = parts;
        return sum + minutes * 60 + seconds;
      }

      if (parts.length === 3) {
        const [hours, minutes, seconds] = parts;
        return sum + hours * 3600 + minutes * 60 + seconds;
      }

      return sum;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
    }

    if (minutes > 0) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
  };

  const handleCreateCourse = async (status = "draft") => {
    if (!courseTitle.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return;
    }

    const payload = {
      title: courseTitle.trim(),
      description: courseDescription,
      level: courseLevel,
      price: Number(coursePrice) || 0,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      introVideoUrl: introVideoUrl.trim() || undefined,
      status,
      prerequisites: selectedPrerequisites.map((item) => item.title),
      tags: courseCategory ? [courseCategory] : [],
    };

    try {
      setIsSaving(true);
      await instructorService.createCourse(payload);
      toast.success(
        status === "pending"
          ? "Đã tạo khóa học và gửi duyệt"
          : "Đã lưu khóa học nháp",
      );
      navigate("/dashboard/courses/manage");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tạo khóa học");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-2 sm:py-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-8 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
          <div className="border-b border-slate-200/70 p-6 dark:border-slate-700/70 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span>Instructor workspace</span>
              <span>•</span>
              <span>Tạo khóa học</span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {step === "details"
                ? "Soạn nội dung khóa học mới"
                : "Thiết lập bài học và video"}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
              {step === "details"
                ? "Đồng bộ trải nghiệm với trang học của student: rõ ràng, tập trung nội dung và theo dõi tiến độ tạo khóa học theo từng bước."
                : "Bạn đang ở bước nhập từng bài học. Có thể thêm tiêu đề, video, thời lượng và ghi chú cho từng lesson."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <Clock3 className="h-4 w-4" />
                {step === "details" ? "Bước 1/2" : "Bước 2/2"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1.5 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                <Sparkles className="h-4 w-4" />
                {step === "details" ? "Thông tin khóa học" : "Nội dung bài học"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Sẵn sàng xuất bản
              </span>
            </div>
          </div>

          {step === "details" ? (
            <form className="space-y-5 p-4 sm:p-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <BookPlus className="h-4 w-4" />
                  Thông tin cơ bản
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tên khóa học
                    </span>
                    <input
                      className={fieldClassName}
                      placeholder="VD: React nâng cao từ A-Z"
                      value={courseTitle}
                      onChange={(event) => setCourseTitle(event.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Danh mục
                    </span>
                    <select
                      className={fieldClassName}
                      value={courseCategory}
                      onChange={(event) =>
                        setCourseCategory(event.target.value)
                      }
                    >
                      <option>Lập trình</option>
                      <option>Thiết kế</option>
                      <option>Marketing</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Cấp độ
                    </span>
                    <select
                      className={fieldClassName}
                      value={courseLevel}
                      onChange={(event) => setCourseLevel(event.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Giá bán
                    </span>
                    <div className="relative">
                      <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                        placeholder="799000"
                        value={coursePrice}
                        onChange={(event) => setCoursePrice(event.target.value)}
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Ảnh bìa
                    </span>
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                      <ImagePlus className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      <input
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                        placeholder="Dán link ảnh thumbnail"
                        value={thumbnailUrl}
                        onChange={(event) =>
                          setThumbnailUrl(event.target.value)
                        }
                      />
                    </div>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Intro video (optional)
                    </span>
                    <input
                      className={fieldClassName}
                      placeholder="https://..."
                      value={introVideoUrl}
                      onChange={(event) => setIntroVideoUrl(event.target.value)}
                    />
                  </label>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4" />
                  Nội dung khóa học
                </div>

                <div className="mt-4 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Mô tả khóa học
                    </span>
                    <textarea
                      rows={5}
                      className={fieldClassName}
                      placeholder="Mô tả ngắn gọn về mục tiêu, kết quả và đối tượng học viên..."
                      value={courseDescription}
                      onChange={(event) =>
                        setCourseDescription(event.target.value)
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Outline nội dung
                    </span>
                    <textarea
                      rows={7}
                      className={fieldClassName}
                      placeholder={
                        "1. Giới thiệu\n2. Nền tảng\n3. Thực hành\n4. Dự án"
                      }
                    />
                  </label>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <BookPlus className="h-4 w-4" />
                    Yêu cầu khóa học tiên quyết (Optional)
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPrerequisites}
                      onChange={(e) => setHasPrerequisites(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-cyan-600" />
                  </label>
                </div>

                {hasPrerequisites && (
                  <div className="mt-4 space-y-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm khóa học (ví dụ: React, JavaScript...)"
                        value={searchPrerequisites}
                        onChange={(e) => setSearchPrerequisites(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                      />
                    </div>

                    {searchPrerequisites && filteredCourses.length > 0 && (
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                        {filteredCourses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => handleAddPrerequisite(course)}
                            className="w-full border-b border-slate-200 px-4 py-3 text-left transition hover:bg-cyan-50 dark:border-slate-700 dark:hover:bg-cyan-900/20"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {course.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {course.category} • {course.level}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchPrerequisites && filteredCourses.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                        Không tìm thấy khóa học phù hợp
                      </div>
                    )}

                    {selectedPrerequisites.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                          Khóa học đã chọn ({selectedPrerequisites.length})
                        </p>
                        <div className="space-y-2">
                          {selectedPrerequisites.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-900/30 dark:bg-cyan-900/20"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {course.title}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                  {course.category} • {course.level}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemovePrerequisite(course.id)
                                }
                                className="ml-2 rounded-lg p-1 text-slate-600 transition hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                  onClick={() => handleCreateCourse("draft")}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                  onClick={handleGoToLessons}
                >
                  <PlusCircle className="h-4 w-4" />
                  Tiếp tục nhập bài học
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300"
                  onClick={() => handleCreateCourse("pending")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? "Đang xử lý..." : "Tạo và gửi duyệt"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 p-4 sm:p-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <PlayCircle className="h-4 w-4" />
                    Danh sách bài học
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToDetails}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại tạo tiêu đề
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                  <span className="font-semibold">Khóa học:</span>{" "}
                  {courseTitle || "Chưa có tiêu đề"}
                </div>
              </article>

              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  <span className="font-semibold">
                    Tổng thời lượng: {calculateTotalDuration()}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <article
                    key={lesson.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Bài học {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(lesson.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Tiêu đề bài học
                        </span>
                        <input
                          className={fieldClassName}
                          placeholder="VD: Cài đặt môi trường"
                          value={lesson.title}
                          onChange={(event) =>
                            handleLessonChange(
                              lesson.id,
                              "title",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Link video
                        </span>
                        <div className="relative">
                          <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                            placeholder="https://..."
                            value={lesson.videoUrl}
                            onChange={(event) =>
                              handleLessonChange(
                                lesson.id,
                                "videoUrl",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Thời lượng
                        </span>
                        <input
                          className={fieldClassName}
                          placeholder="VD: 12:30"
                          value={lesson.duration}
                          onChange={(event) =>
                            handleLessonChange(
                              lesson.id,
                              "duration",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Loại bài học
                        </span>
                        <select
                          className={fieldClassName}
                          value={lesson.type}
                          onChange={(event) =>
                            handleLessonChange(
                              lesson.id,
                              "type",
                              event.target.value,
                            )
                          }
                        >
                          <option>Video</option>
                          <option>Practice</option>
                          <option>Quiz</option>
                        </select>
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Mô tả ngắn bài học
                        </span>
                        <textarea
                          rows={3}
                          className={fieldClassName}
                          placeholder="Nội dung chính của bài học này..."
                          value={lesson.summary}
                          onChange={(event) =>
                            handleLessonChange(
                              lesson.id,
                              "summary",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg"
                >
                  <PlusCircle className="h-4 w-4" />
                  Thêm bài học
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <Save className="h-4 w-4" />
                  Lưu danh sách bài học
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <ListChecks className="h-4 w-4" />
              Checklist trước khi xuất bản
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Đặt title ngắn, rõ kết quả học tập.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Viết outline theo từng module nhỏ.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Thêm ảnh bìa đúng tỉ lệ để hiển thị đẹp.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Chốt giá và mô tả ưu đãi trước khi public.
              </li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-4 w-4" />
              Preview nhanh
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Course card
              </p>
              <div className="mt-3 h-36 rounded-2xl bg-linear-to-br from-cyan-400/30 via-emerald-400/25 to-violet-400/25" />
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                Tên khóa học sẽ hiển thị ở đây
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Mô tả ngắn, cấp độ và thông tin giá bán.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Layers3 className="h-4 w-4" />
              Trạng thái tiến độ
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 ${
                  step === "details" ? "w-2/5" : "w-4/5"
                }`}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {step === "details"
                ? "Bạn đã hoàn thành 40% thông tin bắt buộc để xuất bản."
                : "Bạn đang ở bước thiết lập bài học, hoàn thành 80% quy trình tạo khóa học."}
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}

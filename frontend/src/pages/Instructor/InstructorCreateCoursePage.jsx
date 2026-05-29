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
import { useAuthStore } from "../../store/authStore";
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

const formatDurationLabel = (totalSeconds = 0) => {
  const secondsValue = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(secondsValue / 3600);
  const minutes = Math.floor((secondsValue % 3600) / 60);
  const seconds = secondsValue % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
  }

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
};

const getLessonDurationSeconds = (lesson) => {
  const hours = Math.max(0, Number(lesson.durationHours) || 0);
  const minutes = Math.max(0, Number(lesson.durationMinutes) || 0);
  const seconds = Math.max(0, Number(lesson.durationSeconds) || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

export default function InstructorCreateCoursePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState("details");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("Lập trình");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseValueScore, setCourseValueScore] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState(null);
  const [hasSavedLessons, setHasSavedLessons] = useState(false);
  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: "",
      videoUrl: "",
      durationHours: "",
      durationMinutes: "",
      durationSeconds: "",
      type: "Video",
      summary: "",
      attachments: [],
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

  // NOTE: Keep the selected image local for preview; upload to Cloudinary only when saving.
  const handleThumbnailUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailUrl("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreviewUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const resolveThumbnailUrl = async () => {
    if (thumbnailFile) {
      const uploadedUrl =
        await instructorService.uploadThumbnailImage(thumbnailFile);
      setThumbnailUrl(uploadedUrl);
      setThumbnailFile(null);
      return uploadedUrl;
    }

    return thumbnailUrl.trim() || undefined;
  };

  const calculateTotalDuration = () =>
    formatDurationLabel(
      lessons.reduce(
        (sum, lesson) => sum + getLessonDurationSeconds(lesson),
        0,
      ),
    );

  const buildCoursePayload = (status = "draft") => ({
    title: courseTitle.trim(),
    description: courseDescription,
    level: courseLevel,
    price: Number(coursePrice) || 0,
    valueScore: Math.min(10, Math.max(1, Number(courseValueScore) || 1)),
    thumbnailUrl: thumbnailUrl.trim() || undefined,
    introVideoUrl: introVideoUrl.trim() || undefined,
    status,
    prerequisites: selectedPrerequisites.map((item) => item.title),
    tags: courseCategory ? [courseCategory] : [],
  });

  const persistDraftCourse = async () => {
    if (!courseTitle.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return null;
    }

    const payload = {
      ...buildCoursePayload("draft"),
      thumbnailUrl: await resolveThumbnailUrl(),
    };
    const course = savedCourseId
      ? await instructorService.updateCourse(savedCourseId, payload)
      : await instructorService.createCourse(payload);

    setSavedCourseId(course?._id || course?.id || savedCourseId);
    return course;
  };

  const handleGoToLessons = async () => {
    try {
      setIsSaving(true);
      const course = await persistDraftCourse();
      if (!course) return;

      setHasSavedLessons(Boolean(course.totalLessons > 0));
      setStep("lessons");
      toast.success("Đã lưu nháp khóa học, giờ nhập bài học");
    } catch (error) {
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể lưu khóa học");
      }
    } finally {
      setIsSaving(false);
    }
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

  const handleLessonAttachmentUpload = async (lessonId, file) => {
    try {
      const lesson = lessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      handleLessonChange(lessonId, "isUploading", true);
      const attachment = await instructorService.uploadLessonAttachment(file);
      const newAttachments = [...(lesson.attachments || []), attachment];
      handleLessonChange(lessonId, "attachments", newAttachments);
      toast.success("Tệp đính kèm đã tải lên");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tải lên tệp");
    } finally {
      handleLessonChange(lessonId, "isUploading", false);
    }
  };

  const handleAddLesson = () => {
    setLessons((prevLessons) => [
      ...prevLessons,
      {
        id: Date.now(),
        title: "",
        videoUrl: "",
        durationHours: "",
        durationMinutes: "",
        durationSeconds: "",
        type: "Video",
        summary: "",
        attachments: [],
      },
    ]);
  };

  const handleRemoveLesson = (lessonId) => {
    setLessons((prevLessons) => {
      if (prevLessons.length === 1) return prevLessons;
      return prevLessons.filter((lesson) => lesson.id !== lessonId);
    });
  };

  const handleSubmitForReview = async () => {
    if (!hasSavedLessons) {
      toast.error("Khóa học cần có ít nhất một bài học trước khi gửi duyệt");
      return;
    }

    try {
      setIsSaving(true);

      // Ensure latest fields (thumbnail, title, etc.) are persisted before submit
      const course = await persistDraftCourse();
      if (!course) return;
      const courseId = course?._id || course?.id || savedCourseId;

      await instructorService.submitCourseForReview(courseId);
      toast.success("Đã gửi khóa học lên chờ duyệt");
      navigate("/dashboard/courses/manage");
    } catch (error) {
      // If user is no longer authenticated, interceptor handled logout - don't show error
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể gửi duyệt");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraftCourse = async () => {
    try {
      setIsSaving(true);
      const course = await persistDraftCourse();
      if (!course) return;

      toast.success("Đã lưu khóa học nháp");
      navigate("/dashboard/courses/manage");
    } catch (error) {
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể lưu khóa học");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLessons = async () => {
    try {
      setIsSaving(true);

      let courseId = savedCourseId;
      if (!courseId) {
        const draftCourse = await persistDraftCourse();
        courseId = draftCourse?._id || draftCourse?.id;
      }

      if (!courseId) {
        toast.error("Không tìm được khóa học để lưu bài học");
        return;
      }

      for (const lesson of lessons) {
        const payload = {
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: getLessonDurationSeconds(lesson),
          summary: lesson.summary,
          resources: lesson.resources || [],
          attachments: lesson.attachments || [],
        };

        await instructorService.createLesson(courseId, payload);
      }

      setHasSavedLessons(true);
      setStep("details");
      toast.success("Lưu bài học thành công. Giờ có thể gửi duyệt khóa học");
    } catch (error) {
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể lưu bài học");
      }
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
                    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <p className="text-xs text-slate-400">
                        Ghi chú: Chọn ảnh để xem preview trước, Cloudinary chỉ
                        được lưu khi bạn bấm Lưu nháp hoặc Gửi duyệt.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:text-cyan-300">
                          <ImagePlus className="h-4 w-4" />
                          Chọn ảnh từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                          />
                        </label>
                        <input
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                          placeholder="Hoặc dán link ảnh thumbnail"
                          value={thumbnailUrl}
                          onChange={(event) => {
                            setThumbnailUrl(event.target.value);
                            setThumbnailFile(null);
                            setThumbnailPreviewUrl("");
                          }}
                        />
                      </div>
                    </div>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Intro video YouTube unlisted (optional)
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dán link YouTube ở chế độ unlisted để học viên xem trực
                      tiếp trong bài học.
                    </p>
                    <input
                      className={fieldClassName}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={introVideoUrl}
                      onChange={(event) => setIntroVideoUrl(event.target.value)}
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tổng thời lượng khóa học
                    </span>
                    <input
                      className={`${fieldClassName} cursor-default bg-slate-50 dark:bg-slate-800`}
                      value={calculateTotalDuration()}
                      readOnly
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      (Tiếng Phút Giây)
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tự động cộng từ tổng thời lượng của tất cả bài học.
                    </p>
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Điểm ưu tiên (Value Score)
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      className={fieldClassName}
                      placeholder="VD: 10"
                      value={courseValueScore}
                      onChange={(e) => {
                        const raw = Number(e.target.value) || 0;
                        const clamped = Math.min(
                          10,
                          Math.max(1, Math.floor(raw)),
                        );
                        setCourseValueScore(clamped);
                      }}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Điểm giúp hệ thống ưu tiên khóa học khi đề xuất lộ trình.
                      Giá trị càng cao, mức ưu tiên càng lớn.
                    </p>
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
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-cyan-600" />
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
                  onClick={handleSaveDraftCourse}
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
                  disabled={isSaving || !hasSavedLessons}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    hasSavedLessons
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                  onClick={handleSubmitForReview}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving
                    ? "Đang xử lý..."
                    : hasSavedLessons
                      ? "Gửi duyệt"
                      : "Cần lưu bài học trước"}
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
                          Link video YouTube unlisted
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Dán link video YouTube riêng cho bài học này. Khi học
                          viên mở bài, link sẽ được nhúng trực tiếp.
                        </p>
                        <div className="relative">
                          <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                            placeholder="https://www.youtube.com/watch?v=..."
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

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Thời lượng
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          <label className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Tiếng
                            </span>
                            <input
                              type="number"
                              min="0"
                              className={fieldClassName}
                              placeholder="0"
                              value={lesson.durationHours}
                              onChange={(event) =>
                                handleLessonChange(
                                  lesson.id,
                                  "durationHours",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Phút
                            </span>
                            <input
                              type="number"
                              min="0"
                              className={fieldClassName}
                              placeholder="12"
                              value={lesson.durationMinutes}
                              onChange={(event) =>
                                handleLessonChange(
                                  lesson.id,
                                  "durationMinutes",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Giây
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              className={fieldClassName}
                              placeholder="30"
                              value={lesson.durationSeconds}
                              onChange={(event) =>
                                handleLessonChange(
                                  lesson.id,
                                  "durationSeconds",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Tài liệu đính kèm
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:text-cyan-300">
                            <FileText className="h-4 w-4" />
                            Chọn tệp
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.zip"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleLessonAttachmentUpload(lesson.id, file);
                                e.target.value = "";
                              }}
                            />
                          </label>

                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {(lesson.attachments || []).length > 0 ? (
                              <ul className="space-y-1">
                                {(lesson.attachments || []).map((att, aIdx) => (
                                  <li
                                    key={aIdx}
                                    className="flex items-center gap-2"
                                  >
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-700 underline dark:text-cyan-300"
                                    >
                                      {att.fileName || "Tệp đính kèm"}
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = (
                                          lesson.attachments || []
                                        ).filter((_, i) => i !== aIdx);
                                        handleLessonChange(
                                          lesson.id,
                                          "attachments",
                                          newList,
                                        );
                                      }}
                                      className="ml-2 rounded-lg p-1 text-slate-600 transition hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Chỉ hỗ trợ pdf, docx, zip
                              </p>
                            )}
                          </div>
                        </div>
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
                  disabled={isSaving}
                  onClick={handleSaveLessons}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu danh sách bài học"}
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
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                {thumbnailPreviewUrl || thumbnailUrl ? (
                  <img
                    src={thumbnailPreviewUrl || thumbnailUrl}
                    alt={courseTitle || "Thumbnail preview"}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-linear-to-br from-cyan-400/30 via-emerald-400/25 to-violet-400/25 text-sm font-semibold text-slate-500 dark:text-slate-300">
                    Ảnh bìa sẽ hiển thị ở đây
                  </div>
                )}
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                {courseTitle || "Tên khóa học sẽ hiển thị ở đây"}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {courseDescription ||
                  "Mô tả ngắn, cấp độ và thông tin giá bán."}
              </p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tổng thời lượng khóa học
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {calculateTotalDuration()}
                </p>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Điểm ưu tiên (Value Score)
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {Number(courseValueScore) || 0}
                </p>
              </div>
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

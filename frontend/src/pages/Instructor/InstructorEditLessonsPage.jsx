import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookPlus,
  Clock3,
  FileText,
  ImagePlus,
  Loader2,
  PlusCircle,
  PlayCircle,
  Save,
  Search,
  Trash2,
  Video,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import courseService from "../../services/courseService";
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

const parseDuration = (value) => {
  if (!value) return 0;

  if (String(value).includes(":")) {
    const parts = String(value)
      .split(":")
      .map((part) => Number(part));

    if (parts.some((part) => Number.isNaN(part))) return 0;

    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }

    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }
  }

  return Number(value) || 0;
};

export default function InstructorEditLessonsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState(null);
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
  const [hasPrerequisites, setHasPrerequisites] = useState(false);
  const [searchPrerequisites, setSearchPrerequisites] = useState("");
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
  const [candidateCourses, setCandidateCourses] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [removedLessonIds, setRemovedLessonIds] = useState([]);

  const filteredCourses = useMemo(() => {
    return candidateCourses.filter(
      (approvedCourse) =>
        (approvedCourse.title || "")
          .toLowerCase()
          .includes((searchPrerequisites || "").toLowerCase()) &&
        !selectedPrerequisites.find(
          (item) =>
            (item._id || item.id) === (approvedCourse._id || approvedCourse.id),
        ),
    );
  }, [searchPrerequisites, selectedPrerequisites, candidateCourses]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await instructorService.getMyCourseDetail(id);
        setCourse(data);
        setCourseTitle(data.title || "");
        setCourseDescription(data.description || "");
        setCourseCategory(data.tags?.[0] || "Lập trình");
        setCourseLevel(data.level || "beginner");
        setCoursePrice(data.price || 0);
        setThumbnailUrl(data.thumbnailUrl || "");
        setThumbnailFile(null);
        setThumbnailPreviewUrl("");
        setIntroVideoUrl(data.introVideoUrl || "");
        setHasPrerequisites((data.prerequisites || []).length > 0);
        setCourseValueScore(data.valueScore || 1);
        // Prefill selectedPrerequisites by fetching each prerequisite course
        const prereqIds = data.prerequisites || [];
        if (prereqIds.length > 0) {
          try {
            const fetched = await Promise.all(
              prereqIds.map(async (pid) => {
                try {
                  const resp = await courseService.getCourseById(pid);
                  // courseService returns response.data which may contain { message, data }
                  return resp.data || resp.course || resp;
                } catch (err) {
                  return null;
                }
              }),
            );
            const valid = fetched.filter(Boolean);
            setSelectedPrerequisites(valid);
          } catch (err) {
            // ignore
          }
        } else {
          setSelectedPrerequisites([]);
        }
        setLessons(
          (data.lessons || []).length > 0
            ? data.lessons.map((lesson, index) => {
                const total = Number(lesson.duration) || 0;
                const hours = Math.floor(total / 3600);
                const minutes = Math.floor((total % 3600) / 60);
                const seconds = total % 60;

                return {
                  _id: lesson._id,
                  id: lesson._id || `lesson-${index + 1}`,
                  title: lesson.title || "",
                  videoUrl: lesson.videoUrl || "",
                  durationHours: String(hours),
                  durationMinutes: String(minutes),
                  durationSeconds: String(seconds),
                  summary: lesson.summary || "",
                  type: "Video",
                  order: lesson.order || index + 1,
                  resources: lesson.resources || [],
                  attachments: lesson.attachments || [],
                };
              })
            : [
                {
                  id: `lesson-${Date.now()}`,
                  title: "",
                  videoUrl: "",
                  durationHours: "",
                  durationMinutes: "",
                  durationSeconds: "",
                  summary: "",
                  type: "Video",
                  order: 1,
                  resources: [],
                  attachments: [],
                },
              ],
        );
      } catch (error) {
        if (isAuthenticated) {
          toast.error(
            error?.response?.data?.message || "Không thể tải chi tiết khóa học",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, isAuthenticated]);

  const handleAddPrerequisite = (approvedCourse) => {
    setSelectedPrerequisites((prev) => [...prev, approvedCourse]);
    setSearchPrerequisites("");
  };

  const handleRemovePrerequisite = (courseId) => {
    setSelectedPrerequisites((prev) =>
      prev.filter((item) => (item._id || item.id) !== courseId),
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

      // optimistic: show uploading indicator on lesson
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
        id: `lesson-${Date.now()}`,
        title: "",
        videoUrl: "",
        durationHours: "",
        durationMinutes: "",
        durationSeconds: "",
        summary: "",
        type: "Video",
        order: prevLessons.length + 1,
        resources: [],
        attachments: [],
      },
    ]);
  };

  const handleRemoveLesson = (lessonId) => {
    setLessons((prevLessons) => {
      const removedLesson = prevLessons.find(
        (lesson) => lesson.id === lessonId,
      );
      if (removedLesson?._id) {
        setRemovedLessonIds((prev) => [...prev, removedLesson._id]);
      }

      if (prevLessons.length === 1) return prevLessons;
      return prevLessons.filter((lesson) => lesson.id !== lessonId);
    });
  };

  const calculateTotalDuration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => {
      const hasParts =
        lesson.durationHours !== undefined ||
        lesson.durationMinutes !== undefined ||
        lesson.durationSeconds !== undefined;

      if (hasParts) {
        const h = Math.max(0, Number(lesson.durationHours) || 0);
        const m = Math.max(0, Number(lesson.durationMinutes) || 0);
        const s = Math.max(0, Number(lesson.durationSeconds) || 0);
        return sum + h * 3600 + m * 60 + s;
      }

      return sum + parseDuration(lesson.duration);
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

  const buildCoursePayload = () => ({
    title: courseTitle.trim(),
    description: courseDescription,
    level: courseLevel,
    price: Number(coursePrice) || 0,
    thumbnailUrl: thumbnailUrl.trim() || undefined,
    introVideoUrl: introVideoUrl.trim() || undefined,
    // send prerequisite IDs to backend
    prerequisites: selectedPrerequisites.map((item) => item._id || item.id),
    valueScore: Math.min(10, Math.max(1, Number(courseValueScore) || 1)),
    tags: courseCategory ? [courseCategory] : [],
  });

  // Debounced search for candidate courses
  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const doSearch = async () => {
      if (!searchPrerequisites || searchPrerequisites.trim().length < 2) {
        setCandidateCourses([]);
        return;
      }

      try {
        setSearchLoading(true);
        const data = await courseService.getPublishedCourses({
          q: searchPrerequisites.trim(),
          limit: 50,
        });
        if (cancelled) return;
        setCandidateCourses(data.data || data.courses || data.docs || []);
      } catch (err) {
        toast.error("Không thể tìm khóa học để làm điều kiện tiên quyết");
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };

    timer = setTimeout(doSearch, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchPrerequisites]);

  const handleSaveAll = async () => {
    if (!id) {
      toast.error("Không tìm được khóa học");
      return;
    }

    if (!courseTitle.trim()) {
      toast.error("Vui lòng nhập tên khóa học");
      return;
    }

    try {
      setIsSaving(true);

      const updatedCourse = await instructorService.updateCourse(id, {
        ...buildCoursePayload(),
        thumbnailUrl: await resolveThumbnailUrl(),
      });
      setCourse(updatedCourse);

      for (const lessonId of removedLessonIds) {
        await instructorService.deleteLesson(id, lessonId);
      }

      for (const [index, lesson] of lessons.entries()) {
        const hasParts =
          lesson.durationHours !== undefined ||
          lesson.durationMinutes !== undefined ||
          lesson.durationSeconds !== undefined;

        const durationSeconds = hasParts
          ? Math.max(0, Number(lesson.durationHours) || 0) * 3600 +
            Math.max(0, Number(lesson.durationMinutes) || 0) * 60 +
            Math.max(0, Number(lesson.durationSeconds) || 0)
          : parseDuration(lesson.duration);

        const payload = {
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: durationSeconds,
          summary: lesson.summary,
          resources: lesson.resources || [],
          attachments: lesson.attachments || [],
          order: index + 1,
        };

        if (lesson._id) {
          await instructorService.updateLesson(id, lesson._id, payload);
        } else {
          await instructorService.createLesson(id, payload);
        }
      }

      toast.success("Đã lưu thay đổi khóa học và bài học");
      navigate(`/dashboard/courses/manage/${id}`);
    } catch (error) {
      if (isAuthenticated) {
        toast.error(error?.response?.data?.message || "Không thể lưu thay đổi");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Đang tải dữ liệu khóa học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Không tìm thấy khóa học
        </h1>
        <p>Khóa học có thể đã bị xóa hoặc bạn không có quyền chỉnh sửa.</p>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/courses/manage/${id}`)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang xem
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <PlayCircle className="h-4 w-4" />
            Sửa khóa học và bài học
          </div>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/courses/manage/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang xem
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
          <span className="font-semibold">Khóa học:</span> {course.title}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <BookPlus className="h-4 w-4" />
          Thông tin khóa học
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề khóa học
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
              onChange={(event) => setCourseCategory(event.target.value)}
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
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
                placeholder="799000"
                value={coursePrice}
                onChange={(event) => setCoursePrice(event.target.value)}
              />
            </div>
          </label>

          <label className="space-y-2">
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
                const clamped = Math.min(10, Math.max(1, Math.floor(raw)));
                setCourseValueScore(clamped);
              }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Điểm giúp hệ thống ưu tiên khóa học khi đề xuất lộ trình (1-10).
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ảnh bìa
            </span>
            <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs text-slate-400">
                Ghi chú: Chọn ảnh để xem preview trước, Cloudinary chỉ được lưu
                khi bạn bấm Lưu thay đổi.
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
              {thumbnailPreviewUrl ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <img
                    src={thumbnailPreviewUrl}
                    alt="Thumbnail preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : thumbnailUrl ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Intro video YouTube unlisted (optional)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dán link YouTube ở chế độ unlisted để học viên xem trực tiếp trong
              bài học.
            </p>
            <input
              className={fieldClassName}
              placeholder="https://www.youtube.com/watch?v=..."
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
              onChange={(event) => setCourseDescription(event.target.value)}
            />
          </label>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <BookPlus className="h-4 w-4" />
            Điều kiện tiên quyết
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={hasPrerequisites}
              onChange={(event) => setHasPrerequisites(event.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-600 peer-checked:after:translate-x-full dark:bg-slate-600 dark:after:border-slate-500" />
          </label>
        </div>

        {hasPrerequisites && (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm khóa học tiên quyết..."
                value={searchPrerequisites}
                onChange={(event) => setSearchPrerequisites(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-500/20"
              />
            </div>

            {searchPrerequisites && filteredCourses.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                {filteredCourses.map((approvedCourse) => (
                  <button
                    key={approvedCourse.id}
                    type="button"
                    onClick={() => handleAddPrerequisite(approvedCourse)}
                    className="w-full border-b border-slate-200 px-4 py-3 text-left transition hover:bg-cyan-50 dark:border-slate-700 dark:hover:bg-cyan-900/20"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {approvedCourse.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {approvedCourse.category} • {approvedCourse.level}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedPrerequisites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Khóa học đã chọn ({selectedPrerequisites.length})
                </p>
                <div className="space-y-2">
                  {selectedPrerequisites.map((prerequisite) => (
                    <div
                      key={prerequisite.id}
                      className="flex items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-900/30 dark:bg-cyan-900/20"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {prerequisite.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                          {prerequisite.category} • {prerequisite.level}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemovePrerequisite(prerequisite.id)
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
                    handleLessonChange(lesson.id, "title", event.target.value)
                  }
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Link video YouTube unlisted
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dán link video YouTube riêng cho bài học này. Khi học viên mở
                  bài, link sẽ được nhúng trực tiếp.
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

              <label className="space-y-2">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:text-cyan-300">
                    <FileText className="h-4 w-4" />
                    Chọn tệp
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLessonAttachmentUpload(lesson.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {(lesson.attachments || []).length > 0 ? (
                      <ul className="space-y-1">
                        {(lesson.attachments || []).map((att, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-2">
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
                    handleLessonChange(lesson.id, "summary", event.target.value)
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
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi khóa học"}
        </button>
      </div>
    </div>
  );
}

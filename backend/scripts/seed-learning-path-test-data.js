import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Course from "../src/models/Course.js";
import Enrollment from "../src/models/Enrollment.js";
import Review from "../src/models/Review.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_CONNECTIONSTRING;
const DEFAULT_PASSWORD = "Instructor@123";

const YOUTUBE_LINKS = [
  "https://youtu.be/P5kpJSsL3Hw",
  "https://youtu.be/p_994MlSyUM",
  "https://youtu.be/VIKGOgm0nGI",
  "https://youtu.be/6_0GmrcM7EI",
  "https://youtu.be/HNVcB1ngPx8",
  "https://youtu.be/sJBvxrv7BbA",
];

const categorySeeds = [
  {
    name: "Lập trình",
    slug: "lap-trinh",
    description: "Danh mục khóa học lập trình",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Danh mục khóa học marketing",
  },
  {
    name: "Thiết kế",
    slug: "thiet-ke",
    description: "Danh mục khóa học thiết kế",
  },
];

const userSeeds = [
  {
    username: "mentor.dev.a",
    email: "mentor.dev.a@example.com",
    displayName: "Giang Vien Dev A",
    role: "instructor",
  },
  {
    username: "mentor.dev.b",
    email: "mentor.dev.b@example.com",
    displayName: "Giang Vien Dev B",
    role: "instructor",
  },
  {
    username: "mentor.mkt.c",
    email: "mentor.mkt.c@example.com",
    displayName: "Giang Vien Marketing C",
    role: "instructor",
  },
  {
    username: "mentor.design.d",
    email: "mentor.design.d@example.com",
    displayName: "Giang Vien Design D",
    role: "instructor",
  },
];

const STUDENT_COUNT = 90;
const studentSeeds = Array.from({ length: STUDENT_COUNT }, (_, index) => {
  const no = String(index + 1).padStart(3, "0");
  return {
    username: `student.${no}`,
    email: `student.${no}@example.com`,
    displayName: `Hoc Vien ${no}`,
    role: "student",
  };
});

const STUDENT_PASSWORD = "Student@123";

const buildLessons = (modules = [], options = {}) => {
  const theoryDuration = options.theoryDuration || 1800; // 30m
  const practiceDuration = options.practiceDuration || 2400; // 40m
  const addCapstone = options.addCapstone ?? true;

  const lessons = [];
  let order = 1;

  modules.forEach((module, index) => {
    lessons.push({
      title: `${module} - Ly thuyet`,
      lessonType: "theory",
      videoUrl: YOUTUBE_LINKS[(order - 1) % YOUTUBE_LINKS.length],
      duration: theoryDuration + index * 90,
      summary: `Phan ly thuyet cua module: ${module}`,
      order,
      resources: [],
      attachments: [],
    });
    order += 1;

    lessons.push({
      title: `${module} - Thuc hanh`,
      lessonType: "practice",
      videoUrl: YOUTUBE_LINKS[(order - 1) % YOUTUBE_LINKS.length],
      duration: practiceDuration + index * 120,
      summary: `Bai thuc hanh ap dung cho module: ${module}`,
      order,
      resources: [],
      attachments: [],
    });
    order += 1;
  });

  if (addCapstone) {
    lessons.push({
      title: "Do an tong ket - Thuc hanh",
      lessonType: "practice",
      videoUrl: YOUTUBE_LINKS[(order - 1) % YOUTUBE_LINKS.length],
      duration: Math.round(practiceDuration * 1.5),
      summary: "Bai tong hop cuoi khoa de test nang luc va tien do.",
      order,
      resources: [],
      attachments: [],
    });
  }

  return lessons;
};

const courseSeeds = [
  {
    slug: "lp-js-nen-tang",
    title: "Lap Trinh JavaScript Nen Tang",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.a",
    level: "beginner",
    price: 199000,
    targetRatingAvg: 4.3,
    enrollmentTarget: 36,
    reviewTarget: 24,
    tags: ["javascript", "web", "frontend"],
    modules: [
      "Tong quan JavaScript",
      "Bien va kieu du lieu",
      "Ham va scope",
      "Array va Object",
      "DOM can ban",
    ],
    lessonOptions: { theoryDuration: 1500, practiceDuration: 2100 },
    prerequisiteSlugs: [],
  },
  {
    slug: "lp-react-thuc-chien",
    title: "React Thuc Chien Tu Co Ban Den Nang Cao",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.a",
    level: "intermediate",
    price: 399000,
    targetRatingAvg: 4.8,
    enrollmentTarget: 62,
    reviewTarget: 41,
    tags: ["react", "frontend", "spa"],
    modules: [
      "React va JSX",
      "State va props",
      "Hooks can ban",
      "Quan ly state nang cao",
      "React Router",
      "Thuc hanh todo app",
      "Toi uu hieu nang",
      "Test giao dien",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2400 },
    prerequisiteSlugs: ["lp-js-nen-tang"],
  },
  {
    slug: "lp-nodejs-api",
    title: "Node.js API Va Kien Truc Backend",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.a",
    level: "intermediate",
    price: 459000,
    targetRatingAvg: 4.7,
    enrollmentTarget: 55,
    reviewTarget: 33,
    tags: ["nodejs", "express", "backend"],
    modules: [
      "Tong quan backend",
      "Routing va middleware",
      "Xac thuc JWT",
      "Thuc hanh CRUD API",
      "MongoDB va Mongoose",
      "Upload file",
      "Bao mat API",
      "Deploy",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2700 },
    prerequisiteSlugs: ["lp-js-nen-tang"],
  },
  {
    slug: "lp-system-design-web",
    title: "System Design Cho Ung Dung Web",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.a",
    level: "advanced",
    price: 699000,
    targetRatingAvg: 4.9,
    enrollmentTarget: 74,
    reviewTarget: 58,
    tags: ["system-design", "backend", "scalability"],
    modules: [
      "Yeu cau va use case",
      "Architectural pattern",
      "Database design",
      "Caching va queue",
      "Monitoring",
      "Load balancing",
      "High availability",
      "Case study tong hop",
    ],
    lessonOptions: { theoryDuration: 2400, practiceDuration: 3300 },
    prerequisiteSlugs: ["lp-nodejs-api", "lp-react-thuc-chien"],
  },
  {
    slug: "lp-python-tu-dong-hoa",
    title: "Python Tu Dong Hoa Cong Viec Van Phong",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.b",
    level: "beginner",
    price: 289000,
    targetRatingAvg: 4.4,
    enrollmentTarget: 39,
    reviewTarget: 22,
    tags: ["python", "automation", "script"],
    modules: [
      "Nhap mon Python",
      "Doc ghi file",
      "Xu ly Excel",
      "Gui email tu dong",
      "Thuc hanh auto report",
    ],
    lessonOptions: { theoryDuration: 1500, practiceDuration: 2400 },
    prerequisiteSlugs: [],
  },
  {
    slug: "lp-python-data-automation",
    title: "Python Data Automation Nang Cao",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.b",
    level: "advanced",
    price: 619000,
    targetRatingAvg: 4.6,
    enrollmentTarget: 49,
    reviewTarget: 29,
    tags: ["python", "data", "etl", "automation"],
    modules: [
      "ETL can ban",
      "Xu ly data lon",
      "Lap lich cong viec",
      "Kiem thu script",
      "Logging va alert",
      "Pipeline deployment",
      "Case study doanh nghiep",
    ],
    lessonOptions: { theoryDuration: 2100, practiceDuration: 3000 },
    prerequisiteSlugs: ["lp-python-tu-dong-hoa"],
  },
  {
    slug: "mkt-digital-nen-tang",
    title: "Digital Marketing Nen Tang",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "beginner",
    price: 249000,
    targetRatingAvg: 4.1,
    enrollmentTarget: 35,
    reviewTarget: 19,
    tags: ["digital", "marketing", "content"],
    modules: [
      "Tong quan digital marketing",
      "Nghien cuu khach hang",
      "Xay dung funnel",
      "Thuc hanh content plan",
      "Do luong KPI",
      "Email marketing",
    ],
    lessonOptions: { theoryDuration: 1500, practiceDuration: 2100 },
    prerequisiteSlugs: [],
  },
  {
    slug: "mkt-performance-ads",
    title: "Performance Marketing Va Quang Cao Chuyen Doi",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "advanced",
    price: 549000,
    targetRatingAvg: 4.6,
    enrollmentTarget: 46,
    reviewTarget: 27,
    tags: ["ads", "performance", "facebook", "google"],
    modules: [
      "Campaign objective",
      "Cau truc tai khoan ads",
      "Tracking va attribution",
      "Thuc hanh toi uu campaign",
      "Scale ngan sach",
      "Bao cao va dashboard",
      "A/B testing nang cao",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2700 },
    prerequisiteSlugs: ["mkt-digital-nen-tang"],
  },
  {
    slug: "mkt-social-commerce-master",
    title: "Social Commerce Masterclass",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "intermediate",
    price: 429000,
    targetRatingAvg: 4.5,
    enrollmentTarget: 40,
    reviewTarget: 21,
    tags: ["social", "commerce", "tiktok", "content"],
    modules: [
      "Nen tang social commerce",
      "Noi dung ban hang",
      "Livestream chuyen doi",
      "Quy trinh chot don",
      "Van hanh va CSKH",
      "Bao cao doanh thu",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2400 },
    prerequisiteSlugs: ["mkt-digital-nen-tang"],
  },
  {
    slug: "design-ui-figma",
    title: "UI Design Voi Figma",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "beginner",
    price: 329000,
    targetRatingAvg: 4.5,
    enrollmentTarget: 43,
    reviewTarget: 24,
    tags: ["ui", "figma", "design"],
    modules: [
      "Tong quan UI",
      "Typography",
      "Mau sac",
      "Thuc hanh wireframe",
      "Prototype",
      "Design handoff",
    ],
    lessonOptions: { theoryDuration: 1500, practiceDuration: 2400 },
    prerequisiteSlugs: [],
  },
  {
    slug: "design-brand-visual",
    title: "Brand Visual Design Tu Co Ban",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "intermediate",
    price: 379000,
    targetRatingAvg: 4.2,
    enrollmentTarget: 29,
    reviewTarget: 15,
    tags: ["branding", "visual", "design"],
    modules: [
      "Nhan dien thuong hieu",
      "He thong mau sac thuong hieu",
      "Thuc hanh key visual",
      "Ung dung bo nhan dien",
      "Social media guideline",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2400 },
    prerequisiteSlugs: ["design-ui-figma"],
  },
  {
    slug: "design-product-ux-research",
    title: "Product UX Research Va Testing",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "advanced",
    price: 589000,
    targetRatingAvg: 4.8,
    enrollmentTarget: 52,
    reviewTarget: 34,
    tags: ["ux", "research", "product"],
    modules: [
      "UX process",
      "Research method",
      "User interview",
      "Persona va journey map",
      "Usability testing",
      "Tong hop insight",
      "Roadmap cai tien",
    ],
    lessonOptions: { theoryDuration: 2100, practiceDuration: 3000 },
    prerequisiteSlugs: ["design-ui-figma", "design-brand-visual"],
  },
  {
    slug: "lp-nextjs-fullstack",
    title: "Next.js Fullstack Thuc Chien",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.a",
    level: "advanced",
    price: 749000,
    targetRatingAvg: 4.7,
    enrollmentTarget: 64,
    reviewTarget: 38,
    tags: ["nextjs", "fullstack", "react", "nodejs"],
    modules: [
      "App Router",
      "Server Components",
      "Auth va session",
      "API route",
      "Database integration",
      "Caching strategy",
      "Performance optimization",
      "Deploy production",
    ],
    lessonOptions: { theoryDuration: 2100, practiceDuration: 3000 },
    prerequisiteSlugs: ["lp-react-thuc-chien", "lp-nodejs-api"],
  },
  {
    slug: "lp-devops-ci-cd",
    title: "DevOps CI/CD Cho Web App",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.b",
    level: "advanced",
    price: 669000,
    targetRatingAvg: 4.5,
    enrollmentTarget: 44,
    reviewTarget: 28,
    tags: ["devops", "cicd", "docker", "deployment"],
    modules: [
      "Docker fundamentals",
      "Containerizing app",
      "CI pipeline",
      "CD pipeline",
      "Infrastructure basics",
      "Monitoring va alert",
      "Incident response",
    ],
    lessonOptions: { theoryDuration: 2000, practiceDuration: 3000 },
    prerequisiteSlugs: ["lp-nodejs-api"],
  },
  {
    slug: "lp-dsa-for-interview",
    title: "Data Structures Va Algorithm Cho Phong Van",
    categorySlug: "lap-trinh",
    instructorUsername: "mentor.dev.b",
    level: "intermediate",
    price: 529000,
    targetRatingAvg: 4.4,
    enrollmentTarget: 58,
    reviewTarget: 36,
    tags: ["dsa", "algorithm", "interview", "coding"],
    modules: [
      "Array va String",
      "Hash map",
      "Linked list",
      "Tree va graph",
      "Dynamic programming",
      "Greedy va backtracking",
      "Mock interview",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2700 },
    prerequisiteSlugs: ["lp-js-nen-tang"],
  },
  {
    slug: "mkt-brand-strategy",
    title: "Brand Strategy Cho Doanh Nghiep Nho",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "intermediate",
    price: 469000,
    targetRatingAvg: 4.3,
    enrollmentTarget: 37,
    reviewTarget: 23,
    tags: ["brand", "strategy", "positioning"],
    modules: [
      "Brand audit",
      "STP strategy",
      "Positioning",
      "Brand voice",
      "Content direction",
      "Campaign framework",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2400 },
    prerequisiteSlugs: ["mkt-digital-nen-tang"],
  },
  {
    slug: "mkt-email-crm-automation",
    title: "Email Marketing Va CRM Automation",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "advanced",
    price: 579000,
    targetRatingAvg: 4.6,
    enrollmentTarget: 42,
    reviewTarget: 26,
    tags: ["email", "crm", "automation", "retention"],
    modules: [
      "CRM fundamentals",
      "Segmentation",
      "Automation workflow",
      "Lifecycle campaign",
      "A/B testing email",
      "Deliverability",
      "Retention metrics",
    ],
    lessonOptions: { theoryDuration: 1900, practiceDuration: 2600 },
    prerequisiteSlugs: ["mkt-digital-nen-tang", "mkt-performance-ads"],
  },
  {
    slug: "mkt-content-seo-master",
    title: "Content Marketing Va SEO Master",
    categorySlug: "marketing",
    instructorUsername: "mentor.mkt.c",
    level: "intermediate",
    price: 519000,
    targetRatingAvg: 4.5,
    enrollmentTarget: 48,
    reviewTarget: 30,
    tags: ["content", "seo", "blog", "organic"],
    modules: [
      "Keyword research",
      "Search intent",
      "Content planning",
      "On-page SEO",
      "Internal link",
      "Content distribution",
      "SEO reporting",
    ],
    lessonOptions: { theoryDuration: 1800, practiceDuration: 2500 },
    prerequisiteSlugs: ["mkt-digital-nen-tang"],
  },
  {
    slug: "design-motion-ui",
    title: "Motion Design Cho UI",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "intermediate",
    price: 489000,
    targetRatingAvg: 4.4,
    enrollmentTarget: 34,
    reviewTarget: 20,
    tags: ["motion", "ui", "animation", "interaction"],
    modules: [
      "Principles of motion",
      "UI transitions",
      "Micro interaction",
      "Prototype animation",
      "Motion system",
      "Handoff for dev",
    ],
    lessonOptions: { theoryDuration: 1700, practiceDuration: 2500 },
    prerequisiteSlugs: ["design-ui-figma"],
  },
  {
    slug: "design-design-system-pro",
    title: "Design System Tu A Den Z",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "advanced",
    price: 639000,
    targetRatingAvg: 4.7,
    enrollmentTarget: 46,
    reviewTarget: 31,
    tags: ["design-system", "ui-kit", "token", "component"],
    modules: [
      "Design token",
      "Component anatomy",
      "Variant strategy",
      "Documentation",
      "Governance",
      "Cross-team workflow",
      "Scale design system",
    ],
    lessonOptions: { theoryDuration: 2100, practiceDuration: 2900 },
    prerequisiteSlugs: ["design-ui-figma", "design-brand-visual"],
  },
  {
    slug: "design-ai-creative-workflow",
    title: "AI Creative Workflow Cho Designer",
    categorySlug: "thiet-ke",
    instructorUsername: "mentor.design.d",
    level: "beginner",
    price: 359000,
    targetRatingAvg: 4.2,
    enrollmentTarget: 39,
    reviewTarget: 22,
    tags: ["ai", "creative", "workflow", "design"],
    modules: [
      "Prompt basics",
      "Moodboard with AI",
      "Concept exploration",
      "Visual iteration",
      "Polish output",
      "Ethics va copyright",
    ],
    lessonOptions: { theoryDuration: 1600, practiceDuration: 2300 },
    prerequisiteSlugs: [],
  },
];

const buildRatings = (targetAvg, count) => {
  if (!count) return [];

  const ratings = Array(count).fill(4);
  const targetTotal = Math.round(Number(targetAvg || 4) * count);
  let diff = targetTotal - 4 * count;

  // Raise or lower individual ratings to approach target average.
  let idx = 0;
  while (diff !== 0 && idx < count * 3) {
    const i = idx % count;
    if (diff > 0 && ratings[i] < 5) {
      ratings[i] += 1;
      diff -= 1;
    } else if (diff < 0 && ratings[i] > 1) {
      ratings[i] -= 1;
      diff += 1;
    }
    idx += 1;
  }

  return ratings;
};

async function upsertUsers() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const userMap = new Map();

  for (const userSeed of userSeeds) {
    const user = await User.findOneAndUpdate(
      { username: userSeed.username },
      {
        $set: {
          email: userSeed.email,
          displayName: userSeed.displayName,
          role: userSeed.role,
          hashedPassword,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    userMap.set(userSeed.username, user);
  }

  return userMap;
}

async function upsertStudents() {
  const hashedPassword = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const students = [];

  for (const studentSeed of studentSeeds) {
    const student = await User.findOneAndUpdate(
      { username: studentSeed.username },
      {
        $set: {
          email: studentSeed.email,
          displayName: studentSeed.displayName,
          role: studentSeed.role,
          hashedPassword,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    students.push(student);
  }

  return students;
}

async function upsertCategories() {
  const categoryMap = new Map();

  for (const categorySeed of categorySeeds) {
    const category = await Category.findOneAndUpdate(
      { slug: categorySeed.slug },
      {
        $set: {
          name: categorySeed.name,
          description: categorySeed.description,
          parentId: null,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    categoryMap.set(categorySeed.slug, category);
  }

  return categoryMap;
}

async function upsertCourses(userMap, categoryMap) {
  const courseMap = new Map();

  // Pass 1: create/update base courses with empty prerequisites
  for (const seed of courseSeeds) {
    const instructor = userMap.get(seed.instructorUsername);
    const category = categoryMap.get(seed.categorySlug);
    const courseTags = Array.from(
      new Set([...(seed.tags || []), category?.name, seed.categorySlug]),
    ).filter(Boolean);
    const lessons = buildLessons(seed.modules || [], seed.lessonOptions || {});
    const totalDuration = lessons.reduce(
      (sum, lesson) => sum + (Number(lesson.duration) || 0),
      0,
    );

    const course = await Course.findOneAndUpdate(
      { slug: seed.slug },
      {
        $set: {
          instructorId: instructor._id,
          categoryId: category._id,
          title: seed.title,
          description: `${seed.title} - du lieu seed de test tinh nang goi y lo trinh hoc.`,
          introVideoUrl: YOUTUBE_LINKS[0],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
          level: seed.level,
          price: seed.price,
          status: "published",
          tags: courseTags,
          lessons,
          totalLessons: lessons.length,
          totalDuration,
          ratingAvg: 0,
          ratingCount: 0,
          totalStudents: 0,
          prerequisites: [],
          submittedAt: new Date(),
          approvedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    courseMap.set(seed.slug, course);
  }

  // Pass 2: resolve prerequisite slugs to course IDs
  for (const seed of courseSeeds) {
    const course = courseMap.get(seed.slug);
    const prerequisiteIds = (seed.prerequisiteSlugs || [])
      .map((slug) => courseMap.get(slug)?._id)
      .filter(Boolean)
      .map((id) => String(id));

    course.prerequisites = prerequisiteIds;
    await course.save();
  }

  return courseMap;
}

async function seedEnrollmentsAndReviews(courseMap, students) {
  const courseIds = Array.from(courseMap.values()).map((course) => course._id);

  await Enrollment.deleteMany({ courseId: { $in: courseIds } });
  await Review.deleteMany({ courseId: { $in: courseIds } });

  for (
    let courseIndex = 0;
    courseIndex < courseSeeds.length;
    courseIndex += 1
  ) {
    const seed = courseSeeds[courseIndex];
    const course = courseMap.get(seed.slug);
    if (!course) continue;

    const enrollmentTarget = Math.min(
      Math.max(seed.enrollmentTarget || 0, 0),
      students.length,
    );
    const reviewTarget = Math.min(
      Math.max(seed.reviewTarget || 0, 0),
      enrollmentTarget,
    );

    const startOffset = (courseIndex * 7) % students.length;
    const pickedStudents = [];
    for (let i = 0; i < enrollmentTarget; i += 1) {
      pickedStudents.push(students[(startOffset + i) % students.length]);
    }

    if (pickedStudents.length > 0) {
      const enrollmentOps = pickedStudents.map((student, i) => {
        const completed = i % 4 === 0;
        const progressPercent = completed ? 100 : 35 + (i % 50);
        const completedLessonIds = completed
          ? (course.lessons || []).slice(0, 3).map((lesson) => lesson._id)
          : [];

        return {
          updateOne: {
            filter: {
              userId: student._id,
              courseId: course._id,
            },
            update: {
              $set: {
                status: completed ? "completed" : "active",
                purchasedAt: new Date(),
                completedAt: completed ? new Date() : undefined,
                amount: Number(course.price) || 0,
                paymentMethod: "seed-mock",
                progressPercent,
                completedLessonIds,
                lastAccessedAt: new Date(),
                metadata: { source: "seed-learning-path-test-data" },
              },
            },
            upsert: true,
          },
        };
      });

      await Enrollment.bulkWrite(enrollmentOps);
    }

    const ratings = buildRatings(seed.targetRatingAvg || 4.5, reviewTarget);
    for (let i = 0; i < reviewTarget; i += 1) {
      const student = pickedStudents[i];
      await Review.create({
        userId: student._id,
        courseId: course._id,
        rating: ratings[i],
        comment: `Danh gia seed tu ${student.username} cho khoa hoc ${seed.slug}`,
      });
    }

    course.totalStudents = enrollmentTarget;
    await course.save();
  }
}

async function main() {
  if (!MONGO_URI) {
    throw new Error("Thieu MONGODB_CONNECTIONSTRING trong file .env");
  }

  await mongoose.connect(MONGO_URI);
  console.log("[seed] Connected to MongoDB");

  const userMap = await upsertUsers();
  const students = await upsertStudents();
  const categoryMap = await upsertCategories();
  const courseMap = await upsertCourses(userMap, categoryMap);
  await seedEnrollmentsAndReviews(courseMap, students);

  const courses = Array.from(courseMap.values());

  console.log("\n[seed] Hoan tat du lieu test:");
  console.log(`- Users (instructor): ${userMap.size}`);
  console.log(`- Users (student): ${students.length}`);
  console.log(`- Categories: ${categoryMap.size}`);
  console.log(`- Courses: ${courses.length}`);
  console.log(`- Password mac dinh cho 4 user: ${DEFAULT_PASSWORD}`);
  console.log(`- Password mac dinh cho hoc vien: ${STUDENT_PASSWORD}`);

  console.log("\n[seed] Danh sach user:");
  for (const userSeed of userSeeds) {
    console.log(`- ${userSeed.username} (${userSeed.email})`);
  }

  console.log("\n[seed] Danh sach khoa hoc:");
  for (const seed of courseSeeds) {
    const course = await Course.findById(courseMap.get(seed.slug)?._id).lean();
    const prereqCount = (course?.prerequisites || []).length;
    const practiceLessons = (course?.lessons || []).filter(
      (lesson) => lesson.lessonType === "practice",
    ).length;
    const totalHours = ((course?.totalDuration || 0) / 3600).toFixed(1);
    console.log(
      `- ${seed.title} | level=${seed.level} | rating=${course?.ratingAvg} (${course?.ratingCount} reviews) | enrolled=${course?.totalStudents} | hours=${totalHours}h | practiceLessons=${practiceLessons} | category=${seed.categorySlug} | instructor=${seed.instructorUsername} | prerequisites=${prereqCount} | valueScore=${course?.valueScore}`,
    );
  }
}

main()
  .then(async () => {
    await mongoose.disconnect();
    console.log("\n[seed] Done");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n[seed] Error:", error);
    try {
      await mongoose.disconnect();
    } catch {
      // noop
    }
    process.exit(1);
  });

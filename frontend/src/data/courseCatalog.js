export const COURSE_LIST = [
  {
    id: "js-fundamentals",
    title: "JavaScript Fundamentals 2026",
    category: "Lập trình",
    level: "Beginner",
    duration: "24 giờ",
    students: 12400,
    rating: 4.8,
    price: "499.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
    intro:
      "Nắm chắc JavaScript từ biến, hàm đến async/await và tư duy giải bài toán thực tế.",
    outcomes: [
      "Hiểu bản chất JS thay vì học thuộc cú pháp",
      "Tự xây được mini project thao tác DOM và API",
      "Làm chủ promise, fetch và async/await",
      "Tự tin học tiếp React hoặc Node.js",
    ],
    syllabus: [
      { title: "Nền tảng JavaScript", lessons: 12, preview: true },
      { title: "DOM và Event", lessons: 10, preview: true },
      { title: "Làm việc với API", lessons: 8, preview: false },
      { title: "Project thực chiến", lessons: 14, preview: false },
    ],
    instructor: {
      name: "Minh Nguyễn",
      role: "Senior Frontend Engineer",
      bio: "8+ năm kinh nghiệm phát triển sản phẩm web cho startup và doanh nghiệp.",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "react-practical",
    title: "React Thực Chiến: Build App Từ A-Z",
    category: "Lập trình",
    level: "Intermediate",
    duration: "32 giờ",
    students: 9800,
    rating: 4.9,
    price: "799.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1400&q=80",
    intro:
      "Xây dựng ứng dụng React hiện đại với routing, state management và API integration.",
    outcomes: [
      "Thiết kế cấu trúc project React bài bản",
      "Làm việc tốt với hooks và custom hooks",
      "Tối ưu hiệu năng UI trong dự án thật",
      "Triển khai ứng dụng lên môi trường production",
    ],
    syllabus: [
      { title: "React Core", lessons: 9, preview: true },
      { title: "State và dữ liệu", lessons: 11, preview: true },
      { title: "Auth và API", lessons: 12, preview: false },
      { title: "Deployment + tối ưu", lessons: 10, preview: false },
    ],
    instructor: {
      name: "Linh Trần",
      role: "Frontend Tech Lead",
      bio: "Chuyên xây hệ thống frontend cho sản phẩm SaaS và nền tảng giáo dục.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "uiux-system",
    title: "UI/UX Design System Cho Product Team",
    category: "Thiết kế",
    level: "Intermediate",
    duration: "18 giờ",
    students: 4100,
    rating: 4.7,
    price: "699.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1400&q=80",
    intro:
      "Thiết kế design system nhất quán để product team tăng tốc phát triển tính năng.",
    outcomes: [
      "Thiết lập token màu, typography, spacing",
      "Chuẩn hóa component library trong Figma",
      "Gắn kết design và frontend workflow",
      "Giảm lỗi UI khi mở rộng sản phẩm",
    ],
    syllabus: [
      { title: "Nền tảng Design System", lessons: 8, preview: true },
      { title: "Component và Variants", lessons: 10, preview: true },
      { title: "Handoff cho dev", lessons: 6, preview: false },
      { title: "Audit và mở rộng", lessons: 7, preview: false },
    ],
    instructor: {
      name: "An Phạm",
      role: "Product Designer",
      bio: "Tham gia xây dựng design system cho nhiều sản phẩm B2B và fintech.",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "figma-masterclass",
    title: "Figma Masterclass Từ Cơ Bản Đến Nâng Cao",
    category: "Thiết kế",
    level: "Beginner",
    duration: "20 giờ",
    students: 7300,
    rating: 4.8,
    price: "559.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80",
    intro:
      "Làm chủ Figma để thiết kế nhanh hơn, đẹp hơn và dễ cộng tác với team.",
    outcomes: [
      "Làm chủ Auto Layout và Component",
      "Xây prototype mượt và có logic",
      "Tổ chức file thiết kế chuyên nghiệp",
      "Tối ưu handoff cho developer",
    ],
    syllabus: [
      { title: "Figma cơ bản", lessons: 10, preview: true },
      { title: "Component nâng cao", lessons: 9, preview: true },
      { title: "Prototype và interaction", lessons: 8, preview: false },
      { title: "Case study thực tế", lessons: 11, preview: false },
    ],
    instructor: {
      name: "Hà Lê",
      role: "Lead UI Designer",
      bio: "Đào tạo hơn 5.000 học viên thiết kế UI cho web và mobile.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "performance-marketing",
    title: "Performance Marketing 2026",
    category: "Marketing",
    level: "Advanced",
    duration: "27 giờ",
    students: 3600,
    rating: 4.6,
    price: "899.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    intro: "Thiết kế hệ thống quảng cáo hiệu suất từ tracking đến tối ưu ROAS.",
    outcomes: [
      "Lập chiến lược kênh quảng cáo đa nền tảng",
      "Đọc số liệu và ra quyết định tối ưu nhanh",
      "Thiết kế funnel tăng chuyển đổi",
      "Scale chiến dịch có kiểm soát ngân sách",
    ],
    syllabus: [
      { title: "Nền tảng Performance", lessons: 9, preview: true },
      { title: "Tracking và Attribution", lessons: 7, preview: true },
      { title: "Creative testing", lessons: 6, preview: false },
      { title: "Scale và automation", lessons: 9, preview: false },
    ],
    instructor: {
      name: "Khoa Võ",
      role: "Growth Marketing Manager",
      bio: "Tư vấn tăng trưởng cho startup ecommerce và edtech tại Đông Nam Á.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "content-creator",
    title: "Content Creator Blueprint",
    category: "Marketing",
    level: "Beginner",
    duration: "14 giờ",
    students: 5400,
    rating: 4.7,
    price: "459.000đ",
    thumbnail:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1400&q=80",
    intro:
      "Tạo nội dung có chiến lược để xây thương hiệu cá nhân và tăng chuyển đổi.",
    outcomes: [
      "Xây content pillar theo từng mục tiêu",
      "Viết content thu hút và dễ chia sẻ",
      "Lập lịch sản xuất nội dung bền vững",
      "Đo hiệu quả nội dung theo KPI rõ ràng",
    ],
    syllabus: [
      { title: "Chiến lược nội dung", lessons: 7, preview: true },
      { title: "Viết và kể chuyện", lessons: 8, preview: true },
      { title: "Phân phối đa kênh", lessons: 6, preview: false },
      { title: "Đo lường và cải tiến", lessons: 5, preview: false },
    ],
    instructor: {
      name: "Vy Đỗ",
      role: "Content Lead",
      bio: "Phát triển hệ nội dung cho cộng đồng creator và doanh nghiệp SME.",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    },
  },
];

export const findCourseById = (courseId) =>
  COURSE_LIST.find((course) => course.id === courseId);

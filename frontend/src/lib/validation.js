import { z } from "zod";
import { FORM_MESSAGES } from "./constants";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, FORM_MESSAGES.USERNAME_REQUIRED)
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(6, FORM_MESSAGES.PASSWORD_MIN)
    .min(1, FORM_MESSAGES.PASSWORD_REQUIRED),
  role: z.enum(["student", "instructor"], {
    errorMap: () => ({ message: "Vui lòng chọn vai trò" }),
  }),
});

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(1, FORM_MESSAGES.USERNAME_REQUIRED)
      .min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
    email: z
      .string()
      .email(FORM_MESSAGES.EMAIL_INVALID)
      .min(1, FORM_MESSAGES.EMAIL_REQUIRED),
    displayName: z.string().min(1, FORM_MESSAGES.DISPLAY_NAME_REQUIRED),
    password: z
      .string()
      .min(6, FORM_MESSAGES.PASSWORD_MIN)
      .min(1, FORM_MESSAGES.PASSWORD_REQUIRED),
    role: z.enum(["student", "instructor"], {
      errorMap: () => ({ message: "Vui lòng chọn vai trò" }),
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  displayName: z.string().min(1, FORM_MESSAGES.DISPLAY_NAME_REQUIRED),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      FORM_MESSAGES.PHONE_INVALID,
    ),
  bio: z.string().max(500, FORM_MESSAGES.BIO_MAX).optional(),
});

export const phoneSchema = z
  .string()
  .refine((val) => /^[0-9]{10,11}$/.test(val), FORM_MESSAGES.PHONE_INVALID)
  .optional()
  .or(z.literal(""));

export const emailSchema = z
  .string()
  .email(FORM_MESSAGES.EMAIL_INVALID)
  .min(1, FORM_MESSAGES.EMAIL_REQUIRED);

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Nhập mật khẩu hiện tại")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    newPassword: z
      .string()
      .min(1, "Nhập mật khẩu mới")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới không khớp",
    path: ["confirmPassword"],
  });

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Email không hợp lệ").min(1, "Nhập email mới"),
  password: z
    .string()
    .min(1, "Nhập mật khẩu để xác nhận")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const changeUsernameSchema = z.object({
  newUsername: z
    .string()
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .max(30, "Tên người dùng tối đa 30 ký tự")
    .regex(
      /^[a-zA-Z0-9_.-]{3,30}$/,
      "Tên người dùng chỉ bao gồm chữ hoa/thường, số, dấu gạch dưới, dấu chấm, dấu gạch ngang",
    ),
  password: z
    .string()
    .min(1, "Nhập mật khẩu để xác nhận")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

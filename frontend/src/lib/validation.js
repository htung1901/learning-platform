import { z } from "zod";
import { FORM_MESSAGES } from "./constants";

export const loginSchema = z.object({
  email: z
    .string()
    .email(FORM_MESSAGES.EMAIL_INVALID)
    .min(1, FORM_MESSAGES.EMAIL_REQUIRED),
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

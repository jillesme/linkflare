import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { env } from "cloudflare:workers";

import { auth } from "@/lib/auth";
import { isReservedUsername } from "@/lib/reserved-usernames";

export const getCurrentSession = createServerFn().handler(async () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Only letters, numbers, underscores, and dots allowed"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  captchaToken: z.string().min(1, "Captcha verification required"),
});

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signUpSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Verify Turnstile
    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", data.captchaToken);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData }
    );
    const result = (await response.json()) as { success: boolean };

    if (!result.success) {
      throw new Error("Captcha verification failed");
    }

    // 2. Check reserved username
    if (isReservedUsername(data.username)) {
      throw new Error("This username is not available");
    }

    // 3. Sign up via BetterAuth
    // tanstackStartCookies plugin handles session cookie automatically
    try {
      return await auth.api.signUpEmail({
        body: {
          email: data.email,
          name: data.name,
          password: data.password,
          username: data.username.toLowerCase(),
          displayUsername: data.username,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle BetterAuth errors (e.g., email already exists)
        throw new Error(error.message);
      }
      throw new Error("Sign up failed. Please try again.");
    }
  });

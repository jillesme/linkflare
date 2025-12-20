import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, captcha } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { env } from "cloudflare:workers";

import { db } from "@/db";
import { isReservedUsername } from "./reserved-usernames";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
    },
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
    }),
    username({
      usernameValidator: (username) => {
        if (isReservedUsername(username)) {
          return false;
        }
        // Allow only alphanumeric characters, underscores, and dots
        return /^[a-zA-Z0-9_.]+$/.test(username);
      },
    }),
    tanstackStartCookies(),
  ],
});


export type Session = typeof auth.$Infer.Session;

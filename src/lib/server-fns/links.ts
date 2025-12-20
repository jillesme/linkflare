import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { z } from "zod";

import { ensureSessionMiddleware, rateLimitByUserMiddleware, createPublicRateLimitMiddleware } from "@/middleware/authentication";
import * as linkRepository from "@/db/repositories/link";
import * as userRepository from "@/db/repositories/user";

// Validation schemas
const urlSchema = z.string().max(2048).refine(
  (val) => {
    try {
      const url = new URL(val);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  },
  { error: "Invalid URL" }
);

const linkIdSchema = z.string().min(1).max(21);
const usernameSchema = z.string().min(1).max(50);

const createLinkSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }).max(200, { error: "Title too long" }),
  url: urlSchema,
  isActive: z.boolean().optional(),
});

const updateLinkSchema = z.object({
  linkId: linkIdSchema,
  title: z.string().min(1).max(200).optional(),
  url: urlSchema.optional(),
  isActive: z.boolean().optional(),
});

const reorderLinkSchema = z.object({
  linkId: linkIdSchema,
  direction: z.enum(["up", "down"]),
});

// Get all links for the authenticated user (dashboard)
export const getUserLinks = createServerFn()
  .middleware([ensureSessionMiddleware])
  .handler(async ({ context }) => {
    try {
      return await linkRepository.listByUserId(context.session.user.id);
    } catch (error) {
      console.error("Failed to get user links:", error);
      throw new Error("Failed to load links. Please try again.");
    }
  });

// Get public profile by username
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => usernameSchema.parse(data))
  .handler(async ({ data: username }) => {
    try {
      return await userRepository.getPublicProfileWithLinks(username);
    } catch (error) {
      console.error("Failed to get public profile:", error);
      throw new Error("Failed to load profile. Please try again.");
    }
  });

// Create a new link
export const createLink = createServerFn({ method: "POST" })
  .middleware([ensureSessionMiddleware, rateLimitByUserMiddleware])
  .inputValidator((data: unknown) => createLinkSchema.parse(data))
  .handler(async ({ context, data }) => {
    try {
      const maxPosition = await linkRepository.getMaxPosition(context.session.user.id);
      const nextPosition = maxPosition + 1;

      return await linkRepository.insertLink({
        id: nanoid(),
        userId: context.session.user.id,
        title: data.title,
        url: data.url,
        position: nextPosition,
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      console.error("Failed to create link:", error);
      throw new Error("Failed to create link. Please try again.");
    }
  });

// Update a link
export const updateLink = createServerFn({ method: "POST" })
  .middleware([ensureSessionMiddleware])
  .inputValidator((data: unknown) => updateLinkSchema.parse(data))
  .handler(async ({ context, data }) => {
    try {
      const existingLink = await linkRepository.findByUserAndId(
        context.session.user.id,
        data.linkId
      );

      if (!existingLink) {
        throw new Error("Link not found");
      }

      const updateData: Partial<{
        title: string;
        url: string;
        isActive: boolean;
      }> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      if (Object.keys(updateData).length === 0) {
        return existingLink;
      }

      return await linkRepository.updateLinkById(data.linkId, updateData);
    } catch (error) {
      if (error instanceof Error && error.message === "Link not found") {
        throw error;
      }
      console.error("Failed to update link:", error);
      throw new Error("Failed to update link. Please try again.");
    }
  });

// Delete a link and reorder remaining links
export const deleteLink = createServerFn({ method: "POST" })
  .middleware([ensureSessionMiddleware])
  .inputValidator((data: unknown) => linkIdSchema.parse(data))
  .handler(async ({ context, data: linkId }) => {
    try {
      const existingLink = await linkRepository.findByUserAndId(
        context.session.user.id,
        linkId
      );

      if (!existingLink) {
        throw new Error("Link not found");
      }

      await linkRepository.deleteAndShiftPositions(
        linkId,
        context.session.user.id,
        existingLink.position
      );

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message === "Link not found") {
        throw error;
      }
      console.error("Failed to delete link:", error);
      throw new Error("Failed to delete link. Please try again.");
    }
  });

// Reorder a link (move up or down)
export const reorderLink = createServerFn({ method: "POST" })
  .middleware([ensureSessionMiddleware])
  .inputValidator((data: unknown) => reorderLinkSchema.parse(data))
  .handler(async ({ context, data }) => {
    try {
      const linkToMove = await linkRepository.findByUserAndId(
        context.session.user.id,
        data.linkId
      );

      if (!linkToMove) {
        throw new Error("Link not found");
      }

      const currentPosition = linkToMove.position;
      const newPosition =
        data.direction === "up" ? currentPosition - 1 : currentPosition + 1;

      if (newPosition < 0) {
        return { success: false, message: "Already at top" };
      }

      const targetLink = await linkRepository.findByUserAndPosition(
        context.session.user.id,
        newPosition
      );

      if (!targetLink) {
        return { success: false, message: "Already at bottom" };
      }

      await linkRepository.swapPositions(
        targetLink.id,
        newPosition,
        data.linkId,
        currentPosition
      );

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message === "Link not found") {
        throw error;
      }
      console.error("Failed to reorder link:", error);
      throw new Error("Failed to reorder link. Please try again.");
    }
  });

// Record a click (for public profile)
// Rate limited by IP + linkId to prevent click fraud on specific links
export const recordClick = createServerFn({ method: "POST" })
  .middleware([createPublicRateLimitMiddleware()])
  .inputValidator((data: unknown) => linkIdSchema.parse(data))
  .handler(async ({ data: linkId }) => {
    try {
      const link = await linkRepository.findPublicById(linkId);

      if (!link || !link.isActive) {
        return { success: false };
      }

      const today = new Date().toISOString().split("T")[0];

      await linkRepository.recordClick(linkId, today);

      return { success: true };
    } catch (error) {
      console.error("Failed to record click:", error);
      // Don't throw for click tracking - fail silently
      return { success: false };
    }
  });

// Get link by ID (for edit page - requires auth and ownership)
export const getLinkById = createServerFn({ method: "GET" })
  .middleware([ensureSessionMiddleware])
  .inputValidator((data: unknown) => linkIdSchema.parse(data))
  .handler(async ({ context, data: linkId }) => {
    try {
      const result = await linkRepository.findByUserAndId(
        context.session.user.id,
        linkId
      );

      if (!result) {
        throw new Error("Link not found");
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "Link not found") {
        throw error;
      }
      console.error("Failed to get link by ID:", error);
      throw new Error("Failed to load link. Please try again.");
    }
  });

// Get link by ID for public redirect (no auth required)
export const getPublicLinkById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => linkIdSchema.parse(data))
  .handler(async ({ data: linkId }) => {
    try {
      const result = await linkRepository.findPublicById(linkId);

      if (!result || !result.isActive) {
        return null;
      }

      return result;
    } catch (error) {
      console.error("Failed to get public link:", error);
      return null;
    }
  });

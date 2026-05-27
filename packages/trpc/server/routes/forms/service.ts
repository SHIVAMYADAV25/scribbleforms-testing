// packages/trpc/server/routes/forms/service.ts
import { FormRepository } from "./repository";
import type { CreateFormInput, UpdateFormInput } from "./schema";
import { domainError } from "../../errors";
import { verifyFormPassword } from "./repository";
import db from "@repo/database";

import {
  formVersionsTable,
} from "@repo/database/schema";

import { eq } from "drizzle-orm";

export class FormService {
  constructor(private repository: FormRepository) {}

  async listForUser(userId: string, opts: { cursor?: string; limit: number; status?: string; search?: string }) {
    return this.repository.listForUser(userId, opts);
  }

  async countForUser(userId: string) {
    return this.repository.countForUser(userId);
  }

  async getByIdForUser(id: string, userId: string) {
    return this.repository.findByIdWithFields(id, userId);
  }

  async getPublicBySlug(slug: string, password?: string) {
    const form = await this.repository.findBySlug(slug);
    if (!form) return null;
    if (form.status !== "published") return null;
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) return null;

    // Password check — uses bcrypt comparison (timing-safe)
    if (form.passwordHash) {
      if (!password) return { requiresPassword: true };
      const valid = verifyFormPassword(password, form.passwordHash);
      if (!valid) return null;
    }

    // Get fields from current version snapshot
    let fields: unknown[] = [];
    if (form.currentVersionId) {
      const [ver] = await db
        .select()
        .from(formVersionsTable)
        .where(eq(formVersionsTable.id, form.currentVersionId))
        .limit(1);
      fields = (ver?.fieldsJson as unknown[]) ?? [];
    }

    return {
      ...this.repository.toOutput(form),
      fields,
      currentVersionId: form.currentVersionId,
    };
  }

  async create(userId: string, input: CreateFormInput) {
    return this.repository.create(userId, input);
  }

  async update(id: string, input: UpdateFormInput) {
    return this.repository.update(id, input);
  }

  async assertOwnership(formId: string, userId: string) {
    const form = await this.repository.findByOwner(formId, userId);
    if (!form) {
      throw domainError("FORM_NOT_FOUND", "Form not found or you don't have access", "NOT_FOUND");
    }
    return form;
  }

  async publish(id: string, userId: string) {
    // Verify has fields
    const form = await this.repository.findByIdWithFields(id, userId);
    if (!form || !form.fields || form.fields.length === 0) {
      throw domainError("FORM_EMPTY", "Cannot publish a form with no fields", "BAD_REQUEST");
    }
    return this.repository.publish(id, userId);
  }

  async unpublish(id: string) {
    return this.repository.unpublish(id);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }

  async duplicate(id: string, userId: string) {
    const result = await this.repository.duplicate(id, userId);
    if (!result) throw domainError("FORM_NOT_FOUND", "Form not found", "NOT_FOUND");
    return result;
  }

  async getPublicExplore(opts: { cursor?: string; limit: number; category?: string }) {
    return this.repository.getPublicExplore(opts);
  }
}

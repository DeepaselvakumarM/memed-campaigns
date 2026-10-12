import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

/**
 * Shared schema builders. Every message names the field by its UI label and follows the
 * standard shapes: "<Label> is required." / "<Label> must be between <min> and <max>." /
 * "<Label> must be <shape>, e.g. <example>."
 */

const isMissing = (input: unknown): boolean => input === undefined || input === null || input === '';

export const formatNumber = (value: number): string => value.toLocaleString('en-IN');

export function requiredText(label: string, { min = 1, max = 200 } = {}) {
  return z
    .string({ error: (issue) => (isMissing(issue.input) ? `${label} is required.` : `${label} must be text.`) })
    .trim()
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({ code: 'custom', message: `${label} is required.` });
      } else if (value.length < min || value.length > max) {
        ctx.addIssue({ code: 'custom', message: `${label} must be between ${min} and ${max} characters.` });
      }
    });
}

/**
 * A whole number in [min, max]. Zero counts as "missing" unless `allowZero` is set,
 * because for fields like a budget, 0 means nothing was entered.
 */
export function wholeNumber(label: string, { min, max, allowZero = false }: { min: number; max: number; allowZero?: boolean }) {
  return z
    .number({ error: (issue) => (isMissing(issue.input) ? `${label} is required.` : `${label} must be a number.`) })
    .superRefine((value, ctx) => {
      if (value === 0 && !allowZero) {
        ctx.addIssue({ code: 'custom', message: `${label} is required.` });
      } else if (!Number.isInteger(value)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a whole number.` });
      } else if (value < min || value > max) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} must be between ${formatNumber(min)} and ${formatNumber(max)}.`,
        });
      }
    });
}

/** For values chosen from a list in the UI (never typed), so the message points at reselecting. */
export function pickedOption<const T extends readonly [string, ...string[]]>(label: string, options: T) {
  return z.enum(options, {
    error: (issue) =>
      isMissing(issue.input) ? `${label} is required.` : `${label} is not a recognized option. Please select it again.`,
  });
}

/** An id of a record the user picked in the UI (e.g. a campaign card), never typed by hand. */
export function pickedId(label: string) {
  return z
    .string({ error: () => `${label} is required.` })
    .refine((value) => value.length > 0, `${label} is required.`)
    .refine((value) => value.length === 0 || isValidObjectId(value), `${label} is not recognized. Please select it again.`);
}

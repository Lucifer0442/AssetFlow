import { z } from 'zod';

export const customFieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required').max(100),
  fieldType: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  isRequired: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  displayOrder: z.number().int().default(0),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(2, 'Code must be at least 2 chars').max(20).toUpperCase(),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid('Invalid parent category ID').optional(),
  isActive: z.boolean().default(true),
  customFields: z.array(customFieldSchema).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid('Invalid parent category ID').nullable().optional(),
  isActive: z.boolean().optional(),
});

export const addCustomFieldSchema = customFieldSchema;

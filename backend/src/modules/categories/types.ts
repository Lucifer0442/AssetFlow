export interface CustomFieldInput {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select';
  isRequired?: boolean;
  options?: string[]; // parsed to JSON array
  displayOrder?: number;
}

export interface CreateCategoryInput {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
  customFields?: CustomFieldInput[];
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parentCategoryId?: string;
  isActive?: boolean;
}

export interface CreateLocationInput {
  name: string;
  code: string;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  isActive?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  isActive?: boolean;
}

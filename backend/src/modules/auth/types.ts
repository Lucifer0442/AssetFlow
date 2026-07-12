export interface RegisterUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

import { ValidationError } from '@packages/error-middleware/error-classes';

export class AuthValidation {
  private static isEmailValid = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  public static validateRegisterData = (
    data: any,
    userType: 'SELLER' | 'USER'
  ) => {
    const { name, email, password, phoneNumber, country } = data;

    if (
      !name ||
      !email ||
      !password ||
      (userType == 'SELLER' && (!phoneNumber || !country))
    ) {
      throw new ValidationError(`Missing or invalid value for field`);
    }

    if (!this.isEmailValid(email)) {
      throw new ValidationError('Invalid email format.');
    }
  };
}

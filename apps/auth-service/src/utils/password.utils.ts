import argon2 from 'argon2';

class PassowrdUtils {
  public static hashPassword = async (password: string): Promise<string> => {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  };

  public static verifyPassword = async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    return await argon2.verify(hashedPassword, password);
  };
}

export default PassowrdUtils;

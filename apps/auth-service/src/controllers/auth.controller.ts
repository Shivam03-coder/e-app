import { Request, Response } from 'express';
import { AuthValidation } from '../validations/auth.validation';
import { ApiResponse, AsyncHandler } from '@packages/utils/api.utils';
import { ValidationError } from '@packages/error-middleware/error-classes';
import { db } from '@packages/database';
import OtpUtils from '../utils/otp.utils';
import PassowrdUtils from '../utils/password.utils';

export class AuthController {
  public static userRegistration = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      AuthValidation.validateRegisterData(req.body, 'USER');
      const { name, email } = req.body;
      const existingUser = await db.users.findUnique({
        where: { email: email },
      });

      if (existingUser)
        throw new ValidationError('User already exists with this email!');

      await OtpUtils.checkOtpRestriction(email);
      await OtpUtils.trackOtpRequest(email);
      await OtpUtils.sendOtp(name, email);

      res.json(
        new ApiResponse('Otp sent successfully. Please verify your account.')
      );
    }
  );

  public static verifyUserWithOtp = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, otp, password } = req.body;
      const existingUser = await db.users.findUnique({
        where: { email },
      });

      if (existingUser)
        throw new ValidationError('User already exists with this email!');

      await OtpUtils.verifyOtp(email, otp);
      const hashedPassword = await PassowrdUtils.hashPassword(password);
      const user = await db.users.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
      res.json(new ApiResponse('Account created succesfully', user));
    }
  );
}

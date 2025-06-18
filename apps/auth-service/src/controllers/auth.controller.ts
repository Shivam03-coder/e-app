import { Request, Response } from 'express';
import { ApiResponse, AsyncHandler } from 'packages/utils/api.utils';
import { AuthValidation } from '../validations/auth.validation';
import { db } from 'packages/database';
import { ValidationError } from 'packages/error-middleware/error-classes';
import AuthServices from '../services/auth.service';

export class AuthController {
  public static userRegistration = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      AuthValidation.validateRegisterData(req.body, 'USER');
      const { name, email } = req.body;
      const existingUser = await db.users.findUnique({
        where: {
          email,
        },
      });

      if (existingUser)
        throw new ValidationError('User already exists with this email!');

      await AuthServices.checkOtpRestriction(email);
      await AuthServices.trackOtpRequest(email);
      await AuthServices.sendOtp(name, email);

      res.json(
        new ApiResponse('Otp sent successfully. Please verify your account.')
      );
    }
  );
}

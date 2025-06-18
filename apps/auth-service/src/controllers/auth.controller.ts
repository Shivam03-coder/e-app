import { Request, Response } from 'express';
import { AuthValidation } from '../validations/auth.validation';
import { ApiResponse, AsyncHandler } from '@packages/utils/api.utils';
import {
  AuthError,
  ValidationError,
} from '@packages/error-middleware/error-classes';
import { db } from '@packages/database';
import OtpUtils from '../utils/otp.utils';
import PasswordUtils from '../utils/password.utils';
import TokenUtils from '../utils/token.utils';
import CookiesUtils from '../utils/cookie.utils';

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
      const hashedPassword = await PasswordUtils.hashPassword(password);
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

  public static loginUser = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required to log in.');
      }

      const existingUser = await db.users.findUnique({
        where: { email },
      });

      if (!existingUser) {
        throw new AuthError('No user found with the provided email address.');
      }

      const isPasswordMatching = await PasswordUtils.verifyPassword(
        password,
        existingUser.password
      );

      if (!isPasswordMatching) {
        throw new AuthError('Incorrect password. Please try again.');
      }

      const { accessToken, refreshToken } = TokenUtils.generateTokens({
        id: existingUser.id,
        role: 'user',
      });

      CookiesUtils.setCookies(res, {
        accessToken: {
          value: accessToken,
          days: 1,
        },
        refreshToken: {
          value: refreshToken,
          days: 7,
        },
      });

      res.status(200).json(
        new ApiResponse('Login successful. Welcome back!', {
          userId: existingUser.id,
          email: existingUser.email,
        })
      );
    }
  );

  public static refreshToken = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AuthError('Refresh token is missing. Please log in again.');
      }

      await TokenUtils.decodeToken(res, refreshToken);

      res
        .status(200)
        .json(new ApiResponse('Access token refreshed successfully.'));
    }
  );

  public static userInfo = AsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user;

      if (!user) {
        throw new AuthError('Unauthorized access. User info not found.');
      }

      res.status(200).json(
        new ApiResponse('User information fetched successfully', {
          id: user.id,
          role: user.role,
        })
      );
    }
  );
}

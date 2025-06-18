import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@packages/middleware/require-auth';

const authRouter: ExpressRouter = Router();

authRouter
  .post('/user-register', AuthController.userRegistration)
  .post('/verify-user', AuthController.verifyUserWithOtp)
  .post('/user-login', AuthController.loginUser)
  .post('/user-refresh-token', AuthController.refreshToken)
  .get('/user-info', AuthController.userInfo)

export default authRouter;
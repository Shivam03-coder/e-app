import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import type { Router as ExpressRouter } from 'express';

const authRouter: ExpressRouter = Router();

authRouter.post('/user-register', AuthController.userRegistration);

export default authRouter;

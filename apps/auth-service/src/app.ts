import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import authRouter from './routes/auth.routes';
import { errorMiddleware } from '@packages/error-middleware/error-middleware';

interface AppOptions {
  port?: number;
  serveSwagger?: boolean;
}

class App {
  private readonly app: Application;
  private server?: Server;
  private readonly port: number;

  constructor(options?: AppOptions) {
    this.app = express();
    this.port = options?.port || 4000;
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
    this.app.use(cookieParser());
    this.app.use(errorMiddleware);
    this.app.use('/api/auth', authRouter);
  }

  private initializeRoutes(): void {
    this.app.get('/', (_req: Request, res: Response) => {
      res.send('🌐 Auth Service Running...');
    });

    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'healthy' });
    });
  }

  public async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`
🚀 Auth Service launched successfully!
📚 Swagger Docs available at: http://localhost:${this.port}/api-docs
      `);
        resolve();
      });
    });
  }

  public getAppInstance(): Application {
    return this.app;
  }

  public getServerInstance(): Server | undefined {
    return this.server;
  }
}

export default App;

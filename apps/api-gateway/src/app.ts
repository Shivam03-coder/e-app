import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import proxy from 'express-http-proxy';
import { rateLimit } from 'express-rate-limit';

interface AppOptions {
  port?: number;
  serveSwagger?: boolean;
}

class App {
  private readonly app: Application;
  private server?: Server;
  private readonly port: number;
  private limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: any) => (req.user ? 1000 : 100),
    message: { error: 'Too many requests, please try again later.' },
    legacyHeaders: true,
    standardHeaders: true,
    keyGenerator: (req: any) => req.ip,
  });

  constructor(options?: AppOptions) {
    this.app = express();
    this.port = options?.port || 3530;
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    this.app.use(morgan('common'));
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
    this.app.use(cookieParser());
    this.app.enable('trust proxy');
    this.app.use(this.limiter);
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
      });
    });
    this.app.use('/', proxy('http://localhost:4000'));
  }

  public async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`
🚀 Api gateway launched successfully!
🔗 Local: http://localhost:${this.port}
Health Check: http://localhost:${this.port}/health
        `);
        resolve();
      });
    });
  }

  public async close(): Promise<void> {
    try {
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server?.close((err) => {
            if (err) reject(err);
            console.log('🛑 Express server closed');
            resolve();
          });
        });
      }
      console.log('🛑 Database connection closed');
    } catch (error) {
      console.error('Error during shutdown:', error);
      throw error;
    }
  }

  public getAppInstance(): Application {
    return this.app;
  }

  public getServerInstance(): Server | undefined {
    return this.server;
  }
}

export default App;

import Redis from 'ioredis';

class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;

  private constructor() {}

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private initializeClient(): void {
    if (!this.client) {
      this.client = new Redis(process.env.REDIS_URL as string);

      this.client.on('connect', () => {
        console.log('Redis connected');
      });

      this.client.on('error', (err) => {
        console.error('Redis error:', err);
      });
    }
  }

  public getClient(): Redis {
    this.initializeClient();
    return this.client!;
  }

  public async set(
    key: string,
    value: string | number,
    expiryInSec?: number
  ): Promise<'OK'> {
    this.initializeClient();
    if (expiryInSec) {
      return this.client!.set(key, value, 'EX', expiryInSec);
    }
    return this.client!.set(key, value);
  }

  public async get(key: string): Promise<string | null> {
    this.initializeClient();
    return this.client!.get(key);
  }

  public async del(key: string): Promise<number> {
    this.initializeClient();
    return this.client!.del(key);
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}

const redisClient = RedisService.getInstance();
export default redisClient;

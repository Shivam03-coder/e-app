import Redis from 'ioredis';

class RedisService {
  private client: Redis;
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async set(
    key: string,
    value: string | number,
    expiryInSec?: number
  ): Promise<'OK'> {
    if (expiryInSec) {
      return this.client.set(key, value, 'EX', expiryInSec);
    }
    return this.client.set(key, value);
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}

const redisService = new RedisService();
export default redisService;

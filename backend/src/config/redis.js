// src/config/redis.js
import { createClient } from 'redis';

// Create simple Redis client instead of cluster
const redisUrl = process.env.REDIS_URI ;  // Defaults to local; override with env var in Docker/CI/CD
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

await redisClient.connect();

export default redisClient;





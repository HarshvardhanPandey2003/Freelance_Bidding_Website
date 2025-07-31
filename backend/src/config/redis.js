//src/condig/redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

export default redisClient;

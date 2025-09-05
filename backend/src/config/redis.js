//src/condig/redis.js
// src/config/redis.js (IMPROVED VERSION)
// src/config/redis.js
import { createClient } from 'redis';

// Create simple Redis client instead of cluster
const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';  // Defaults to local; override with env var in Docker/CI/CD
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

await redisClient.connect();

export default redisClient;






// import { createCluster, createClient } from 'redis';

// // Better detection: use NODE_ENV instead of URL parsing
// const isCluster = process.env.NODE_ENV === 'prod';

// const redisClient = isCluster 
//   ? createCluster({
//       rootNodes: [{
//         url: process.env.REDIS_URI || 'redis://redis-cluster-0.redis-cluster:6379'
//       }]
//     })
//   : createClient({
//       url: process.env.REDIS_URI || 'redis://localhost:6379'
//     });

// redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// (async () => {
//   await redisClient.connect();
//   console.log(`Connected to Redis in ${isCluster ? 'CLUSTER' : 'SINGLE'} mode`);
// })();

// export default redisClient;

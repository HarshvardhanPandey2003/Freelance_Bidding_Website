// src/config/redis.js
import { createClient } from 'redis';

// 1. Check for Kubernetes injected Service IP (Bypasses Alpine DNS bugs!)
const k8sHost = process.env.REDIS_SERVICE_SERVICE_HOST;
const k8sPort = process.env.REDIS_SERVICE_SERVICE_PORT;

// 2. Construct URL: Prefer K8s native IP -> fallback to ConfigMap -> fallback to localhost
const redisUrl = (k8sHost && k8sPort) 
    ? `redis://${k8sHost}:${k8sPort}` 
    : (process.env.REDIS_URI || 'redis://localhost:6379');

const redisClient = createClient({ 
    url: redisUrl,
    socket: {
        family: 4 // CRITICAL: Forces Node.js to use IPv4 instead of IPv6
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis dynamically at:', redisUrl));

await redisClient.connect();

export default redisClient;
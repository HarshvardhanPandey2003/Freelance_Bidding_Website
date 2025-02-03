import redisClient from '../config/redis.js';

export const cacheProjects = async (req, res, next) => {
  // Create unique cache key based on query parameters
  const cacheKey = `projects:open:${JSON.stringify(req.query)}`;
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Override res.json to cache before sending response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redisClient.setEx(cacheKey, 300, JSON.stringify(body)); // Cache for 5 minutes
      originalJson(body);
    };
    
    next();
  } catch (error) {
    console.error('Caching failed:', error);
    next();
  }
};


















// export const cacheProjects = async (req, res, next) => {
//     const cacheKey = `projects:open:${JSON.stringify(req.query)}`;
    
//     try {
//       const cachedData = await redisClient.get(cacheKey);
//       if (cachedData) {
//         console.log('Cache HIT for key:', cacheKey); // Log cache hit
//         return res.json(JSON.parse(cachedData));
//       }
      
//       console.log('Cache MISS for key:', cacheKey); // Log cache miss
//       const originalJson = res.json.bind(res);
//       res.json = (body) => {
//         redisClient.setEx(cacheKey, 300, JSON.stringify(body));
//         console.log('Data cached for key:', cacheKey); // Log cache set
//         originalJson(body);
//       };
      
//       next();
//     } catch (error) {
//       console.error('Caching failed:', error);
//       next();
//     }
//   };
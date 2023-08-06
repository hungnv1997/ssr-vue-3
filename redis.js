const Redis = require('ioredis')
const redisClient = new Redis({
  // host: 'redis', // Use the Redis container name
  url: 'redis://redis:6379',
  legacyMode: true,
});

module.exports = redisClient;
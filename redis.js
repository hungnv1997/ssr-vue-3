const Redis = require('ioredis')
const redisClient = new Redis({
  host: 'redis', // Use the Redis container name
});

module.exports = redisClient;
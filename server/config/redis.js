import Redis from "ioredis";

export const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,

  maxRetriesPerRequest: null, // prevents crash
  retryStrategy(times) {
    if (times > 5) {
      return null; // stop retrying after 5 attempts
    }
    return Math.min(times * 200, 1000);
  }
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

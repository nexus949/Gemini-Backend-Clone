import { Redis } from '@upstash/redis';
import { config } from '../../../config/config.js';

const redis = new Redis({
    url: config.UPSTASH_URL_HTTP,
    token: config.UPSTASH_URL_TOKEN
});

const DAILY_LIMIT = 5;

export async function rateLimiter(user){

    if(user.subscriptionTier === "Pro") {
        console.log("This ran")
        return true;
    }
    const key = `rate_limit:${ user.id }`;
    let count = await redis.get(key);
    count = parseInt(count || '0');

    if (count >= DAILY_LIMIT && user.subscriptionTier === "Basic"){
        return false;
    }

    await redis.incr(key);
    await redis.expire(key, 86400); // 1 day TTL
    return true;
}


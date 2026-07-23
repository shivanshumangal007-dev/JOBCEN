# pyrefly: ignore [missing-import]
import time
import uuid
from fastapi import HTTPException, Request, status
from app.core.config import settings
import redis.asyncio as aioredis
from jwt import decode, PyJWTError

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


def _get_client_ip(request: Request) -> str:
    """Extract the real client IP, respecting proxy headers."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can be a comma-separated list; the first is the real client
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    return request.client.host


class RedisLimiter:

    def __init__(self, times: int, seconds: int, group: str = None):
        self.times = times
        self.seconds = seconds
        self.group = group

    async def __call__(self, request: Request):
        identifier = _get_client_ip(request)

        # If the request carries a valid access token, rate-limit by user ID instead
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                user_id = payload.get("sub")
                if user_id:
                    identifier = str(user_id)
            except PyJWTError:
                pass

        key = f"rate_limit:{self.group}:{identifier}"
        now = time.time()

        # Use a unique member per request so same-second hits aren't collapsed
        member = f"{now}:{uuid.uuid4().hex[:8]}"

        pipeline = redis_client.pipeline()
        pipeline.zremrangebyscore(key, 0, now - self.seconds)
        pipeline.zadd(key, {member: now})
        pipeline.zcard(key)          # ← actual count of requests in the window
        pipeline.expire(key, self.seconds)
        results = await pipeline.execute()

        count = results[2]           # zcard result (index 2 after zremrangebyscore, zadd)
        if count > self.times:
            # Revert the addition of this request since it was rate limited
            await redis_client.zrem(key, member)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        return True
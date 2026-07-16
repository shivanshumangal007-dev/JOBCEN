# pyrefly: ignore [missing-import]
import time
from fastapi import HTTPException, Request, status
from app.core.config import settings
import redis.asyncio as aioredis
from jwt import decode, PyJWTError

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

class RedisLimiter:

    def __init__(self, times:int, seconds: int, group: str = None):
        self.times = times
        self.seconds = seconds
        self.group = group

    async def __call__(self, request: Request):
        identifier = request.client.host

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
        current_time = int(time.time())

        pipeline = redis_client.pipeline()
        pipeline.zremrangebyscore(key, 0, current_time - self.seconds)
        pipeline.zadd(key, {str(current_time): current_time})
        pipeline.expire(key, self.seconds)
        results = await pipeline.execute()

        count = results[1]
        if count > self.times:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        return True
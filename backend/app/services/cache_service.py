import redis
from ..config import get_settings

settings = get_settings()

_redis_client = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


def cache_url(short_code: str, original_url: str, ttl: int = None) -> None:
    r = get_redis()
    r.setex(f"url:{short_code}", ttl or settings.CACHE_TTL, original_url)


def get_cached_url(short_code: str) -> str | None:
    r = get_redis()
    return r.get(f"url:{short_code}")


def invalidate_url_cache(short_code: str) -> None:
    r = get_redis()
    r.delete(f"url:{short_code}")


def increment_rate_limit(key: str, window: int = 60) -> int:
    r = get_redis()
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, window)
    result = pipe.execute()
    return result[0]

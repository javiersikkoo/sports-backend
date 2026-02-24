const cache = {};

export function setCache(key, data, ttlSeconds) {
  cache[key] = {
    data: data,
    expires: Date.now() + ttlSeconds * 1000
  };
}

export function getCache(key) {
  const cached = cache[key];
  if (!cached) return null;
  if (Date.now() > cached.expires) return null;
  return cached.data;
}

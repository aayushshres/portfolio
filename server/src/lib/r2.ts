/**
 * R2 JSON helpers — read, write, and delete JSON objects from an R2 bucket.
 */

export async function getJson<T>(
  bucket: R2Bucket,
  key: string,
  fallback: T,
): Promise<T> {
  const obj = await bucket.get(key);
  if (!obj) return fallback;
  return (await obj.json()) as T;
}

export async function putJson(
  bucket: R2Bucket,
  key: string,
  data: unknown,
): Promise<void> {
  await bucket.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: "application/json" },
  });
}

export async function deleteKey(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  await bucket.delete(key);
}

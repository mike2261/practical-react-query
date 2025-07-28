export const API_URL = 'https://dummyjson.com'

export async function req<T>(url: string, config?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 1000);
  try {
    const res = await fetch(url, { ...config, signal: controller.signal });
    return res.json();
  } finally {
    clearTimeout(id);
  }
}
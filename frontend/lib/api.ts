const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export interface ApiRoom {
  id: number;
  name: string;
  price: number;
  branch: string;
  is_available: boolean;
  image_url?: string | null;
}

export async function getRooms(): Promise<ApiRoom[]> {
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal fetch data kamar");
  }

  return res.json();
}

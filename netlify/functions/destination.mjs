// GET /api/destination?q=keputih
// Mencari kecamatan/kelurahan/kode pos tujuan lewat RajaOngkir (Komerce).
// API key disimpan di environment variable RAJAONGKIR_KEY (bukan di halaman).

const BASE = "https://rajaongkir.komerce.id/api/v1";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
  });

export default async (req) => {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  if (q.length < 3) return json({ data: [] });
  if (!process.env.RAJAONGKIR_KEY) return json({ error: "RAJAONGKIR_KEY belum diatur" }, 500);

  try {
    const url = `${BASE}/destination/domestic-destination?search=${encodeURIComponent(q)}&limit=10&offset=0`;
    const r = await fetch(url, { headers: { key: process.env.RAJAONGKIR_KEY } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok && r.status !== 404) return json({ error: j?.meta?.message || "Gagal mencari tujuan" }, 502);
    const data = (j.data || []).map((d) => ({ id: d.id, label: d.label }));
    return json({ data });
  } catch (e) {
    return json({ error: "Layanan ongkir tidak bisa dihubungi" }, 502);
  }
};

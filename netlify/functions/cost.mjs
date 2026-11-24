// POST /api/cost   body: {"destination": <id dari /api/destination>, "weight": <gram>}
// Menghitung ongkir JNE Regular (REG) dari gudang Kai Parfum Store.
// Environment variables:
//   RAJAONGKIR_KEY   = API key Shipping Cost dari dashboard Komerce/RajaOngkir
//   ORIGIN_ID        = id lokasi pengirim (cari lewat /api/destination?q=<kecamatan toko>)

const BASE = "https://rajaongkir.komerce.id/api/v1";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Gunakan POST" }, 405);
  const { RAJAONGKIR_KEY, ORIGIN_ID } = process.env;
  if (!RAJAONGKIR_KEY || !ORIGIN_ID) return json({ error: "RAJAONGKIR_KEY / ORIGIN_ID belum diatur" }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Body harus JSON" }, 400); }
  const destination = String(body.destination || "").replace(/\D/g, "");
  const weight = Math.round(Number(body.weight));
  if (!destination) return json({ error: "destination wajib diisi" }, 400);
  if (!(weight >= 1 && weight <= 30000)) return json({ error: "weight harus 1–30000 gram" }, 400);

  try {
    const form = new URLSearchParams({ origin: ORIGIN_ID, destination, weight: String(weight), courier: "jne" });
    const r = await fetch(`${BASE}/calculate/domestic-cost`, {
      method: "POST",
      headers: { key: RAJAONGKIR_KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: j?.meta?.message || "Ongkir tidak ditemukan" }, r.status === 400 ? 404 : 502);

    const services = j.data || [];
    // JNE Regular biasanya bernama "REG" (kadang dengan akhiran, mis. "REG23").
    const reg = services.find((s) => /^REG/i.test(s.service || "")) || null;
    if (!reg) return json({ cost: null, error: "JNE REG tidak tersedia ke tujuan ini", services: services.map((s) => s.service) }, 404);

    return json({ service: reg.service, cost: reg.cost, etd: reg.etd ? `${reg.etd}`.replace(/day/i, "hari") : "" });
  } catch (e) {
    return json({ error: "Layanan ongkir tidak bisa dihubungi" }, 502);
  }
};

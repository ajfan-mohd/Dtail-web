export function makeAuth(username: string, appPassword: string) {
  return "Basic " + btoa(`${username}:${appPassword}`);
}

export async function loadPortfolio(siteOrigin: string) {
  const res = await fetch(`${siteOrigin}/wp-json/rpa/v1/get`, { cache: "no-store" });
  if (!res.ok) return null;
  return await res.json();
}

export async function savePortfolio(siteOrigin: string, authHeader: string, payload: any) {
  const res = await fetch(`${siteOrigin}/wp-json/rpa/v1/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Save failed: ${res.status} ${txt}`);
  }

  return await res.json();
}

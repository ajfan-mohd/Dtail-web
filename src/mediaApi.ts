export async function uploadToWpMedia(siteOrigin: string, authHeader: string, file: File) {
  const res = await fetch(`${siteOrigin}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Disposition": `attachment; filename="${file.name}"`,
    },
    body: file,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Media upload failed: ${res.status} ${txt}`);
  }

  const json = await res.json();
  return json.source_url as string; // ✅ final public image URL
}

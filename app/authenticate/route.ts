export async function POST() {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": process.env.NEXT_PUBLIC_COMPOSIO_API_KEY || "",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify({
      integrationId: process.env.INTEGRATION_ID,
    }),
  };

  const res = await fetch(
    "https://backend.composio.dev/api/v1/connectedAccounts",
    options
  );
  const data = await res.json();
  return Response.json(data);
}

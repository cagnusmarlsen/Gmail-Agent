export async function POST() {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": "COMPOSIO_API_KEY",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: '{"integrationId":"INTEGRATION_ID"}',
  };

  const res = await fetch(
    "https://backend.composio.dev/api/v1/connectedAccounts",
    options
  );
  const data = await res.json();
  return Response.json(data);
}

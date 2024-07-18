export async function POST() {

  const options = {
  
    method: 'POST',
    headers: {'X-API-Key': '9u96ly6pioqfmne0zvildp', 'Content-Type': 'application/json', 'Access-Control-Allow-Headers': 'Content-Type, Authorization'},
    body: '{"integrationId":"5dc641fe-b254-440a-966d-a452da6d4728"}'
     };
      
      const res = await fetch('https://backend.composio.dev/api/v1/connectedAccounts', options)
      const data = await res.json();
      console.log("This is the connected account", data)
      return Response.json(data);
}
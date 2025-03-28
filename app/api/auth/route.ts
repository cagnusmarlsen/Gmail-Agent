import { LangchainToolSet } from "composio-core";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { action, entityId } = await req.json();

    const toolset = new LangchainToolSet({
      apiKey: "9u96ly6pioqfmne0zvildp",
    });

    if (action === "setup") {
      const entity = await toolset.client.getEntity(entityId);
      
        const connection = await entity.initiateConnection({ appName: "gmail" });
        if (connection.redirectUrl) {
          return Response.json({
            connectedAccountId: entityId,
            url: connection.redirectUrl,
            status: "pending",
          });
        }
      
      
      return Response.json({
        connectedAccountId: entityId,
        status: "active",
      });
    }

    if (action === "confirm") {
      const entity = await toolset.client.getEntity(entityId);
      const connection = await entity.getConnection({ appName: "gmail" });
      
      if (connection) {
        return Response.json({
          connectedAccountId: entityId,
          status: "active",
        });
      }
      
      return Response.json({
        status: "inactive",
      });
    }

    if (action === "init") {
      const newEntityId = uuidv4();
      return Response.json({
        entityId: newEntityId,
        status: "new",
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth error:", error);
    return Response.json(
      { error: error.message },
      { status: error.status ?? 500 }
    );
  }
}
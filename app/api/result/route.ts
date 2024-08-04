import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: Request) {
  try {
    const { userQuery, showLink } = await req.json();

    const toolset = new LangchainToolSet({
      apiKey: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY,
      entityId: showLink?.connectedAccountId,
    });

    const tool = await toolset.get_actions(
      {
        actions: [
          "gmail_send_email",
          "gmail_fetch_emails",
          "gmail_create_email_draft",
          "gmail_create_label",
        ],
      },
      showLink.connectedAccountId
    );

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful and thorough AI email assistant who can write and fetch emails, create draft mails and also create new gmail labels. Your goal is to understand the guidelines provided by the user and perform the specific actions requested by the user. If the user asks to fetch emails, use the actual data from the API response and print the result including these terms: Subject and Mail in an easy-to-read format.",
      ],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = await createToolCallingAgent({
      llm,
      tools: tool,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: tool,
    });
    const input = userQuery;
    const { output } = await agentExecutor.invoke({ input });
    return Response.json(output);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

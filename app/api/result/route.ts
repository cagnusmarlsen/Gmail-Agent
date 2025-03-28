import { ChatGroq } from "@langchain/groq";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: Request) {
  try {
    const { userQuery, showLink } = await req.json();

    const toolset = new LangchainToolSet({
      apiKey: "9u96ly6pioqfmne0zvildp",
      entityId: showLink?.connectedAccountId,
    });

    const tool = await toolset.getTools(
      {
        actions: [
          "GMAIL_FETCH_EMAILS",
          "GMAIL_SEND_EMAIL",
          "GMAIL_CREATE_EMAIL_DRAFT",
        ],
      },
      showLink.connectedAccountId
    );

    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: "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",
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful and thorough AI email assistant who can fetch emails, send emails and create draft emails. Your goal is to understand the guidelines provided by the user and perform the specific actions requested by the user. If the user asks to fetch emails, use the actual data from the API response and print the result including these terms: Subject and Mail in an easy-to-read format.",
      ],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = await createToolCallingAgent({
      llm: llm,
      tools: tool,
      prompt: prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: tool,
      verbose: true,
      returnIntermediateSteps: true,
    });
    const input = userQuery;
    const { output } = await agentExecutor.invoke({ input });
    return Response.json(output);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

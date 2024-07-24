import { ChatMistralAI } from "@langchain/mistralai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolset = new LangchainToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
const tool = await toolset.get_actions({
  actions: ["gmail_send_email", "gmail_fetch_emails"],
});

export async function POST(req: Request) {
  try {
    const { userQuery } = await req.json();

    const llm = new ChatMistralAI({
      model: "mistral-large-latest",
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful and thorough AI email assistant who can write and fetch emails. Your goal is to understand the guidelines provided by the user and perform the specific actions requested by the user. The word limit for the email is strictly under 100 words. If the user asks to fetch emails, use the actual data from the API response and print the result including these terms: Subject and Mail in an easy-to-read format.",
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

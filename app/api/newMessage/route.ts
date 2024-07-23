import { ChatMistralAI } from "@langchain/mistralai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolset = new LangchainToolSet({ apiKey: "COMPOSIO_API_KEY" });
const myTools = await toolset.get_actions({
  actions: ["gmail_reply_to_thread"],
});

export async function POST(req: Request) {
  try {
    const { from, message, id } = await req.json();

    const llm = new ChatMistralAI({
      model: "mistral-large-latest",
      apiKey: "MISTRAL_API_KEY",
    });

    // Customize the prompt to do what you want
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an AI email assistant who can respond to emails from John Doe with email address - 'john.doe@gmail.com'. Your goal is to do the following - If you receive an email from John Doe 'john.doe@gmail.com', respond appropriately by understanding the email content - ${message}. The thread ID is ${id}. `,
      ],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = await createToolCallingAgent({
      llm,
      tools: myTools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: myTools,
    });

    const input = { from, message, id };
    const { output } = await agentExecutor.invoke({ input });
    return Response.json(output);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

import { ChatMistralAI } from "@langchain/mistralai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolset = new LangchainToolSet({ apiKey: "9u96ly6pioqfmne0zvildp"});
const tool = await toolset.get_actions({actions: ['gmail_reply_to_thread']});

export async function POST(req: Request) {
    try {
        const {from, message, id} = await req.json();

        console.log("THREAD ID",id);

        const llm = new ChatMistralAI({
            model: "mistral-large-latest",
            apiKey: "HyeqlAOt3hxFFy8PrIw0H8kgRpuXV0tR"
        })

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are an AI email assistant who can respond to emails. Your goal is to do the following - If you receive a thank you email from Arunabh Banerjee '0arunabh30@gmail.com', respond with the appropriate greeting and also ask to meet him sometime next month. The thread ID is ${id}. You should only do this if the email is an email thanking me and it is from Arunabh Banerjee. Otherwise, do nothing`],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
          ]);

        const agent = await createToolCallingAgent({
            llm,
            tools: tool,
            prompt
        })

        const agentExecutor = new AgentExecutor({
            agent,
            tools: tool,
        })

        const input = {from, message, id};
        const { output } = await agentExecutor.invoke({ input });
        console.log("THIS IS THE RESPONSE", output);
        return Response.json(output)

    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
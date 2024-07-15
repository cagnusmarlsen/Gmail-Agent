import { ChatMistralAI } from "@langchain/mistralai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const toolset = new LangchainToolSet({ apiKey: "9u96ly6pioqfmne0zvildp"});
const tool = await toolset.get_actions({actions: ['gmail_send_email', 'gmail_fetch_emails_with_label']});

export async function POST (req: Request) {
    try {
        console.log("API REQUEST STARTED")
        const {userQuery} = await req.json();

        console.log("THIS IS THE INPUT SENT", userQuery);

        const llm = new ChatMistralAI({
            model: "mistral-large-latest",
            apiKey: "HyeqlAOt3hxFFy8PrIw0H8kgRpuXV0tR"
        })

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are an AI email assistant who can write and fetch emails. Your goal is to understand the guidelines provided by the user and perform the specific actions requested by the user. The word limit for the email is strictly under 60 words. If the user asks to fetch emails, print the result of the api call you make and include these terms - Subject, From, Date, Snippet. The output should be in an easy to read format."],
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
        const input = userQuery;
        const { output } = await agentExecutor.invoke({ input });
        console.log("THIS IS THE OUTPUT", output);
        return Response.json(output)

    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
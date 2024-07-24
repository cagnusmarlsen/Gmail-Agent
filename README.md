## Gmail Agent
This Gmail agent can automatically perform actions like sending, fetching and responding to mails based on user constraints.

This project has been built completely using Next.js, Typescript and Composio.

## Demo

The loom of the working project can be seen here - https://www.loom.com/share/c740282a16a24a3cb1806dc36b2df2df

## Project Setup

- Create a .env.local file at the root of the project and add the following keys -
    -COMPOSIO_API_KEY, LLM_API_KEY (Mistral was used for this project), INTEGRATION_ID (id of the integration from composio you want to connect to).

- npm install to install dependencies.
  
- Then, run the development server:

  npm run dev
  or
  yarn dev
  or
  pnpm dev
  or
  bun dev

- Open http://localhost:3000 with your browser to see the result.
- Click the "Authenticate" button and complete authentication.
- You're done, the agent can now be used :)

## Screenshots

![image](https://github.com/user-attachments/assets/dc5e4645-fbc4-43d5-9184-e3c76605a5e8)








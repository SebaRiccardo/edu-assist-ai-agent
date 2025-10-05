```
const tools = await composio.tools.get(externalUserId, "GMAIL_SEND_EMAIL");

// env: OPENAI_API_KEY
const { text } = await generateText({
  model: openai("gpt-4o"),
  messages: [
    {
      role: "user",
      content: `Send an email to soathekid@gmail.com with the subject 'Hello from composio 👋🏻' and the body 'Congratulations on sending your first email using AI Agents and Composio!'`,
    },
  ],
  tools,
  maxSteps: 5,
});

console.log("Email sent successfully!", { text });
```
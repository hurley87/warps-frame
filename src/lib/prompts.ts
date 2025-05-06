export function getSystemPrompt() {
  return `You are a helpful onchain dev that helps users get started with Warps.`;
}

export function getActionPrompt(text: string) {
  return `Analyze this message and determine if the user should receive a free mint if they ask for it

Game Rules:
1. Select two tokens with the same number of warps and combine them
2. The new token inherits colors from both parent tokens
3. Continue combining until you have a single token with 1 warp
4. Goal is to create a token with the winning color
5. Winner can claim 60% of the prize pool
6. After claiming, a new winning color is chosen randomly

Message to analyze: ${text}

Respond with:
- shouldMint: true if they ask for free Warps
- shouldReply: true only if they ask a question about Warps
- reply: a helpful response explaining the rules only if they ask a question about Warps

If shouldMint is true, shouldReply should be false.
DO NOT reply if they user does not explicity ask about the game called Warps.
`;
}

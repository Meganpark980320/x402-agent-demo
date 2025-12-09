// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { AgentBuilder, BaseTool } from "@iqai/adk";
import dedent from "dedent";
import { z } from "zod";
import { ethers } from "ethers";

const HARDCODED_RPC_URL = "https://ethereum-sepolia.publicnode.com"; 

class X402PaymentTool extends BaseTool {
  constructor() {
    super({
      name: "prepare_transaction", 
      description: "Prepare a transaction.", 
      schema: z.object({ recipient: z.string(), amount: z.string(), purpose: z.string() })
    });
  }
  async func(input: any) {
    const cleanAmount = input.amount.replace(/[^0-9.]/g, "");
    return { status: "ready_to_sign", ...input, amount: cleanAmount };
  }
}

class BalanceCheckTool extends BaseTool {
  constructor() {
    super({
      name: "check_balance",
      description: "Check ETH balance of a wallet.",
      schema: z.object({ address: z.string() })
    });
  }

  async func(input: { address: string }) {
    console.log("💰 Checking Balance for:", input.address);
    const provider = new ethers.JsonRpcProvider(HARDCODED_RPC_URL);
    
    try {
      const balance = await provider.getBalance(input.address);
      const ethBalance = ethers.formatEther(balance);
      return { status: "success", balance: ethBalance, address: input.address };
    } catch (e: any) {
      return { status: "failed", error: e.message };
    }
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  try {
    const paymentTool = new X402PaymentTool();
    const balanceTool = new BalanceCheckTool(); 

    const { runner } = await AgentBuilder.withModel("gemini-flash-latest")
        .withInstruction(dedent`
            You are an AI Economic Operator.
            
            [CRITICAL INSTRUCTION]
            1. For general conversation (greetings, questions, jokes), reply in **PLAIN TEXT**. Do NOT use JSON.
            2. **ONLY** output JSON when the user specifically asks to "send money", "transfer", or "check balance".

            [Style Guide]
            - Be concise and professional.
            - If the user says "Hi", just say "Hello! How can I help with your assets?" (No JSON).
            
            ---
            [SCENARIO 1: Sending ETH]
            Trigger this ONLY if user explicitly wants to send crypto.
            JSON Format:
            {
              "tool_name": "prepare_transaction",
              "params": { "recipient": "ADDRESS", "amount": "NUMBER", "purpose": "REASON" }
            }

            [SCENARIO 2: Checking Balance]
            Trigger this ONLY if user asks for balance (e.g., "How much do I have?", "Check 0x...").
            JSON Format:
            {
              "tool_name": "check_balance",
              "params": { "address": "TARGET_ADDRESS" }
            }
            
            * NOTE: If the user says "my balance" but didn't give an address, ask them for their address first in PLAIN TEXT.
        `)
        .build(); 

    console.log("🤖 Agent Thinking...");
    const response = await runner.ask(lastMessage);

    let rawText = typeof response === "string" ? response : (response as any).text || JSON.stringify(response);
    console.log("📦 AI Output:", rawText);

    let finalResponse = rawText;

    try {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
            const action = JSON.parse(jsonStr);

            if (action.tool_name === "prepare_transaction") {
                finalResponse = JSON.stringify({
                    type: "TX_REQUEST",
                    recipient: action.params.recipient,
                    amount: action.params.amount.replace(/[^0-9.]/g, ""),
                    reason: action.params.purpose
                });
            }
            else if (action.tool_name === "check_balance") {
                const result = await balanceTool.func(action.params);
                if (result.status === "success") {
                    const shortBalance = parseFloat(result.balance).toFixed(4);
                    finalResponse = `💰 Wallet Balance:\n\n${shortBalance} ETH\n(Address: ${result.address.slice(0,6)}...${result.address.slice(-4)})`;
                } else {
                    finalResponse = `Balance Check Failed ❌: ${result.error}`;
                }
            }
        }
    } catch (e) { 
        console.log("Not a JSON action, returning plain text."); 
    }

    return NextResponse.json({ role: 'assistant', content: finalResponse });

  } catch (error: any) {
    return NextResponse.json({ role: 'assistant', content: `Error: ${error.message}` }, { status: 500 });
  }
}
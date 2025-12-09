// app/page.tsx
"use client";

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string, isJson?: boolean}[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Wagmi Hooks
  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      let aiContent = data.content;
      let isTxRequest = false;

      // 1. Check if the server sent a payment request
      try {
        const parsed = JSON.parse(aiContent);
        if (parsed.type === "TX_REQUEST") {
            isTxRequest = true;
            console.log("🚀 Requesting MetaMask execution!", parsed);
            
            // 2. Execute transfer (MetaMask popup appears)
            sendTransaction({
                to: parsed.recipient as `0x${string}`,
                value: parseEther(parsed.amount),
            });
            
            aiContent = `💸 Payment request generated.\nPlease sign in your wallet.\n\nRecipient: ${parsed.recipient}\nAmount: ${parsed.amount} ETH`;
        }
      } catch (e) {
        // Pass if it's a normal conversation
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiContent, isJson: isTxRequest }]);
      
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error occurred" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">EmpAI</h1>
        <ConnectButton />
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-800 rounded-lg">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
              <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
              
              {/* Transaction Status (Only for the most recent message) */}
              {m.isJson && i === messages.length - 1 && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-600 text-sm">
                      {isPending && <div className="text-yellow-400">🦊 Please check your wallet...</div>}
                      {isConfirming && <div className="text-blue-400">⏳ Confirming transaction...</div>}
                      {isConfirmed && <div className="text-green-400">✅ Transaction confirmed!</div>}
                      
                      {hash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 underline mt-2 block hover:text-blue-300 truncate"
                        >
                          🔗 View on Sepolia Etherscan (Click)
                        </a>
                      )}
                  </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-400">Thinking...</div>}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 rounded bg-slate-700 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 px-6 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
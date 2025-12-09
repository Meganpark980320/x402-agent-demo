// app/page.tsx
"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// 참고: SCSS 클래스 이름을 사용하도록 className을 모두 수정했습니다.

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
    // 👈 SCSS: chat-container 클래스로 변경 (flex flex-col h-screen bg-slate-900 text-white p-4 대체)
    <div className="chat-container"> 
      {/* Header */}
      {/* 👈 SCSS: header 클래스로 변경 (flex justify-between items-center mb-6 대체) */}
<div className="header"> 

        
        {/* 좌측: 로고, 타이틀, 서브타이틀 그룹 (이미지 스타일 차용) */}
        <div className="header-left-group"> 
          <div className="logo-section">
              <img src='/empAI.png' className='img' alt='EmpAI Logo' />
          </div>
          <div className="header-subtitle">
            Powered by @iqai/adk
          </div>
        </div>
        
        {/* 우측: 지갑 연결 버튼 */}
        <ConnectButton />
      </div>

      {/* Chat Window */}
      {/* 👈 SCSS: chat-window 클래스로 변경 (flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-800 rounded-lg 대체) */}
      <div className="chat-window">
        {messages.map((m, i) => (
          <div 
            key={i} 
            // 👈 SCSS: message-row 클래스 사용, 조건부 justify (flex justify-end/start 대체)
            className={`message-row ${m.role === 'user' ? 'user-message-row' : 'assistant-message-row'}`}
          >
            <div 
              // 👈 SCSS: message-bubble 클래스 사용, 조건부 배경색 (p-3 rounded-lg max-w-[80%] bg-blue-600/bg-slate-700 대체)
              className={`message-bubble ${m.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
            >
              <div className="message-content">{m.content}</div>
              
              {/* Transaction Status (Only for the most recent message) */}
              {m.isJson && i === messages.length - 1 && (
                  <div className="tx-status-box"> {/* SCSS: tx-status-box 적용 */}
                      {isPending && <div className="tx-status-pending">🦊 Please check your wallet...</div>}
                      {isConfirming && <div className="tx-status-confirming">⏳ Confirming transaction...</div>}
                      {isConfirmed && <div className="tx-status-confirmed">✅ Transaction confirmed!</div>}
                      
                      {hash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-status-link" 
                        >
                          🔗 View on Sepolia Etherscan (Click)
                        </a>
                      )}
                  </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="loading-indicator">Thinking...</div>} {/* SCSS: loading-indicator 적용 */}
      </div>

      {/* Input Area */}
      {/* 👈 SCSS: input-area 클래스로 변경 (flex gap-2 대체) */}
      <div className="input-area">
        <input 
          // 👈 SCSS: input-field 클래스로 변경 (flex-1 p-3 rounded bg-slate-700 focus:outline-none 대체)
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        {/* 👈 SCSS: send-button 클래스로 변경 (bg-blue-600 px-6 py-2 rounded 대체) */}
        <button onClick={sendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
}
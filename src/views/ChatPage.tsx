import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatThread } from '../components/chat/ChatThread';
import { ChatInput } from '../components/chat/ChatInput';
import { SourcePanel } from '../components/chat/SourcePanel';
import type { Citation } from '../models/chat';
import { PUBLIC_STARTER_QUESTIONS } from '../models/chat';

export function ChatPage() {
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat('public');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  return (
    <div className={`chat-page ${selectedCitation ? 'chat-page--with-panel' : ''}`}>
      <div className="chat-main">
        <div className="chat-header">
          <h1 className="chat-header-title">Knowledge Assistant</h1>
          {messages.length > 0 && (
            <button className="chat-new-btn" onClick={clearChat}>
              New Chat
            </button>
          )}
        </div>

        {error && (
          <div className="chat-error">
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        <ChatThread
          messages={messages}
          isStreaming={isStreaming}
          onCitationClick={setSelectedCitation}
          starterQuestions={PUBLIC_STARTER_QUESTIONS}
        />

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>

      <SourcePanel citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
    </div>
  );
}

import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatThread } from '../components/chat/ChatThread';
import { ChatInput } from '../components/chat/ChatInput';
import { SourcePanel } from '../components/chat/SourcePanel';
import type { Citation } from '../models/chat';
import { PRIVATE_PROMPT_OPTIONS } from '../models/chat';

export function PrivateChatPage() {
  const [selectedPromptId, setSelectedPromptId] = useState('general');
  const selectedOption = PRIVATE_PROMPT_OPTIONS.find((o) => o.id === selectedPromptId)!;

  const { messages, isStreaming, error, sendMessage, clearChat } = useChat(
    'private',
    selectedPromptId
  );
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const handlePromptChange = (newPromptId: string) => {
    setSelectedPromptId(newPromptId);
    clearChat();
  };

  return (
    <div className={`chat-page ${selectedCitation ? 'chat-page--with-panel' : ''}`}>
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-left">
            <h1 className="chat-header-title">Knowledge Assistant</h1>
            <span className="private-badge">Internal CMO</span>
          </div>
          <div className="chat-header-right">
            <div className="prompt-selector">
              <label htmlFor="prompt-select">Mode:</label>
              <select
                id="prompt-select"
                value={selectedPromptId}
                onChange={(e) => handlePromptChange(e.target.value)}
                disabled={isStreaming}
              >
                {PRIVATE_PROMPT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {messages.length > 0 && (
              <button className="chat-new-btn" onClick={clearChat}>
                New Chat
              </button>
            )}
          </div>
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
          starterQuestions={selectedOption.starterQuestions}
        />

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>

      <SourcePanel citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
    </div>
  );
}

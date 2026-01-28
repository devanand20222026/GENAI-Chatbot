import { useState, useRef, useEffect } from 'react';
import Login from './components/Login';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const SESSION_ID = 'default';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check for existing session on mount
  useEffect(() => {
    const session = localStorage.getItem('chatbot_session') || sessionStorage.getItem('chatbot_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.isAuthenticated) {
          setIsAuthenticated(true);
          setCurrentUser(sessionData.user);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle login
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logout button clicked - starting logout process');

    // Clear all storage
    localStorage.removeItem('chatbot_session');
    sessionStorage.removeItem('chatbot_session');

    // Reset all state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    setPdfUploaded(false);
    setPdfFileName('');

    console.log('Logout completed - should show login page now');
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Handle PDF upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', SESSION_ID);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/upload-pdf?session_id=${SESSION_ID}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      setPdfUploaded(true);
      setPdfFileName(file.name);

      // Add system message
      setMessages(prev => [...prev, {
        role: 'system',
        content: `📄 PDF "${file.name}" uploaded successfully! You can now ask questions about it.`,
      }]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle chat message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
    }]);

    setIsLoading(true);

    try {
      // Create fetch for streaming
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: SESSION_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                assistantMessage += data.chunk;
                // Update the last message (assistant's response)
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                    isStreaming: true,
                  };
                  return newMessages;
                });
              }

              if (data.done) {
                // Mark streaming as complete
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                    isStreaming: false,
                  };
                  return newMessages;
                });
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '❌ Error: Failed to get response. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset chat
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the chat? This will clear all messages and PDF context.')) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: SESSION_ID,
        }),
      });

      setMessages([]);
      setPdfUploaded(false);
      setPdfFileName('');
    } catch (error) {
      console.error('Error resetting chat:', error);
      alert('Failed to reset chat. Please try again.');
    }
  };

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <span className="header-icon">🤖</span>
          <h1>GenAI Chatbot</h1>
        </div>
        <div className="header-actions">
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <span className="user-name">{currentUser?.name}</span>
          </div>
          <label className="file-upload-label">
            <span>📄</span>
            <span>Upload PDF</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="file-upload-input"
              disabled={isLoading}
            />
          </label>
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={isLoading || messages.length === 0}
          >
            <span>🔄</span>
            <span>Reset Chat</span>
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="chat-container">
        {/* PDF Status Banner */}
        {pdfUploaded && (
          <div className="pdf-status">
            <span>✅</span>
            <span>PDF Active: {pdfFileName}</span>
          </div>
        )}

        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h2>Welcome to GenAI Chatbot</h2>
              <p>
                Start a conversation or upload a PDF to ask questions about it.
                I'm powered by Groq AI and ready to help!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : message.role === 'system' ? '📢' : '🤖'}
                </div>
                <div className="message-content">
                  {message.content}
                  {message.isStreaming && (
                    <span className="typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="input-area">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="input-field"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-icon"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <span>🚀</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

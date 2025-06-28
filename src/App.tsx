import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, Github, MessageCircle, Clock, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatHistoryItem {
  user: string;
  bot: string;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial chat history
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('https://qa-customer-agent.vercel.app/history');
      const data = await response.json();
      if (data.chat_history) {
        const formattedHistory = data.chat_history.map((item: [string, string]) => ({
          user: item[0] === 'You' ? item[1] : '',
          bot: item[0] === 'Bot' ? item[1] : '',
          timestamp: new Date()
        })).filter((item: ChatHistoryItem) => item.user || item.bot);
        setChatHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://qa-customer-agent.vercel.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        role: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update chat history
      const newHistoryItem: ChatHistoryItem = {
        user: inputMessage,
        bot: data.response,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, newHistoryItem]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await fetch('https://qa-customer-agent.vercel.app/reset', { method: 'POST' });
      setMessages([]);
      setChatHistory([]);
    } catch (error) {
      console.error('Failed to reset chat:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Support Agent</h1>
                <p className="text-sm text-slate-500">AI-powered customer support</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={resetChat}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-sm font-medium">Reset</span>
              </button>
              
              <a
                href="https://github.com/thepersonilike13/QA-chatbot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 flex flex-col h-full overflow-hidden">
              
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Support Assistant</h3>
                    <p className="text-xs text-slate-500">Online • Ready to help</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Welcome to Support Chat</h3>
                    <p className="text-slate-500 max-w-md">
                      Hi there! I'm your AI support assistant. Ask me anything about our products, services, or policies.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'bot' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md'
                              : 'bg-slate-100 text-slate-700 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className={`text-xs text-slate-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 order-3">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex gap-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[52px] max-h-32"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 h-full flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-800">Chat History</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No chat history yet</p>
                  </div>
                ) : (
                  chatHistory.map((item, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 hover:shadow-md transition-shadow duration-200">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700 leading-relaxed">{item.user}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Bot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 leading-relaxed">{item.bot}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
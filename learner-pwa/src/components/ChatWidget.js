import { useState, useEffect, useRef } from 'react';
import { Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useCourse } from '../context/CourseContext';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import './ChatWidget.css';

function ChatWidget() {
    const { user, isAuthenticated } = useUser();
    const { language } = useLanguage();
    const { courseContext } = useCourse();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Welcome message - different for authenticated vs unauthenticated users
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            let welcomeMessage;

            if (isAuthenticated && user?.profile?.firstName) {
                // Personalized welcome for authenticated users
                welcomeMessage = language === 'sw'
                    ? `Habari ${user.profile.firstName}! 👋 Mimi ni msaidizi wako wa kujifunza. Naweza kukusaidia na maswali yoyote kuhusu maudhui ya kozi yako. Je, una swali?`
                    : `Hello ${user.profile.firstName}! 👋 I'm your learning assistant. I can help you with any questions about your course content and progress. How can I help you today?`;
            } else {
                // General welcome for unauthenticated users
                welcomeMessage = language === 'sw'
                    ? `Habari! 👋 Karibu kwenye mfumo wetu wa kujifunza. Naweza kukusaidia kujifunza kuhusu kozi zetu, vipengele vya jukwaa, na jinsi ya kujiandikisha. Je, una swali?`
                    : `Hello! 👋 Welcome to our learning platform. I can help you learn about our courses, platform features, and how to get started. How can I help you today?`;
            }

            setMessages([{
                role: 'assistant',
                content: welcomeMessage,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, language, messages.length, isAuthenticated, user]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');

            // Use different endpoint based on authentication state
            const endpoint = isAuthenticated
                ? `${process.env.REACT_APP_API_URL}/chatbot/message`
                : `${process.env.REACT_APP_API_URL}/chatbot/message-public`;

            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authorization header only if authenticated
            if (token && isAuthenticated) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: inputMessage,
                    language,
                    courseContext: isAuthenticated ? (courseContext || {}) : null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            // Create placeholder message
            const assistantMessageObj = {
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessageObj]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            setIsTyping(false);
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.chunk) {
                                assistantMessage += parsed.chunk;
                                // Update the last message
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1].content = assistantMessage;
                                    return newMessages;
                                });
                            } else if (parsed.error) {
                                // Handle specific error messages from backend
                                let errorMessage = parsed.error;
                                if (parsed.error.includes('not configured')) {
                                    errorMessage = language === 'sw'
                                        ? 'Huduma ya AI haijasanidiwa. Tafadhali wasiliana na msaada.'
                                        : 'AI service is not configured. Please contact support.';
                                } else if (parsed.error.includes('configuration error')) {
                                    errorMessage = language === 'sw'
                                        ? 'Kuna tatizo la usanidi wa huduma ya AI. Tafadhali jaribu tena baadaye.'
                                        : 'AI service configuration error. Please try again later.';
                                } else if (parsed.error.includes('temporarily unavailable')) {
                                    errorMessage = language === 'sw'
                                        ? 'Huduma ya AI haipatikani kwa muda. Tafadhali jaribu tena baadaye.'
                                        : 'AI service is temporarily unavailable. Please try again later.';
                                }

                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: errorMessage,
                                    timestamp: new Date(),
                                    isError: true
                                }]);
                                setIsTyping(false);
                                setIsLoading(false);
                                return;
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = language === 'sw'
                ? 'Samahani, nimepata tatizo. Tafadhali jaribu tena.'
                : 'Sorry, I encountered an error. Please try again.';

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Always render the widget - no authentication check
    return (
        <>
            {/* Floating Action Button */}
            <div className={`chat-fab ${isOpen ? 'chat-open' : ''}`} onClick={toggleChat}>
                {isOpen ? (
                    <span className="chat-fab-icon">✕</span>
                ) : (
                    <>
                        <span className="chat-fab-icon">💬</span>
                        <Badge bg="danger" className="chat-notification-badge">AI</Badge>
                    </>
                )}
            </div>

            {/* Chat Window */}
            <div className={`chat-widget ${isOpen ? 'chat-widget-open' : ''}`}>
                {/* Header */}
                <div className="chat-header">
                    <div className="d-flex align-items-center">
                        <span className="chat-avatar">🤖</span>
                        <div className="ms-2">
                            <div className="chat-title">
                                {t('chatbot.title', 'Learning Assistant')}
                            </div>
                            <div className="chat-status">
                                <span className="status-dot"></span>
                                {t('chatbot.online', 'Online')}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="link"
                        className="chat-close-btn"
                        onClick={toggleChat}
                    >
                        ✕
                    </Button>
                </div>

                {/* Messages */}
                <div className="chat-messages" ref={chatContainerRef}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'} ${message.isError ? 'chat-message-error' : ''}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="message-avatar">🤖</div>
                            )}
                            <div className="message-content">
                                {message.role === 'assistant' ? (
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                    <p>{message.content}</p>
                                )}
                                <div className="message-timestamp">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            {message.role === 'user' && (
                                <div className="message-avatar message-avatar-user">
                                    {user?.profile?.firstName?.charAt(0) || '👤'}
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-message chat-message-assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                    <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder={t('chatbot.placeholder', 'Type your question...')}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="chat-input"
                    />
                    <Button
                        variant="primary"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="chat-send-btn"
                    >
                        {isLoading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            '➤'
                        )}
                    </Button>
                </div>

                {/* Footer */}
                <div className="chat-footer">
                    <small className="text-muted">
                        {t('chatbot.powered', 'Powered by Gemini AI')}
                    </small>
                </div>
            </div>
        </>
    );
}

export default ChatWidget;

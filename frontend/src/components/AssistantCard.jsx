import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Mic, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { sendMessageToAI, resetConversation } from '../services/aiService';

// Simple markdown parser for chat messages
const formatMessage = (text) => {
    if (!text) return '';
    
    // Split by lines to handle lists and paragraphs
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let inList = false;
    
    lines.forEach((line, lineIndex) => {
        // Check if it's a list item
        const listMatch = line.match(/^[\-\*•]\s+(.+)$/);
        const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
        
        if (listMatch || numberedListMatch) {
            if (!inList) {
                inList = true;
                listItems = [];
            }
            const content = listMatch ? listMatch[1] : numberedListMatch[2];
            listItems.push(
                <li key={`li-${lineIndex}`} className="ml-4 mb-1">
                    {formatInlineMarkdown(content)}
                </li>
            );
        } else {
            // Close any open list
            if (inList && listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${lineIndex}`} className="list-disc list-inside mb-2">
                        {listItems}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
            
            // Handle regular line
            if (line.trim()) {
                elements.push(
                    <p key={`p-${lineIndex}`} className="mb-2 last:mb-0">
                        {formatInlineMarkdown(line)}
                    </p>
                );
            }
        }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
        elements.push(
            <ul key="ul-final" className="list-disc list-inside mb-2">
                {listItems}
            </ul>
        );
    }
    
    return elements.length > 0 ? elements : text;
};

// Format inline markdown (bold, italic, code)
const formatInlineMarkdown = (text) => {
    if (!text) return '';
    
    const parts = [];
    let remaining = text;
    let key = 0;
    
    // Process the text for markdown patterns
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|₹([\d,]+))/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        
        if (match[2]) {
            // Bold + Italic (***text***)
            parts.push(<strong key={key++} className="font-bold italic text-white">{match[2]}</strong>);
        } else if (match[3]) {
            // Bold (**text**)
            parts.push(<strong key={key++} className="font-semibold text-white">{match[3]}</strong>);
        } else if (match[4]) {
            // Italic (*text*)
            parts.push(<em key={key++} className="italic text-gray-300">{match[4]}</em>);
        } else if (match[5]) {
            // Code (`text`)
            parts.push(<code key={key++} className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs font-mono">{match[5]}</code>);
        } else if (match[6]) {
            // Currency (₹amount)
            parts.push(<span key={key++} className="text-green-400 font-medium">₹{match[6]}</span>);
        }
        
        lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
};

const AssistantCard = ({ selectedVehicle = null }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm Maya, your AI assistant for AutoAide. I can help you with vehicle diagnostics, maintenance predictions, service scheduling, and more. What would you like to know?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Suggested prompts
    const suggestedPrompts = [
        "Show me vehicles with low health",
        "What are the common issues?",
        "Schedule a service",
        "Explain battery health"
    ];

    const handleSendMessage = async (messageText = null) => {
        const textToSend = messageText || inputValue.trim();
        if (!textToSend || isLoading) return;

        // Add user message
        const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendMessageToAI(textToSend, selectedVehicle);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error("Failed to get AI response", error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Sorry, I encountered an error. Please try again.",
                sender: 'ai',
                error: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleReset = () => {
        resetConversation();
        setMessages([
            { id: 1, text: "Hello! I'm Maya, your AI assistant for AutoAide. I can help you with vehicle diagnostics, maintenance predictions, service scheduling, and more. What would you like to know?", sender: 'ai' }
        ]);
    };

    return (
        <div className="w-96 h-[500px] glass-panel p-6 flex flex-col relative overflow-hidden">
            {/* Gradient Header */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>

            {/* Header Badge */}
            <div className="relative z-10 mb-4 shrink-0 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-3 h-3" />
                    AI ASSISTANT
                </div>
                <button 
                    onClick={handleReset}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    title="Reset conversation"
                >
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10 leading-tight shrink-0">
                Maya <br />
                <span className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Vehicle AI Expert</span>
            </h2>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-4 relative z-10 pr-2 space-y-3 scrollbar-hide">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border backdrop-blur-md max-w-[90%] ${msg.sender === 'ai'
                            ? `bg-white/10 border-white/5 rounded-tl-none self-start mr-auto ${msg.error ? 'border-red-500/30' : ''}`
                            : 'bg-primary/20 border-primary/20 rounded-tr-none self-end ml-auto'
                            }`}
                    >
                        <div className="text-gray-200 text-sm leading-relaxed">
                            {msg.sender === 'ai' ? formatMessage(msg.text) : msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/10 backdrop-blur-md rounded-tl-none self-start mr-auto">
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-gray-400 text-sm">Maya is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts - Show only when few messages */}
            {messages.length <= 2 && !isLoading && (
                <div className="relative z-10 mb-3 flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full text-gray-300 hover:bg-white/10 hover:border-primary/30 transition-all"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="relative z-10 mt-auto shrink-0">
                <div className="relative group">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your vehicle..."
                        disabled={isLoading}
                        className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all duration-300 disabled:opacity-50"
                    />
                    <Mic className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowRight className="w-4 h-4 text-primary" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistantCard;

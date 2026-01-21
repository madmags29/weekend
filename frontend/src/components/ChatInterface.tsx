"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { TripTimeline } from "./TripTimeline";

interface ChatInterfaceProps {
    destination: string;
    itineraryData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onBack: () => void;
    onToggleMap?: () => void;
}

interface Message {
    id: string;
    role: "user" | "ai";
    content?: string;
    component?: React.ReactNode;
    isTyping?: boolean;
}

const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed(text.substring(0, i + 1));
            i++;
            if (i === text.length) {
                clearInterval(timer);
                onComplete?.();
            }
        }, 15); // Speed of typing
        return () => clearInterval(timer);
    }, [text, onComplete]);

    return <span>{displayed}</span>;
}


export function ChatInterface({ destination, itineraryData, onBack, onToggleMap }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial State: User request + Itinerary Component
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "user", content: `Plan a weekend trip to ${destination}` },
        {
            id: "2",
            role: "ai",
            component: <TripTimeline destination={destination} days={itineraryData.itinerary} estimatedCost={itineraryData.estimated_cost} />
        }
    ]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content, destination })
            });
            const data = await res.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.response,
                isTyping: true
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/50">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h3 className="font-semibold text-white">Weekend AI</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                        </p>
                    </div>
                </div>

                {onToggleMap && (
                    <button
                        onClick={onToggleMap}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium text-white transition-colors border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 12 15 6 21 3 21 18 15 21 9 15 3 21" /><line x1="9" y1="15" x2="9" y2="21" /></svg>
                        View Map
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[90%] md:max-w-[80%] ${msg.role === "user" ? "bg-indigo-600/20 border border-indigo-500/30 text-white rounded-2xl rounded-tr-sm" : "w-full"}`}>

                            {msg.role === "user" ? (
                                <div className="px-5 py-3">{msg.content}</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs text-slate-500">AI Assistant</span>
                                    </div>

                                    {/* Text Content with Typewriter */}
                                    {msg.content && (
                                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 text-slate-200 leading-relaxed shadow-sm whitespace-pre-wrap">
                                            {msg.isTyping ? (
                                                <Typewriter text={msg.content} onComplete={() => {
                                                    // Optional: Mark as done typing to stop re-rendering effect on scroll?
                                                    // For now simple implementation is fine
                                                }} />
                                            ) : (
                                                <span>{msg.content}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Component Content (Itinerary) */}
                                    {msg.component && (
                                        <div className="mt-2 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
                                            {msg.component}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white/50" />
                            </div>
                            <div className="bg-slate-900/50 px-4 py-2 rounded-full border border-white/5 flex gap-1 items-center h-10">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative max-w-4xl mx-auto"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about food, weather, or hidden spots..."
                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pr-14 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-white text-black rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

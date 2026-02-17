import axios from "axios";
import { route } from "ziggy-js";
import { useState, useCallback } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
    confidence?: number;
    escalated?: boolean;
}

interface AIChatWidgetProps {
    businessSlug: string;
    businessName: string;
    /** Use subdomain URL when on subdomain (e.g. acme.alphasite.com) */
    chatUrl?: string;
}

export default function AIChatWidget({
    businessSlug,
    businessName,
    chatUrl,
}: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [preChatComplete, setPreChatComplete] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const apiUrl =
        chatUrl ?? route("alphasite.business.ai.chat.slug", businessSlug);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: Message = { role: "user", content: text.trim() };
            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            try {
                const { data } = await axios.post(apiUrl, {
                    message: text.trim(),
                    conversation_id: conversationId,
                    customer_name: customerName || undefined,
                    customer_email: customerEmail || undefined,
                });

                if (data.success) {
                    setConversationId(data.conversation_id ?? conversationId);
                    const assistantMsg: Message = {
                        role: "assistant",
                        content: data.response,
                        confidence: data.confidence,
                        escalated: data.escalated,
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                } else {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content:
                                data.message ??
                                "Sorry, something went wrong. Please try again.",
                        },
                    ]);
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "Sorry, the chat service is temporarily unavailable. Please try again later.",
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [apiUrl, conversationId, customerName, customerEmail, isLoading]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handlePreChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPreChatComplete(true);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-card rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col max-h-[500px]">
                    <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
                        <div>
                            <h3 className="font-semibold">
                                Chat with {businessName}
                            </h3>
                            <p className="text-xs text-blue-100/90">
                                AI-powered • Available 24/7
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 transition p-1"
                            aria-label="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                        {messages.length === 0 && !preChatComplete && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    👋 Hi! I'm the AI assistant for{" "}
                                    {businessName}. How can I help you today?
                                </p>
                                <form
                                    onSubmit={handlePreChatSubmit}
                                    className="space-y-3"
                                >
                                    <input
                                        type="text"
                                        placeholder="Your name (optional)"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-background"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={customerEmail}
                                        onChange={(e) =>
                                            setCustomerEmail(e.target.value)
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-background"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                        >
                                            Start chat
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreChatComplete(true)
                                            }
                                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                                        >
                                            Skip
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {messages.length === 0 && preChatComplete && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Type your message below to get started.
                            </p>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                        msg.role === "user"
                                            ? "bg-primary text-white"
                                            : "bg-muted text-foreground"
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                    {msg.role === "assistant" &&
                                        msg.escalated && (
                                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 border-t border-amber-200/50 pt-2">
                                                For complex requests, the
                                                business owner may follow up
                                                with you directly.
                                            </p>
                                        )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted text-foreground p-3 rounded-lg text-sm">
                                    <span className="animate-pulse">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
                        <p className="text-[10px] text-muted-foreground">
                            This is an AI assistant. Responses are automated.
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={isLoading || !preChatComplete}
                            />
                            <button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    !input.trim() ||
                                    !preChatComplete
                                }
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm font-medium"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 z-50 transition hover:scale-105 text-xl"
                aria-label="Open chat"
            >
                💬
            </button>
        </>
    );
}

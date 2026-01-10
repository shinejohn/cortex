import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    CheckIcon,
    FileIcon,
    ImageIcon,
    InfoIcon,
    MapPinIcon,
    MessageCircleIcon,
    MicIcon,
    MoreHorizontalIcon,
    PaperclipIcon,
    PhoneIcon,
    PlusIcon,
    SearchIcon,
    SendIcon,
    SmileIcon,
    UserPlusIcon,
    VideoIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Participant {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
    type?: string;
}

interface Message {
    id: string;
    text: string;
    timestamp: string;
    sender: string;
    read: boolean;
}

interface Conversation {
    id: string;
    participants: Participant[];
    name?: string; // For group chats
    avatar?: string; // For group chats
    group?: boolean;
    last_message: {
        text: string;
        timestamp: string;
        read: boolean;
        sender: string;
    };
    unread: number;
}

interface Props {
    conversations: Conversation[];
    selected_conversation?: string;
    messages?: Message[];
    current_user: {
        id: string;
        name: string;
        avatar: string;
    };
}

export default function MessagesIndex({ conversations, selected_conversation, messages = [], current_user }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [messageText, setMessageText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatMessageDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
            });
        }
    };

    const groupMessagesByDate = () => {
        const groups: { date: string; messages: Message[] }[] = [];
        let currentDate = "";

        messages.forEach((message) => {
            const messageDate = new Date(message.timestamp).toDateString();
            if (messageDate !== currentDate) {
                currentDate = messageDate;
                groups.push({
                    date: formatMessageDate(message.timestamp),
                    messages: [message],
                });
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });

        return groups;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selected_conversation) return;

        try {
            await axios.post(`/social/messages/${selected_conversation}`, {
                message: messageText,
            });
            setMessageText("");
            // Reload messages only
            router.reload({ only: ["conversations", "selectedConversation"] });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;

        if (conv.group && conv.name) {
            return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return conv.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const currentConversation = conversations.find((c) => c.id === selected_conversation);

    return (
        <AppLayout>
            <Head title="Messages" />
            <div className="min-h-screen bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row bg-card rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
                        {/* Conversation list */}
                        <div className="md:w-1/3 border-r border flex flex-col">
                            <div className="p-4 border-b border">
                                <h1 className="text-xl font-bold">Messages</h1>
                                <div className="mt-2 relative">
                                    <Input
                                        type="text"
                                        placeholder="Search conversations"
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <button className="text-sm text-primary font-medium">All Messages</button>
                                    <button className="text-sm text-muted-foreground font-medium">Unread</button>
                                    <Link href="/social/messages/new" className="text-sm text-primary font-medium flex items-center">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        New Message
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                {filteredConversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={`/social/messages/${conversation.id}`}
                                        className={`block p-3 border-b border-gray-100 cursor-pointer ${
                                            selected_conversation === conversation.id ? "bg-primary/10" : "hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            {/* Avatar */}
                                            <div className="relative">
                                                {conversation.group ? (
                                                    <img
                                                        src={conversation.avatar}
                                                        alt={conversation.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={conversation.participants[0].avatar}
                                                        alt={conversation.participants[0].name}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                )}
                                                {!conversation.group && conversation.participants[0].online && (
                                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                                                )}
                                                {conversation.participants[0].type === "venue" && (
                                                    <span className="absolute bottom-0 right-0 block h-5 w-5 rounded-full bg-accent ring-2 ring-white text-primary flex items-center justify-center text-xs">
                                                        V
                                                    </span>
                                                )}
                                            </div>

                                            {/* Conversation info */}
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-foreground truncate">
                                                        {conversation.group ? conversation.name : conversation.participants[0].name}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatMessageTime(conversation.last_message.timestamp)}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-sm truncate ${
                                                        conversation.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {conversation.last_message.sender === current_user.id && "You: "}
                                                    {conversation.last_message.text}
                                                </p>
                                            </div>

                                            {/* Unread indicator */}
                                            {conversation.unread > 0 && (
                                                <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {conversation.unread}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Message area */}
                        {selected_conversation && currentConversation ? (
                            <div className="md:w-2/3 flex flex-col">
                                {/* Conversation header */}
                                <div className="p-4 border-b border flex justify-between items-center">
                                    <div className="flex items-center">
                                        {currentConversation.group ? (
                                            <>
                                                <img
                                                    src={currentConversation.avatar}
                                                    alt={currentConversation.name}
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                />
                                                <div className="ml-3">
                                                    <h2 className="text-lg font-medium text-foreground">{currentConversation.name}</h2>
                                                    <p className="text-xs text-muted-foreground">{currentConversation.participants.length} members</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src={currentConversation.participants[0].avatar}
                                                    alt={currentConversation.participants[0].name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div className="ml-3">
                                                    <h2 className="text-lg font-medium text-foreground">{currentConversation.participants[0].name}</h2>
                                                    <p className="text-xs text-muted-foreground">
                                                        {currentConversation.participants[0].online ? "Online now" : "Offline"}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <PhoneIcon className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <VideoIcon className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <InfoIcon className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontalIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 overflow-y-auto bg-muted/50">
                                    {groupMessagesByDate().map((group, groupIndex) => (
                                        <div key={groupIndex} className="mb-6">
                                            <div className="flex justify-center mb-4">
                                                <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">{group.date}</span>
                                            </div>
                                            {group.messages.map((message, messageIndex) => {
                                                const isSelf = message.sender === current_user.id;
                                                const showAvatar = messageIndex === 0 || group.messages[messageIndex - 1].sender !== message.sender;

                                                return (
                                                    <div key={message.id} className={`flex mb-4 ${isSelf ? "justify-end" : "justify-start"}`}>
                                                        {!isSelf && showAvatar && (
                                                            <img
                                                                src={
                                                                    currentConversation?.participants.find((p) => p.id === message.sender)?.avatar ||
                                                                    ""
                                                                }
                                                                alt="Avatar"
                                                                className="h-8 w-8 rounded-full mr-2 mt-1"
                                                            />
                                                        )}
                                                        {!isSelf && !showAvatar && <div className="w-8 mr-2"></div>}
                                                        <div className={`max-w-xs lg:max-w-md ${isSelf ? "order-1" : "order-2"}`}>
                                                            <div
                                                                className={`px-4 py-2 rounded-lg ${
                                                                    isSelf ? "bg-primary text-white" : "bg-card text-gray-800 border border"
                                                                }`}
                                                            >
                                                                <p className="text-sm">{message.text}</p>
                                                            </div>
                                                            <div
                                                                className={`text-xs mt-1 flex items-center ${
                                                                    isSelf ? "justify-end text-muted-foreground" : "justify-start text-muted-foreground"
                                                                }`}
                                                            >
                                                                {formatMessageTime(message.timestamp)}
                                                                {isSelf && (
                                                                    <CheckIcon
                                                                        className={`h-3 w-3 ml-1 ${message.read ? "text-blue-500" : "text-muted-foreground"}`}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message input */}
                                <div className="p-4 border-t border">
                                    <form onSubmit={handleSendMessage} className="flex items-end">
                                        <div className="flex space-x-2 mr-2">
                                            <Button type="button" variant="ghost" size="sm">
                                                <PaperclipIcon className="h-5 w-5" />
                                            </Button>
                                            <div className="relative group">
                                                <Button type="button" variant="ghost" size="sm">
                                                    <PlusIcon className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex-1 relative">
                                            <textarea
                                                placeholder="Type a message..."
                                                className="w-full pl-4 pr-10 py-3 border border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                                                rows={1}
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="ghost" size="sm" className="absolute right-3 bottom-3">
                                                <SmileIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <Button type="submit" className="ml-2 rounded-full" size="sm" disabled={!messageText.trim()}>
                                            <SendIcon className="h-5 w-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="md:w-2/3 flex flex-col items-center justify-center p-8 bg-muted/50">
                                <div className="text-center">
                                    <div className="bg-primary/10 p-6 rounded-full inline-flex items-center justify-center mb-4">
                                        <MessageCircleIcon className="h-12 w-12 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-medium text-foreground mb-2">Your Messages</h2>
                                    <p className="text-muted-foreground mb-6">Select a conversation or start a new one to begin messaging</p>
                                    <Link href="/social/messages/new">
                                        <Button>
                                            <UserPlusIcon className="h-5 w-5 mr-2" />
                                            New Conversation
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

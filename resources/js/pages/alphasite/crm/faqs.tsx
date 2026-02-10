import { Head, Link, useForm } from "@inertiajs/react";
import {
    HelpCircle,
    Plus,
    ChevronRight,
    ChevronDown,
    Search,
    Tag,
    Pencil,
    Trash2,
} from "lucide-react";
import Layout from "@/layouts/layout";
import { useState } from "react";

interface Business {
    id: string;
    name: string;
    slug: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
    is_published?: boolean;
    sort_order?: number;
    created_at: string;
    updated_at?: string;
}

interface Props {
    business: Business;
    faqs: FAQ[] | { data: FAQ[] };
}

export default function CrmFaqs({ business, faqs: faqsProp }: Props) {
    const faqList = Array.isArray(faqsProp) ? faqsProp : faqsProp?.data ?? [];

    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        question: "",
        answer: "",
        category: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/crm/faqs", {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const categories = [...new Set(faqList.filter((f) => f.category).map((f) => f.category!))];

    const filteredFaqs = faqList.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedFaqs = filteredFaqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
        const cat = faq.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
    }, {});

    return (
        <Layout>
            <Head>
                <title>FAQs - {business.name} CRM - AlphaSite</title>
            </Head>

            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 lg:py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
                            <Link href="/crm" className="hover:text-white transition-colors">
                                CRM
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span>FAQs</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-blue-100/90 mt-2">
                                    Manage FAQs for {business.name} ({faqList.length} total)
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                            >
                                <Plus className="h-5 w-5" />
                                Add FAQ
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Add FAQ Form */}
                    {showForm && (
                        <div className="bg-card rounded-2xl border-none shadow-sm p-6 mb-8">
                            <h3 className="font-semibold text-foreground mb-5">Add New FAQ</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
                                        Question
                                    </label>
                                    <input
                                        type="text"
                                        id="question"
                                        value={data.question}
                                        onChange={(e) => setData("question", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder="What question do your customers ask?"
                                    />
                                    {errors.question && <p className="mt-1 text-sm text-destructive">{errors.question}</p>}
                                </div>
                                <div>
                                    <label htmlFor="answer" className="block text-sm font-medium text-foreground mb-2">
                                        Answer
                                    </label>
                                    <textarea
                                        id="answer"
                                        value={data.answer}
                                        onChange={(e) => setData("answer", e.target.value)}
                                        rows={4}
                                        className="w-full border rounded-xl px-4 py-3 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                                        placeholder="Provide a helpful answer..."
                                    />
                                    {errors.answer && <p className="mt-1 text-sm text-destructive">{errors.answer}</p>}
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                                        Category (optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData("category", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder="e.g., Pricing, Hours, Services"
                                        list="faq-categories"
                                    />
                                    <datalist id="faq-categories">
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                    {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                    >
                                        {processing ? "Saving..." : "Save FAQ"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            reset();
                                        }}
                                        className="px-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative max-w-md mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                    </div>

                    {/* FAQ List by Category */}
                    {Object.keys(groupedFaqs).length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag className="h-4 w-4 text-primary" />
                                        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{category}</h2>
                                        <span className="text-sm text-muted-foreground">({categoryFaqs.length})</span>
                                    </div>
                                    <div className="space-y-3">
                                        {categoryFaqs.map((faq) => (
                                            <div key={faq.id} className="bg-card rounded-2xl border-none shadow-sm overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                                                        <span className="font-medium text-foreground">{faq.question}</span>
                                                    </div>
                                                    <ChevronDown
                                                        className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                                                            expandedId === faq.id ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                                {expandedId === faq.id && (
                                                    <div className="px-5 pb-5 pt-0">
                                                        <div className="pl-8 border-l-2 border-primary/20 ml-2.5">
                                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                                <HelpCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {searchQuery ? "No FAQs Match Your Search" : "No FAQs Yet"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Add frequently asked questions to help your customers find answers quickly."}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Your First FAQ
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

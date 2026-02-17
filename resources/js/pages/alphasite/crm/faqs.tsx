import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import AlphasiteCrmLayout from "@/layouts/alphasite-crm-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";

interface BusinessFaq {
    id: string;
    question: string;
    answer: string;
    category: string | null;
    tags: string[] | null;
    variations: string[] | null;
    follow_up_questions: string[] | null;
    times_used: number;
    helpful_votes: number;
    unhelpful_votes: number;
    is_active: boolean;
    display_order: number;
}

interface Props {
    business: {
        id: string;
        name: string;
        slug: string;
        alphasite_subdomain: string | null;
        subscription_tier: string;
        city: string | null;
        state: string | null;
    };
    subscription: {
        tier: string;
        status: string;
        trial_expires_at: string | null;
        ai_services_enabled: string[];
    } | null;
    faqs: BusinessFaq[];
}

export default function CrmFaqs({
    business,
    subscription,
    faqs,
}: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const addForm = useForm({
        question: "",
        answer: "",
        category: "",
    });

    const groupedByCategory = faqs.reduce<Record<string, BusinessFaq[]>>(
        (acc, faq) => {
            const cat = faq.category || "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(faq);
            return acc;
        },
        {}
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route("alphasite.crm.faqs.store") as string, {
            onSuccess: () => {
                setShowAddModal(false);
                addForm.reset();
            },
        });
    };

    return (
        <AlphasiteCrmLayout
            business={business}
            subscription={subscription}
            title="FAQs"
        >
            <Head title={`FAQs | ${business.name}`} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                            FAQs
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Knowledge base for your AI Concierge.</p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add FAQ
                    </Button>
                </div>

                <div className="space-y-8">
                    {Object.entries(groupedByCategory).map(
                        ([category, items]) => (
                            <div key={category} className="space-y-4">
                                <h2 className="text-xl font-semibold tracking-tight text-foreground border-b pb-2">
                                    {category}
                                </h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {items.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                            <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors text-left">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{faq.question}</span>
                                                    {!faq.is_active && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 pt-2">
                                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                        {faq.answer}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted p-2 rounded-md w-fit">
                                                        <span className="flex items-center gap-1">
                                                            <HelpCircle className="h-3 w-3" /> Used {faq.times_used}x
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp className="h-3 w-3" /> {faq.helpful_votes}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsDown className="h-3 w-3" /> {faq.unhelpful_votes}
                                                        </span>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )
                    )}
                </div>

                {faqs.length === 0 && (
                    <div className="border-2 border-dashed border-muted rounded-xl p-12 text-center bg-muted/10">
                        <div className="flex justify-center mb-4">
                            <div className="bg-background rounded-full p-4 shadow-sm">
                                <HelpCircle className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No FAQs yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                            Add frequently asked questions to train your AI Concierge and help customers instantly.
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add your first FAQ
                        </Button>
                    </div>
                )}

                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add FAQ</DialogTitle>
                            <DialogDescription>
                                Create a new question and answer pair for your knowledge base.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="question">Question</Label>
                                <Input
                                    id="question"
                                    value={addForm.data.question}
                                    onChange={(e) => addForm.setData("question", e.target.value)}
                                    placeholder="e.g. What are your hours?"
                                    required
                                />
                                {addForm.errors.question && (
                                    <p className="text-xs text-destructive">{addForm.errors.question}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="answer">Answer</Label>
                                <Textarea
                                    id="answer"
                                    value={addForm.data.answer}
                                    onChange={(e) => addForm.setData("answer", e.target.value)}
                                    placeholder="e.g. We are open 9am-5pm daily."
                                    rows={4}
                                    required
                                />
                                {addForm.errors.answer && (
                                    <p className="text-xs text-destructive">{addForm.errors.answer}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category (Optional)</Label>
                                <Input
                                    id="category"
                                    value={addForm.data.category}
                                    onChange={(e) => addForm.setData("category", e.target.value)}
                                    placeholder="e.g. Operations, Pricing"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addForm.processing}>
                                    {addForm.processing ? "Saving..." : "Save FAQ"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AlphasiteCrmLayout>
    );
}

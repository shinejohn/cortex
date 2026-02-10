import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useForm } from "@inertiajs/react";
import { Lock, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Contact {
    email?: string;
    phone?: string;
}

interface Props {
    contact?: Contact;
    canViewContact: boolean;
    sellerName: string;
    fullWidth?: boolean;
}

export function ClassifiedContactModal({ contact, canViewContact, sellerName, fullWidth }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        message: `Hi, is this still available?`,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("daynews.classifieds.contact"), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    if (!canViewContact) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <Button onClick={() => setIsOpen(true)} className={fullWidth ? "w-full" : ""}>
                    <Lock className="mr-2 size-4" />
                    View Contact Info
                </Button>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-display font-black tracking-tight">Sign in to view contact info</DialogTitle>
                        <DialogDescription>
                            You need to be signed in to view the seller&apos;s contact information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                        <Button asChild>
                            <Link href={route("login")}>Sign In</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route("register")}>Create Account</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const hasContact = contact?.email || contact?.phone;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={fullWidth ? "w-full" : ""}>
                    <Mail className="mr-2 size-4" />
                    Contact Seller
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display font-black tracking-tight">Contact {sellerName}</DialogTitle>
                    <DialogDescription>
                        Send a message to the seller about this item.
                    </DialogDescription>
                </DialogHeader>

                {/* Direct contact info */}
                {hasContact && (
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-semibold text-sm">Direct Contact</h3>
                        {contact?.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <Mail className="size-4" />
                                {contact.email}
                            </a>
                        )}
                        {contact?.phone && (
                            <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <Phone className="size-4" />
                                {contact.phone}
                            </a>
                        )}
                    </div>
                )}

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or send a message</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            rows={4}
                            required
                            className="min-h-[80px] resize-none"
                        />
                        {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing} className="w-full">
                            Send Message
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

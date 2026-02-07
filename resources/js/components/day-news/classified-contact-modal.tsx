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
import { Mail, Phone } from "lucide-react";
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
                alert("Message sent successfully!");
            },
        });
    };

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
                    <DialogTitle>Contact {sellerName}</DialogTitle>
                    <DialogDescription>
                        Send a message to the seller about this item.
                    </DialogDescription>
                </DialogHeader>

                {canViewContact ? (
                    <div className="space-y-4">
                        {contact?.phone && (
                            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <span className="font-medium">{contact.phone}</span>
                            </div>
                        )}
                        {contact?.email && (
                            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <span className="font-medium">{contact.email}</span>
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
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData("message", e.target.value)}
                                    rows={4}
                                    required
                                />
                                {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing} className="w-full">
                                    Send Message
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4 py-4 text-center">
                        <p className="text-muted-foreground">
                            You must be logged in to view contact information or send messages.
                        </p>
                        <Button asChild className="w-full">
                            <Link href={route("login")}>Log In / Register</Link>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

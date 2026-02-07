import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Auth } from "@/types";
import type { Comment } from "@/types/coupon";
import { Link, useForm } from "@inertiajs/react";
import { MessageSquare, Send } from "lucide-react";
import { FormEventHandler } from "react";
import { route } from "ziggy-js";

interface Props {
    couponId: number;
    comments: Comment[];
    auth?: Auth;
}

export function CouponCommentSection({ couponId, comments, auth }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        content: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("daynews.coupons.comments.store", couponId), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                <h2 className="text-lg font-bold">Comments ({comments.length})</h2>
            </div>

            {auth?.user ? (
                <form onSubmit={submit} className="flex gap-4">
                    <Avatar>
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback>{auth.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Ask a question or share your experience..."
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            rows={3}
                            className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing || !data.content.trim()}>
                                <Send className="mr-2 size-4" />
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    Please <Link href={route('login')} className="font-medium underline hover:text-primary">log in</Link> to post a comment.
                </div>
            )}

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{comment.user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

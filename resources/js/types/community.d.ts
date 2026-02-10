import type { SharedData } from "./index";

/** Thread types for community discussions */
export const THREAD_TYPES = {
    DISCUSSION: "Discussion",
    QUESTION: "Question",
    ANNOUNCEMENT: "Announcement",
    RESOURCE: "Resource",
    EVENT: "Event",
} as const;

export type ThreadType = (typeof THREAD_TYPES)[keyof typeof THREAD_TYPES];

/** Available thread types array for easier iteration */
export const THREAD_TYPE_ARRAY: ThreadType[] = ["Discussion", "Question", "Announcement", "Resource", "Event"];

/** Community thread author information */
export interface ThreadAuthor {
    readonly id: string;
    readonly name: string;
    readonly avatar: string;
    readonly role: string;
}

/** Community thread reply data structure */
export interface CommunityThreadReply {
    readonly id: string;
    readonly content: string;
    readonly images: readonly string[];
    readonly likesCount: number;
    readonly isLiked: boolean; // Indicates if current user liked this reply
    readonly isSolution: boolean;
    readonly isPinned: boolean;
    readonly isEdited: boolean;
    readonly editedAt: string | null;
    readonly createdAt: string;
    readonly author: ThreadAuthor;
    readonly replyToId: string | null;
    readonly replies: readonly CommunityThreadReply[];
}

/** Community thread data structure */
export interface CommunityThread {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly preview: string;
    readonly type: ThreadType;
    readonly tags: readonly string[];
    readonly viewsCount: number; // Renamed from views
    readonly replyCount: number;
    readonly isPinned: boolean;
    readonly isLocked: boolean;
    readonly createdAt: string;
    readonly author: ThreadAuthor;
}

/** Community information */
export interface Community {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly description: string;
    readonly image: string | undefined;
    readonly memberCount: number;
    readonly threadCount: number;
    readonly categories: readonly string[];
    readonly threadTypes: readonly ThreadType[];
    readonly popularTags: readonly string[];
}

/** Community filters for searching and filtering threads */
export interface CommunityFilters {
    readonly threadType: string;
    readonly tag: string;
    readonly author: string;
    readonly search?: string;
    readonly dateRange: string;
    readonly sortBy: "recent" | "popular" | "unanswered";
}

/** Community statistics */
export interface CommunityStats {
    readonly members: number;
    readonly threads: number;
    readonly activeToday: number;
    readonly newThisWeek: number;
}

/** Page props for community index */
export interface ShowcaseItem {
    readonly id: number;
    readonly image: string;
    readonly title: string;
    readonly eventUrl: string;
    readonly stats: {
        readonly events: number;
        readonly venues: number;
        readonly performers: number;
    };
}

export interface CommunityIndexPageProps extends SharedData {
    readonly communities: readonly Community[];
    readonly showcaseData?: readonly ShowcaseItem[];
}

/** Page props for community show page */
export interface CommunityShowPageProps extends SharedData {
    readonly community: Community;
    readonly threads: {
        readonly data: readonly CommunityThread[];
        readonly links: Record<string, unknown>;
        readonly meta: Record<string, unknown>;
    };
    readonly filters: Partial<CommunityFilters>;
    readonly sort: {
        readonly sortBy: CommunityFilters["sortBy"];
    };
}

/** Props for creating a new thread */
export interface CreateCommunityThreadPageProps extends SharedData {
    readonly community: Pick<Community, "id" | "name" | "threadTypes" | "popularTags">;
}

/** Props for viewing a single thread */
export interface ThreadPageProps extends SharedData {
    readonly community: Pick<Community, "id" | "name">;
    readonly thread: CommunityThread;
    readonly replies: readonly CommunityThreadReply[];
}

/** Form data for creating a new thread */
export interface CreateThreadData {
    readonly title: string;
    readonly content: string;
    readonly type: ThreadType;
    readonly tags: readonly string[];
}

/** Form data for updating a thread */
export interface UpdateThreadData extends Partial<CreateThreadData> {
    readonly id: string;
}

/** Form data for creating a new reply */
export interface CreateReplyData {
    readonly content: string;
    readonly replyToId?: string;
}

/** Community thread actions */
export interface ThreadActions {
    readonly onView: (thread: CommunityThread) => void;
    readonly onShare: (thread: CommunityThread) => void;
    readonly onEdit?: (thread: CommunityThread) => void;
    readonly onDelete?: (thread: CommunityThread) => void;
    readonly onPin?: (thread: CommunityThread) => void;
    readonly onLock?: (thread: CommunityThread) => void;
}

/** Community card props for rendering community list */
export interface CommunityCardProps {
    readonly community: Community;
    readonly onClick: (community: Community) => void;
}

/** Thread card props for rendering thread list */
export interface ThreadCardProps {
    readonly thread: CommunityThread;
    readonly communitySlug: string;
    readonly actions?: Partial<ThreadActions>;
    readonly onClick: (thread: CommunityThread) => void;
}

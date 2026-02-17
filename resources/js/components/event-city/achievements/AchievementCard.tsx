import { CheckCircleIcon, CompassIcon, HeartIcon, LockIcon, UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AchievementProgress } from './AchievementProgress';

interface AchievementCardProps {
    name: string;
    description: string;
    category: string;
    currentProgress: number;
    targetValue: number;
    pointsAwarded: number;
    isCompleted: boolean;
    completedAt?: string | null;
}

function getCategoryIcon(category: string) {
    switch (category) {
        case 'explorer':
            return <CompassIcon className="h-6 w-6" />;
        case 'social':
            return <UsersIcon className="h-6 w-6" />;
        case 'supporter':
            return <HeartIcon className="h-6 w-6" />;
        default:
            return <CompassIcon className="h-6 w-6" />;
    }
}

function getCategoryColor(category: string): string {
    switch (category) {
        case 'explorer':
            return 'text-blue-500';
        case 'social':
            return 'text-green-500';
        case 'supporter':
            return 'text-amber-500';
        default:
            return 'text-muted-foreground';
    }
}

export function AchievementCard({
    name,
    description,
    category,
    currentProgress,
    targetValue,
    pointsAwarded,
    isCompleted,
    completedAt,
}: AchievementCardProps) {
    return (
        <Card
            className={`relative overflow-hidden transition-all ${
                isCompleted ? 'border-primary/30 bg-primary/5' : 'opacity-80 hover:opacity-100'
            }`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            isCompleted ? 'bg-primary/10' : 'bg-muted'
                        } ${getCategoryColor(category)}`}
                    >
                        {isCompleted ? (
                            <CheckCircleIcon className="h-6 w-6 text-primary" />
                        ) : (
                            getCategoryIcon(category)
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
                            {isCompleted && (
                                <Badge variant="secondary" className="shrink-0 text-xs">
                                    +{pointsAwarded} pts
                                </Badge>
                            )}
                            {!isCompleted && (
                                <LockIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>

                        {!isCompleted && (
                            <div className="mt-2">
                                <AchievementProgress current={currentProgress} target={targetValue} />
                            </div>
                        )}

                        {isCompleted && completedAt && (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                Unlocked {new Date(completedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

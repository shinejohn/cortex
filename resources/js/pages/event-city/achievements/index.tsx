import { Head } from '@inertiajs/react';
import { CompassIcon, HeartIcon, StarIcon, TrophyIcon, UsersIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementCard } from '@/components/event-city/achievements/AchievementCard';

interface AchievementProgress {
    id: string;
    achievement_slug: string;
    category: string;
    current_progress: number;
    target_value: number;
    completed_at: string | null;
    points_awarded: number;
}

interface AchievementDefinition {
    slug: string;
    name: string;
    description: string;
    category: string;
    target: number;
    points: number;
}

interface Props {
    achievements: AchievementProgress[];
    definitions: AchievementDefinition[];
    totalPoints: number;
}

const categoryConfig: Record<string, { label: string; icon: typeof CompassIcon; color: string }> = {
    explorer: { label: 'Explorer', icon: CompassIcon, color: 'text-blue-500' },
    social: { label: 'Social', icon: UsersIcon, color: 'text-green-500' },
    supporter: { label: 'Supporter', icon: HeartIcon, color: 'text-amber-500' },
};

export default function AchievementsIndex({ achievements, definitions, totalPoints }: Props) {
    const categories = ['explorer', 'social', 'supporter'];

    const completedCount = achievements.filter((a) => a.completed_at !== null).length;

    const getProgressForDefinition = (definition: AchievementDefinition): AchievementProgress | undefined => {
        return achievements.find((a) => a.achievement_slug === definition.slug);
    };

    return (
        <AppLayout>
            <Head title="Achievements" />
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <TrophyIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
                                <p className="text-muted-foreground">
                                    Track your progress and unlock badges
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats overview */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <StarIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
                                    <p className="text-xs text-muted-foreground">Total Points</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                    <TrophyIcon className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                                    <p className="text-xs text-muted-foreground">Unlocked</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <CompassIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {definitions.length - completedCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Remaining</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Achievement categories */}
                    {categories.map((categoryKey) => {
                        const config = categoryConfig[categoryKey];
                        const CategoryIcon = config.icon;
                        const categoryDefinitions = definitions.filter((d) => d.category === categoryKey);

                        if (categoryDefinitions.length === 0) {
                            return null;
                        }

                        return (
                            <div key={categoryKey} className="mb-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CategoryIcon className={`h-5 w-5 ${config.color}`} />
                                            {config.label}
                                            <Badge variant="secondary" className="ml-auto">
                                                {categoryDefinitions.filter(
                                                    (d) => getProgressForDefinition(d)?.completed_at,
                                                ).length}{' '}
                                                / {categoryDefinitions.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {categoryDefinitions.map((definition) => {
                                                const progress = getProgressForDefinition(definition);

                                                return (
                                                    <AchievementCard
                                                        key={definition.slug}
                                                        name={definition.name}
                                                        description={definition.description}
                                                        category={definition.category}
                                                        currentProgress={progress?.current_progress ?? 0}
                                                        targetValue={definition.target}
                                                        pointsAwarded={
                                                            progress?.points_awarded ?? definition.points
                                                        }
                                                        isCompleted={progress?.completed_at !== null && progress?.completed_at !== undefined}
                                                        completedAt={progress?.completed_at}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}

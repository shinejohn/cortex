interface AchievementProgressProps {
    current: number;
    target: number;
    className?: string;
}

export function AchievementProgress({ current, target, className = '' }: AchievementProgressProps) {
    const percentage = Math.min(100, Math.round((current / target) * 100));

    return (
        <div className={`space-y-1 ${className}`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {current} / {target}
                </span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    size?: "sm" | "default";
}

export default function PageHeader({
    title,
    subtitle,
    children,
    size = "default",
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1
                    className={
                        size === "sm"
                            ? "text-xl font-semibold sm:text-xl"
                            : "text-2xl font-bold sm:text-3xl"
                    }
                >
                    {title}
                </h1>

                {subtitle && (
                    <div className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
                        {subtitle}
                    </div>
                )}
            </div>

            {children && (
                <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    {children}
                </div>
            )}
        </div>
    );
}
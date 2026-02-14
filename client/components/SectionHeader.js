
export default function SectionHeader({ title, subtitle }) {
    return (
        <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2 relative inline-block">
                {title}
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full" />
            </h2>
            {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>
    );
}

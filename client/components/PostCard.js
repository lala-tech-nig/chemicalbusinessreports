import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PostCard({ title, excerpt, image, category, date, author, slug, excerptColor, className }) {
    return (
        <div className={cn("group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-102"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    {category}
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center text-xs text-muted-foreground mb-3 space-x-3">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {date}
                    </div>
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {author}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/posts/${slug}`}>
                        <span className="absolute inset-0" />
                        {title}
                    </Link>
                </h3>

                {excerpt && (
                    <p
                        className="text-sm line-clamp-3 mb-4 flex-1 px-2 py-1 rounded-md"
                        style={{
                            backgroundColor: excerptColor || 'transparent',
                            color: excerptColor ? '#1a1a1a' : undefined,
                        }}
                    >
                        {excerpt}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-primary text-sm font-medium group-hover:underline">
                        {category === "News Roundup" ? "Read Summary →" : "Read Article →"}
                    </span>
                </div>
            </div>
        </div>
    );
}

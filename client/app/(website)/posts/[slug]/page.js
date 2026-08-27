import SinglePostClient from "@/components/SinglePostClient";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "https://chemicalbusinessreports-f078.onrender.com/api");

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.chemicalbusinessreports.net";

/**
 * Convert any image URL into a WhatsApp-optimised OG image.
 * – Cloudinary URLs get an automatic c_fill,w_1200,h_630,q_85,f_jpg transform
 *   so the image is always a compressed JPEG ≤ 300 KB (WhatsApp's threshold).
 * – Other HTTPS URLs are returned as-is.
 * – Relative URLs are prefixed with the Render backend origin.
 */
function getAbsoluteImageUrl(imgUrl) {
    if (!imgUrl) return `${SITE_URL}/og-default.jpg`;

    // Enforce HTTPS
    let url = imgUrl.replace(/^http:\/\//i, "https://");

    // For Cloudinary images: inject the transformation pipeline
    // before the version segment (v123456) so it becomes:
    //   .../image/upload/c_fill,w_1200,h_630,q_85,f_jpg/v123456/...
    if (url.includes("res.cloudinary.com")) {
        url = url.replace(
            /\/image\/upload\/(v\d+\/)/,
            "/image/upload/c_fill,w_1200,h_630,q_85,f_jpg/$1"
        );
        // Handle URLs that don't have a version segment
        if (!url.includes("c_fill")) {
            url = url.replace(
                /\/image\/upload\//,
                "/image/upload/c_fill,w_1200,h_630,q_85,f_jpg/"
            );
        }
        // Cloudinary images are already HTTPS and public — return directly
        return url;
    }

    if (url.startsWith("https://")) return url;

    const origin =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        "https://chemicalbusinessreports-f078.onrender.com";
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}


async function getPost(slug) {
    try {
        const res = await fetch(`${API_URL}/posts/${slug}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Error fetching post for metadata:", err);
        return null;
    }
}

// ── Server-Side Metadata Generation for Social Share (WhatsApp, X, LinkedIn, Facebook) ──
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) {
        return {
            title: "Story | Chemical Business Reports"
        };
    }

    const post = await getPost(slug);

    if (!post) {
        return {
            title: "Story Not Found | Chemical Business Reports",
            description: "The requested chemical business report could not be found."
        };
    }

    const title = post.title || "Chemical Business Reports";
    const rawDescription = post.excerpt || post.content?.replace(/<[^>]*>?/gm, "").slice(0, 180) || "Authoritative chemical market news, business reports, and industrial analysis.";
    const description = rawDescription.trim();
    const imageUrl = getAbsoluteImageUrl(post.image);
    const postUrl = `${SITE_URL}/posts/${slug}`;
    // Cloudinary transform forces f_jpg, so always declare JPEG for WhatsApp
    const imageType = "image/jpeg";

    return {
        title: `${title} | Chemical Business Reports`,
        description,
        alternates: {
            canonical: postUrl
        },
        openGraph: {
            title,
            description,
            url: postUrl,
            siteName: "Chemical Business Reports",
            locale: "en_US",
            type: "article",
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt || post.createdAt,
            authors: [post.author || "Chemical Business Reports Editorial Team"],
            section: post.category || "News Roundup",
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                    type: imageType
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
            creator: "@ChemicalReports",
            site: "@ChemicalReports"
        }
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const initialPost = await getPost(slug);

    return <SinglePostClient slug={slug} initialPost={initialPost} />;
}

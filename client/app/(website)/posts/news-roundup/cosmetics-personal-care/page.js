import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Cosmetics & Personal Care | News Roundup | Chemical Business Reports",
    description: "Latest cosmetics and personal care industry news from Chemical Business Reports.",
};

export default function CosmeticsPersonalCarePage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Cosmetics & Personal Care"
            description="Trends, innovations and market news across cosmetics, skincare, and personal care products."
        />
    );
}

import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "News Roundup | Chemical Business Reports",
    description: "Latest news and updates from the chemical and allied industries.",
};

export default function NewsRoundupPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            description="Stay current with the latest news and developments across the chemical and allied industries."
        />
    );
}

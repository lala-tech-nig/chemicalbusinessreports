import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Industries Chemical | News Roundup | Chemical Business Reports",
    description: "Industrial chemicals industry news and updates from Chemical Business Reports.",
};

export default function IndustriesChemicalPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Industries Chemical"
            description="Insights, regulatory updates and market developments across industrial chemicals and manufacturing."
        />
    );
}

import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Pharma | News Roundup | Chemical Business Reports",
    description: "Latest pharmaceutical industry news and updates from Chemical Business Reports.",
};

export default function PharmaPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Pharma"
            description="Pharmaceutical industry news, drug approvals, research breakthroughs and regulatory updates."
        />
    );
}

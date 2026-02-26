import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Corporate Profile | Chemical Business Reports",
    description: "Spotlights and profiles of leading organisations in the chemical and allied industries.",
};

export default function CorporateProfilePage() {
    return (
        <CategoryPage
            categoryName="Corporate Profile"
            description="Spotlighting the companies, executives, and organisations shaping the chemical industry landscape."
        />
    );
}

import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Chemical Mart | Chemical Business Reports",
    description: "Browse products and services from vendors in the chemical marketplace.",
};

export default function ChemicalMartPage() {
    return (
        <CategoryPage
            categoryName="Chemical Mart"
            description="A curated marketplace showcasing products and services from leading chemical vendors and manufacturers."
            hideFeatured={true}
        />
    );
}

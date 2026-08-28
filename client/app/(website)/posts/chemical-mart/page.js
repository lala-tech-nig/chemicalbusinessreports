import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Chemical Business Mart | Chemical Business Reports",
    description: "Browse products and services from vendors in the chemical marketplace.",
};

export default function ChemicalMartPage() {
    return (
        <CategoryPage
            categoryName="Chemical Business Mart"
            apiCategoryName="Chemical Mart"
            description="A curated marketplace showcasing products and services from leading chemical vendors and manufacturers."
            hideFeatured={true}
            categoryFilters={[
                "Raw Materials",
                "Finished Products",
                "Equipment & Machinery",
                "Lab Supplies",
                "Safety & PPE",
                "Services",
            ]}
        />
    );
}


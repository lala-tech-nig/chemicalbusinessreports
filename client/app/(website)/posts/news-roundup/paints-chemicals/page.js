import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Paints & Chemicals | News Roundup | Chemical Business Reports",
    description: "News and updates on paints, coatings, and specialty chemicals from Chemical Business Reports.",
};

export default function PaintsChemicalsPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Paints & Chemicals"
            description="Market updates, new product launches and regulatory news in paints, coatings and speciality chemicals."
        />
    );
}

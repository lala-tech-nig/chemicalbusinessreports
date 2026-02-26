import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Start Up | Chemical Business Reports",
    description: "Stories and features on emerging startups in the chemical and allied industries.",
};

export default function StartupPage() {
    return (
        <CategoryPage
            categoryName="Start Up"
            description="Celebrating emerging businesses and entrepreneurs driving innovation in the chemical sector."
        />
    );
}

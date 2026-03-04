import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Beverages | News Roundup | Chemical Business Reports",
    description: "Beverages industry news and market updates from Chemical Business Reports.",
};

export default function BeveragesPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Beverages"
            description="Latest news, trends and innovations across Nigeria's beverages and drinks industry."
        />
    );
}

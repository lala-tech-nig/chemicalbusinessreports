import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Brewing, Foods & Drinks | News Roundup | Chemical Business Reports",
    description: "News and analysis on brewing, food production and the drinks industry from Chemical Business Reports.",
};

export default function BrewingFoodsDrinksPage() {
    return (
        <CategoryPage
            categoryName="News Roundup"
            subcategoryName="Brewing, Foods & Drinks"
            description="Covering the brewing, food manufacturing and beverages sectors — ingredients, regulations and market trends."
        />
    );
}

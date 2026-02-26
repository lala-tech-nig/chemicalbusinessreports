import CategoryPage from "@/components/CategoryPage";

export const metadata = {
    title: "Executive Brief | Chemical Business Reports",
    description: "Exclusive interviews and briefings from industry leaders and C-suite executives.",
};

export default function ExecutiveBriefPage() {
    return (
        <CategoryPage
            categoryName="Executive Brief"
            description="Exclusive interviews, insights, and perspectives from C-suite leaders shaping the chemical industry."
        />
    );
}

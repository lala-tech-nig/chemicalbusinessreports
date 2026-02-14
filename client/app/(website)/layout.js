import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdModal from "@/components/AdModal";
import UserDataModal from "@/components/UserDataModal";

export default function WebsiteLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
            <AdModal />
            <UserDataModal />
        </div>
    );
}

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col app-bg">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1700px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
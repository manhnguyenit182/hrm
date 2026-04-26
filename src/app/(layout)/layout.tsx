import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { PrimeReactProvider } from "primereact/api";
import { AppContextProvider } from "./AppContext";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrimeReactProvider>
      <AppContextProvider>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex flex-col flex-1 min-h-0 h-screen">
            <Topbar />
            <main className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="max-w-full mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </AppContextProvider>
    </PrimeReactProvider>
  );
}

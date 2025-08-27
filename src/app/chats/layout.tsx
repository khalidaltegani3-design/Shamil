
import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      <Header onMenuClick={() => {}} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNavbar />
    </div>
  );
}

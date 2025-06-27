import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="print-hidden">
        <AppSidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="print-hidden">
          <AppHeader />
        </div>
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 print:bg-white print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}

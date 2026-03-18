import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

export default async function DashboardLayout({ children }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

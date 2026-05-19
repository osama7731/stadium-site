import { Link } from "wouter";
import { ReactNode } from "react";
import { CalendarDays, Search, MapPin, Phone, LayoutDashboard } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary-foreground" />
              </div>
              ملاعب
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/bookings" className="text-sm font-medium hover:text-primary transition-colors">
              جميع الحجوزات
            </Link>
            <Link href="/booking/lookup" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Search className="w-4 h-4" />
              بحث عن حجز
            </Link>
            <Link href="/admin" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              الإدارة
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4" />
              المملكة العربية السعودية
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-secondary py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-xl mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-primary-foreground" />
              </div>
              ملاعب
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
              المنصة الرائدة لحجز الملاعب الرياضية في المملكة العربية السعودية. تجربة حجز سلسة، سريعة، وموثوقة.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/booking/lookup" className="hover:text-primary transition-colors">البحث عن حجز</Link></li>
              <li><Link href="/bookings" className="hover:text-primary transition-colors">قائمة الحجوزات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">0531932768</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                المملكة العربية السعودية
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border pt-8">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} منصة ملاعب
        </div>
      </footer>
    </div>
  );
}

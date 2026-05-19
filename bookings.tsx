import { useListBookings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: {
    label: "بانتظار الدفع",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "مؤكد",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "ملغي",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const DURATION_LABELS: Record<string, string> = {
  half_hour: "30 دقيقة",
  one_hour: "ساعة واحدة",
  three_hours: "3 ساعات",
};

export function Bookings() {
  const { data: bookings, isLoading } = useListBookings();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">جميع الحجوزات</h1>
          <p className="text-muted-foreground text-sm">
            {bookings ? `${bookings.length} حجز` : "جاري التحميل..."}
          </p>
        </div>
        <Link href="/">
          <button className="text-sm text-primary hover:underline font-medium" data-testid="link-home">
            العودة للرئيسية
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {[...bookings].reverse().map((booking, i) => {
            const statusConf = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="bg-card hover:border-primary/40 transition-colors" data-testid={`card-booking-${booking.id}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-base">{booking.fieldName}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusConf.bg} ${statusConf.color}`}
                            data-testid={`status-booking-${booking.id}`}
                          >
                            {statusConf.icon}
                            {statusConf.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {booking.bookingDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {booking.startTime} — {booking.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {DURATION_LABELS[booking.durationKey] ?? booking.durationKey}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {booking.customerName} · {booking.customerPhone}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-xl font-black text-primary">${booking.totalPrice}</div>
                        <div
                          className="font-mono text-xs tracking-widest bg-secondary px-3 py-1.5 rounded-lg border border-border"
                          data-testid={`code-booking-${booking.id}`}
                        >
                          {booking.bookingCode}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-secondary/30 rounded-2xl border border-dashed">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-xl font-semibold mb-2">لا توجد حجوزات بعد</h3>
          <p className="text-muted-foreground mb-6">ابدأ بحجز أول ملعب لك</p>
          <Link href="/">
            <button className="text-primary text-sm font-medium hover:underline">استكشف الملاعب</button>
          </Link>
        </div>
      )}
    </div>
  );
}

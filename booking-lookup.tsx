import { useState } from "react";
import { useGetBookingByCode, getGetBookingByCodeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "بانتظار الدفع", color: "text-yellow-400", icon: <AlertCircle className="w-4 h-4" /> },
  confirmed: { label: "مؤكد", color: "text-primary", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: "ملغي", color: "text-destructive", icon: <XCircle className="w-4 h-4" /> },
};

const DURATION_LABELS: Record<string, string> = {
  half_hour: "30 دقيقة",
  one_hour: "ساعة واحدة",
  three_hours: "3 ساعات",
};

export function BookingLookup() {
  const [inputCode, setInputCode] = useState("");
  const [searchCode, setSearchCode] = useState<string | null>(null);

  const { data: booking, isLoading, isError } = useGetBookingByCode(
    searchCode ?? "",
    {
      query: {
        enabled: !!searchCode,
        queryKey: getGetBookingByCodeQueryKey(searchCode ?? ""),
        retry: false,
      },
    }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchCode(inputCode.trim().toUpperCase());
    }
  }

  const statusInfo = booking ? STATUS_LABELS[booking.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-16 max-w-lg"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">البحث عن حجز</h1>
        <p className="text-muted-foreground">أدخل كود الحجز للاطلاع على تفاصيل حجزك</p>
      </div>

      <Card className="bg-card border-border mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="booking-code" className="text-sm font-medium mb-2 block">كود الحجز</Label>
              <Input
                id="booking-code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="مثال: AB3X7YZQ"
                className="text-center text-xl font-mono tracking-widest h-14"
                maxLength={8}
                dir="ltr"
                data-testid="input-booking-code"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl"
              disabled={!inputCode.trim() || isLoading}
              data-testid="button-search"
            >
              {isLoading ? "جاري البحث..." : "بحث"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && searchCode && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      )}

      {isError && searchCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 bg-secondary/30 rounded-2xl border border-dashed"
        >
          <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold mb-1">لم يتم العثور على الحجز</h3>
          <p className="text-sm text-muted-foreground">تأكد من صحة الكود وحاول مجدداً</p>
        </motion.div>
      )}

      {booking && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Booking Code Display */}
          <div className="bg-card border-2 border-primary/40 rounded-2xl p-6 mb-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">كود الحجز</p>
            <div className="text-4xl font-black tracking-[0.3em] text-primary font-mono mb-3" data-testid="text-result-code">
              {booking.bookingCode}
            </div>
            {statusInfo && (
              <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> الملعب
              </span>
              <span className="font-semibold" data-testid="text-result-field">{booking.fieldName}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> التاريخ
              </span>
              <span className="font-semibold">{booking.bookingDate}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> الوقت
              </span>
              <span className="font-semibold">{booking.startTime} — {booking.endTime}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground">المدة</span>
              <span className="font-semibold">{DURATION_LABELS[booking.durationKey] ?? booking.durationKey}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-semibold">{booking.customerName}</span>
            </div>
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-muted-foreground">المبلغ</span>
              <span className="font-bold text-primary text-base">${booking.totalPrice}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

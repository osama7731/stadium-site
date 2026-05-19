import { useSearch, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Copy, MapPin, Clock, Calendar, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function BookingConfirm() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const bookingId = parseInt(params.get("bookingId") ?? "0");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: booking, isLoading } = useGetBooking(bookingId, {
    query: { enabled: !!bookingId, queryKey: getGetBookingQueryKey(bookingId) },
  });

  function copyCode() {
    if (booking?.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const DURATION_LABELS: Record<string, string> = {
    half_hour: "30 دقيقة",
    one_hour: "ساعة واحدة",
    three_hours: "3 ساعات",
  };

  if (isLoading || !booking) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg">
        <Skeleton className="h-10 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const qrValue = `BOOKING:${booking.bookingCode}|FIELD:${booking.fieldName}|DATE:${booking.bookingDate}|TIME:${booking.startTime}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-16 max-w-lg"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-extrabold mb-2">تم الحجز بنجاح</h1>
        <p className="text-muted-foreground">
          احتفظ بكود الحجز أو QR Code وأظهره عند الوصول للملعب
        </p>
      </div>

      {/* Booking Code + QR Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border-2 border-primary/40 rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="relative">
          {/* Toggle tabs */}
          <div className="flex bg-secondary rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => setShowQR(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                !showQR
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-code"
            >
              الكود
            </button>
            <button
              onClick={() => setShowQR(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                showQR
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-qr"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          </div>

          {!showQR ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm text-muted-foreground mb-3 font-medium">كود الحجز</p>
              <div
                className="text-5xl font-black tracking-[0.3em] text-primary mb-5 font-mono"
                data-testid="text-booking-code"
              >
                {booking.bookingCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="gap-2 rounded-full border-primary/30 hover:border-primary"
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4" />
                {copied ? "تم النسخ ✓" : "نسخ الكود"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center"
            >
              <p className="text-sm text-muted-foreground mb-4 font-medium">امسح الكود للتحقق من الحجز</p>
              <div className="bg-white p-4 rounded-2xl shadow-lg shadow-black/20 mb-4">
                <QRCodeSVG
                  value={qrValue}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#14532d"
                  level="H"
                  data-testid="qr-code"
                />
              </div>
              <div className="text-xs text-muted-foreground font-mono tracking-widest">
                {booking.bookingCode}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Booking Details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl divide-y divide-border mb-8"
      >
        <div className="flex items-center justify-between p-4 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> الملعب
          </span>
          <span className="font-semibold" data-testid="text-field-name">{booking.fieldName}</span>
        </div>
        <div className="flex items-center justify-between p-4 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> التاريخ
          </span>
          <span className="font-semibold" data-testid="text-booking-date">{booking.bookingDate}</span>
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
          <span className="text-muted-foreground">المبلغ المدفوع</span>
          <span className="font-bold text-primary text-base" data-testid="text-total-price">${booking.totalPrice}</span>
        </div>
      </motion.div>

      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground text-center mb-8 border border-border">
        أظهر كود الحجز أو QR Code عند وصولك للملعب. يمكنك البحث عن حجزك في أي وقت باستخدام هذا الكود.
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={() => setLocation("/booking/lookup")}
          data-testid="button-lookup"
        >
          البحث عن حجز
        </Button>
        <Button
          className="flex-1 rounded-xl font-bold"
          onClick={() => setLocation("/")}
          data-testid="button-home"
        >
          العودة للرئيسية
        </Button>
      </div>
    </motion.div>
  );
}

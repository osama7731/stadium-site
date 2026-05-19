import { useState } from "react";
import {
  useGetStatsSummary,
  useGetRevenueStats,
  useListBookings,
  useUpdateBookingStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  CalendarDays,
  CheckCircle,
  Clock,
  Trophy,
  Lock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ADMIN_PASSWORD = "admin1234";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "بانتظار الدفع",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "مؤكد",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "ملغي",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const DURATION_LABELS: Record<string, string> = {
  half_hour: "30 د",
  one_hour: "ساعة",
  three_hours: "3 ساعات",
};

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-xl">لوحة الإدارة</CardTitle>
            <p className="text-sm text-muted-foreground">أدخل كلمة المرور للدخول</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="كلمة المرور"
                className={`text-center ${err ? "border-destructive" : ""}`}
                autoFocus
                data-testid="input-admin-password"
              />
              {err && (
                <p className="text-sm text-destructive text-center">كلمة المرور غير صحيحة</p>
              )}
              <Button type="submit" className="w-full font-bold" data-testid="button-admin-login">
                دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueStats();
  const { data: bookings, isLoading: bookingsLoading } = useListBookings();
  const updateStatus = useUpdateBookingStatus();

  const chartData = revenue?.slice(-14).map((d) => ({
    date: d.date.slice(5),
    إيرادات: d.revenue,
    حجوزات: d.bookings,
  }));

  const filtered =
    filterStatus === "all"
      ? bookings
      : bookings?.filter((b) => b.status === filterStatus);

  async function changeStatus(id: number, newStatus: string) {
    try {
      await updateStatus.mutateAsync({ id, data: { status: newStatus } });
      await queryClient.invalidateQueries();
      toast({ title: "تم التحديث", description: `تم تغيير الحالة إلى: ${STATUS_CONFIG[newStatus]?.label}` });
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحديث الحالة", variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">لوحة الإدارة</h1>
          <p className="text-muted-foreground text-sm">إدارة الحجوزات ومتابعة الإيرادات</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => queryClient.invalidateQueries()}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="إجمالي الإيرادات"
              value={`$${stats?.totalRevenue ?? 0}`}
              highlight
            />
            <StatCard
              icon={<CalendarDays className="w-5 h-5" />}
              label="إجمالي الحجوزات"
              value={stats?.totalBookings ?? 0}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="مؤكدة"
              value={stats?.confirmedBookings ?? 0}
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="بانتظار الدفع"
              value={stats?.pendingBookings ?? 0}
            />
          </>
        )}
      </div>

      {/* Revenue Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            الإيرادات اليومية — آخر 14 يوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(240 5% 64.9%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240 5% 64.9%)" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 10% 3.9%)",
                    border: "1px solid hsl(240 3.7% 15.9%)",
                    borderRadius: "0.75rem",
                    fontSize: 13,
                    direction: "rtl",
                  }}
                  labelStyle={{ color: "hsl(0 0% 98%)" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="إيرادات" fill="hsl(142.1 70.6% 45.3%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
              لا توجد بيانات إيرادات بعد
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">الحجوزات</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "confirmed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    filterStatus === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                  data-testid={`filter-${s}`}
                >
                  {s === "all" ? "الكل" : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsLoading ? (
            <div className="p-6 space-y-3">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {[...filtered].reverse().map((booking) => {
                const sc = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
                return (
                  <div
                    key={booking.id}
                    className="p-4 sm:p-5 hover:bg-secondary/30 transition-colors"
                    data-testid={`admin-booking-${booking.id}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{booking.fieldName}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}
                          >
                            {sc.icon} {sc.label}
                          </span>
                          <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">
                            {booking.bookingCode}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                          <span>{booking.customerName} · {booking.customerPhone}</span>
                          <span>{booking.bookingDate} · {booking.startTime}–{booking.endTime}</span>
                          <span>{DURATION_LABELS[booking.durationKey] ?? booking.durationKey}</span>
                          <span className="text-primary font-semibold">${booking.totalPrice}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {booking.status !== "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                            onClick={() => changeStatus(booking.id, "confirmed")}
                            disabled={updateStatus.isPending}
                            data-testid={`button-confirm-${booking.id}`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            تأكيد
                          </Button>
                        )}
                        {booking.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => changeStatus(booking.id, "cancelled")}
                            disabled={updateStatus.isPending}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            <XCircle className="w-3 h-3" />
                            إلغاء
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs gap-1 text-muted-foreground hover:text-yellow-400"
                            onClick={() => changeStatus(booking.id, "pending")}
                            disabled={updateStatus.isPending}
                            data-testid={`button-pending-${booking.id}`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            إعادة للانتظار
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground text-sm">
              لا توجد حجوزات في هذه الفئة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <Card className={`bg-card border-border ${highlight ? "border-primary/30" : ""}`}>
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${highlight ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        <div className={`text-2xl font-black mb-0.5 ${highlight ? "text-primary" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

export function Admin() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;
  return <AdminDashboard />;
}

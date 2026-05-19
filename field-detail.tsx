import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetField,
  getGetFieldQueryKey,
  useCreateBooking,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ArrowRight, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// استيراد مكتبات Stripe الرسمية للواجهات المدمجة
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// تهيئة Stripe بمفتاحك الحقيقي (يبدأ بـ pk_live_ عند الانتقال للإنتاج الحقيقي)
const stripePromise = loadStripe("pk_test_ضع_مفتاح_سترايب_العام_هنا");

const DURATION_OPTIONS = [
  { key: "half_hour", label: "30 دقيقة", price: 5, desc: "مناسبة للتمرين السريع" },
  { key: "one_hour", label: "ساعة كاملة", price: 9, desc: "الأكثر طلباً", popular: true },
  { key: "three_hours", label: "3 ساعات", price: 24, desc: "مباراة مع الأصدقاء" },
];

// نموذج الدفع الداخلي المدمج (نفس واجهة Hostinger الآمنة)
function PaymentForm({ id, customerName, customerPhone, selectedDuration, selectedOption, fieldName }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createBooking = useCreateBooking();

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم ورقم الجوال أولاً", variant: "destructive" });
      return;
    }

    if (!stripe || !elements) return;

    setIsSubmitting(true);

    try {
      // 1. إنشاء الحجز في قاعدة البيانات أولاً للحصول على المعرف
      const booking = await createBooking.mutateAsync({
        data: {
          fieldId: id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          durationKey: selectedDuration,
        },
      });

      // 2. إرسال بيانات البطاقة بشكل مشفر لـ Stripe للحصول على token الدفع الآمن
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement!,
        billing_details: {
          name: customerName,
          phone: customerPhone,
        }
      });

      if (error) {
        toast({ title: "فشل الدفع", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // 3. إرسال التوكن إلى السيرفر الخاص بك لتأكيد خصم المبلغ حقيقياً وتوليد كود الحجز
      const response = await fetch("/api/bookings/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethodId: paymentMethod.id
        })
      });

      const paymentResult = await response.json();

      if (response.ok && paymentResult.success) {
        toast({ title: "نجاح", description: "تم الدفع وتأكيد الحجز بنجاح" });
        // التوجيه لصفحة الكود والـ QR التي أرسلتها لي سابقاً
        setLocation(`/booking/confirm?bookingId=${booking.id}`);
      } else {
        throw new Error(paymentResult.error || "فشلت عملية معالجة الدفع بالسيرفر");
      }

    } catch (err: any) {
      toast({
        title: "حدث خطأ",
        description: err.message || "تعذّر إتمام الحجز، يرجى المحاولة مجدداً",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleBookingSubmit} className="space-y-4">
      {/* خانات إدخال البطاقة المدمجة بتصميم Hostinger النظيف */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5 mb-1">
          <CreditCard className="w-4 h-4 text-primary" /> تفاصيل بطاقة الدفع (مدى / فيزا)
        </Label>
        <div className="p-3.5 border border-border rounded-xl bg-background shadow-inner text-right direction-ltr">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#0f172a',
                fontFamily: 'system-ui, sans-serif',
                '::placeholder': { color: '#94a3b8' },
              },
              invalid: { color: '#dc2626' },
            },
            hidePostalCode: true, // إخفاء الرمز البريدي لتسهيل الدفع في السعودية
          }} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !stripe}
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg transition-all"
      >
        {isSubmitting ? "جاري معالجة الدفع الآمن..." : `ادفع $${selectedOption?.price} وأكد الحجز الفوري`}
      </Button>
    </form>
  );
}

export function FieldDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();

  const [selectedDuration, setSelectedDuration] = useState<string>("one_hour");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const { data: field, isLoading: fieldLoading } = useGetField(id, {
    query: { enabled: !!id, queryKey: getGetFieldQueryKey(id) },
  });

  const selectedOption = DURATION_OPTIONS.find((d) => d.key === selectedDuration);

  if (fieldLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-80 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">الملعب غير موجود</h2>
        <Button onClick={() => setLocation("/")} variant="outline">العودة للرئيسية</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-8">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-10">
        <img src={field.imageUrl} alt={field.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-6 right-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">{field.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            {field.location}
          </div>
        </div>
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 bg-background/70 backdrop-blur border border-border rounded-full p-2 hover:bg-background transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info + Packages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-3">عن الملعب</h2>
              <p className="text-muted-foreground leading-relaxed">{field.description}</p>
            </CardContent>
          </Card>

          {/* Duration Packages */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                اختر الباقة المناسبة
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedDuration(opt.key)}
                  className={`relative rounded-2xl border-2 p-5 text-center transition-all text-right ${
                    selectedDuration === opt.key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  {opt.popular && (
                    <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      الأكثر طلباً
                    </span>
                  )}
                  <div className={`text-3xl font-black mb-1 ${selectedDuration === opt.key ? "text-primary" : ""}`}>
                    ${opt.price}
                  </div>
                  <div className="font-bold text-sm mb-1">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  {selectedDuration === opt.key && (
                    <CheckCircle className="w-4 h-4 text-primary absolute top-3 left-3" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking Form with Stripe Elements */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">أكمل الحجز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Summary */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-1">
                <div className="text-sm font-medium text-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  ملخص الحجز
                </div>
                <div className="text-muted-foreground text-sm">{field.name}</div>
                <div className="text-sm text-muted-foreground">{selectedOption?.label}</div>
                <div className="text-foreground font-black text-2xl pt-1">
                  ${selectedOption?.price}
                </div>
              </div>

              {/* Customer Info Inputs */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customer-name" className="text-sm font-medium mb-1.5 block">
                    اسمك الكامل
                  </Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك الثلاثي"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone" className="text-sm font-medium mb-1.5 block">
                    رقم الجوال
                  </Label>
                  <Input
                    id="customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="rounded-xl text-left"
                  />
                </div>
              </div>

              {/* حقن بيئة وعناصر الدفع الآمنة من سترايب */}
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  id={id}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  selectedDuration={selectedDuration}
                  selectedOption={selectedOption}
                  fieldName={field.name}
                />
              </Elements>

            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

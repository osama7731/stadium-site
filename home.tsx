import { useListFields, useGetStatsSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Trophy, Users, Star, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  const { data: fields, isLoading: fieldsLoading } = useListFields();
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="صورة ملعب كرة قدم في الليل" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/30 backdrop-blur-sm"
          >
            <Star className="w-4 h-4 fill-current" />
            منصة حجز الملاعب الأولى في السعودية
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight"
          >
            احجز ملعبك <span className="text-primary">بضغطة زر</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            تجربة حجز ملاعب احترافية. تصفح الملاعب، اختر الوقت المناسب، وادفع بأمان. ملعبك جاهز في انتظارك.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 justify-center"
          >
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25" onClick={() => {
              document.getElementById("fields-section")?.scrollIntoView({ behavior: "smooth" });
            }}>
              استكشف الملاعب
              <ArrowLeft className="mr-2 w-5 h-5" />
            </Button>
            <Link href="/booking/lookup">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur border-border/50">
                بحث عن حجز سابق
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : (
              <>
                <StatCard icon={<Trophy />} label="الملاعب المتاحة" value={fields?.length || 0} />
                <StatCard icon={<Users />} label="إجمالي الحجوزات" value={stats?.totalBookings || 0} />
                <StatCard icon={<Star />} label="حجوزات مؤكدة" value={stats?.confirmedBookings || 0} />
                <StatCard icon={<MapPin />} label="الملعب الأكثر طلباً" value={stats?.topField || "-"} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Fields List */}
      <section id="fields-section" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الملاعب المتاحة</h2>
            <p className="text-muted-foreground max-w-2xl">
              نقدم لك أفضل الملاعب المجهزة بالكامل لتجربة رياضية لا تُنسى
            </p>
          </div>

          {fieldsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden bg-card/50">
                  <Skeleton className="w-full h-56" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-6" />
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-10 w-28 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fields?.filter(f => f.isActive).map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden bg-card hover:border-primary/50 transition-colors group flex flex-col h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={field.imageUrl} 
                        alt={field.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-border/50">
                        <MapPin className="w-3 h-3 text-primary" />
                        {field.location}
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {field.sport}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{field.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                        {field.description}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
                          <div className="bg-secondary p-2 rounded-lg">
                            <div className="text-muted-foreground mb-1">30 دقيقة</div>
                            <div className="font-bold text-foreground">${field.priceHalfHour}</div>
                          </div>
                          <div className="bg-secondary p-2 rounded-lg border border-primary/20">
                            <div className="text-muted-foreground mb-1">ساعة</div>
                            <div className="font-bold text-primary">${field.priceOneHour}</div>
                          </div>
                          <div className="bg-secondary p-2 rounded-lg">
                            <div className="text-muted-foreground mb-1">3 ساعات</div>
                            <div className="font-bold text-foreground">${field.priceThreeHours}</div>
                          </div>
                        </div>
                        
                        <Link href={`/fields/${field.id}`}>
                          <Button className="w-full h-12 text-base rounded-xl font-bold">
                            احجز الآن
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {fields && fields.length === 0 && !fieldsLoading && (
            <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">لا توجد ملاعب متاحة حالياً</h3>
              <p className="text-muted-foreground">يرجى العودة لاحقاً لاستكشاف الملاعب الجديدة.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-background border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

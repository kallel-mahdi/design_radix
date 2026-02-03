import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

function StatItem({ value, suffix = "", label, delay = 0 }: StatItemProps) {
  return (
    <BlurFade delay={delay} inView>
      <div className="text-center">
        <div className="font-serif text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-2">
          <NumberTicker value={value} />
          {suffix}
        </div>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
          {label}
        </p>
      </div>
    </BlurFade>
  );
}

const stats = [
  { value: 50000, suffix: "+", label: "Papers organized" },
  { value: 12000, suffix: "+", label: "Active researchers" },
  { value: 500, suffix: "+", label: "Universities" },
  { value: 99, suffix: "%", label: "Uptime" },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y border-[var(--border-subtle)]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={0.1 * (i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

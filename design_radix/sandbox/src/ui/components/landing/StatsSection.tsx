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
        <div className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-2">
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
    <section className="relative py-20">
      {/* Soft gradient dividers - subtle section indication */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent 20%, var(--border-subtle) 50%, transparent 80%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(to right, transparent 20%, var(--border-subtle) 50%, transparent 80%)" }}
      />

      <div className="container mx-auto px-6 relative z-10">
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

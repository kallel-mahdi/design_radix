import { BlurFade } from "@/components/ui/blur-fade";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarCircles } from "@/components/ui/avatar-circles";

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
  delay?: number;
}

function TestimonialCard({ quote, name, role, initials, delay = 0 }: TestimonialProps) {
  return (
    <BlurFade delay={delay} inView>
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6 transition-all hover:border-[var(--border-default)] hover:shadow-lg hover:-translate-y-0.5">
        <p className="font-serif text-base leading-relaxed text-[var(--text-primary)] mb-6 italic">
          "{quote}"
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-gradient-to-br from-[var(--sand-5)] to-[var(--sand-7)] text-[var(--text-secondary)] text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm text-[var(--text-primary)]">{name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{role}</p>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

const testimonials = [
  {
    quote:
      "Finally, a tool that understands how researchers actually work. The integration between my library and writing is seamless.",
    name: "Dr. Sarah Chen",
    role: "Postdoc, MIT",
    initials: "SC",
  },
  {
    quote:
      "The citation graph feature alone saved me weeks of literature review time. I discovered papers I never would have found otherwise.",
    name: "Prof. James Miller",
    role: "Faculty, Stanford",
    initials: "JM",
  },
  {
    quote:
      "Switched from Zotero + Overleaf and never looked back. Everything in one place, and it actually works on my 10-year-old laptop.",
    name: "Maria Rodriguez",
    role: "PhD Candidate, Oxford",
    initials: "MR",
  },
];

const avatarUrls = [
  { imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah", profileUrl: "#" },
  { imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=James", profileUrl: "#" },
  { imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Maria", profileUrl: "#" },
  { imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=David", profileUrl: "#" },
  { imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma", profileUrl: "#" },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <AvatarCircles numPeople={2847} avatarUrls={avatarUrls} />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Loved by researchers
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Join thousands of academics who've simplified their workflow
            </p>
          </div>
        </BlurFade>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.name}
              quote={t.quote}
              name={t.name}
              role={t.role}
              initials={t.initials}
              delay={0.1 * (i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

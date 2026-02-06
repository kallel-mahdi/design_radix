import { BlurFade } from "@/components/ui/blur-fade";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarCircles } from "@/components/ui/avatar-circles";

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl: string;
  delay?: number;
}

function TestimonialCard({ quote, name, role, initials, avatarUrl, delay = 0 }: TestimonialProps) {
  return (
    <BlurFade delay={delay} inView>
      <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] p-6 transition-all hover:border-[var(--border-default)] hover:shadow-lg hover:-translate-y-0.5">
        {/* Quote */}
        <p className="text-base leading-relaxed text-[var(--text-primary)] mb-6 italic">
          "{quote}"
        </p>
        {/* Attribution */}
        <div className="flex items-center gap-3">
          <Avatar className="size-11 ring-2 ring-[var(--border-subtle)]">
            <AvatarImage
              src={avatarUrl}
              alt={name}
              loading="lazy"
              className="object-cover"
            />
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
    // Professional Asian woman with glasses - research/academic context
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
  },
  {
    quote:
      "The citation graph feature alone saved me weeks of literature review time. I discovered papers I never would have found otherwise.",
    name: "Prof. James Miller",
    role: "Faculty, Stanford",
    initials: "JM",
    // Professional man with beard - academic/professor look
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  },
  {
    quote:
      "Switched from Zotero + Overleaf and never looked back. Everything in one place, and it actually works on my 10-year-old laptop.",
    name: "Maria Rodriguez",
    role: "PhD Candidate, Oxford",
    initials: "MR",
    // Young professional woman - graduate student look
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  },
];

// Avatar URLs for the avatar circles component
const avatarUrls = [
  { imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=faces", profileUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces", profileUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces", profileUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=faces", profileUrl: "#" },
  { imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces", profileUrl: "#" },
];

export function Testimonials() {
  return (
    <section className="relative py-20">
      {/* Gradient handled by parent LandingPage - no local gradient */}

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <AvatarCircles numPeople={2847} avatarUrls={avatarUrls} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Loved by researchers
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Join thousands of academics who've simplified their workflow
            </p>
          </div>
        </BlurFade>

        {/* Testimonials Grid - increased gap from gap-4 to gap-6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.name}
              quote={t.quote}
              name={t.name}
              role={t.role}
              initials={t.initials}
              avatarUrl={t.avatarUrl}
              delay={0.1 * (i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import SectionHeading from "./ui/SectionHeading";
import { useProfile } from "@/hooks/useProfile";

export default function About({ index }: { index: string }) {
  const { data: profile, loading } = useProfile();

  if (loading || !profile) return null;

  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading index={index} eyebrow="About" title="Building software, exploring ML." />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            {profile.bio.map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-ink/80 reveal-up">
                {para}
              </p>
            ))}
          </div>

          <div className="reveal-up">
            <p className="eyebrow mb-4">Interests</p>
            <ul className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <li key={interest} className="chip-brand">
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

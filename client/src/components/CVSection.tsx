import { useCvUrl } from "@/hooks/useCvUrl";
import SectionHeading from "./ui/SectionHeading";

export default function CVSection({ index }: { index: string }) {
  const { url: cvUrl, loading } = useCvUrl();

  if (loading || !cvUrl) return null;

  return (
    <section id="cv" className="section bg-surface/60 border-y border-line">
      <div className="container">
        <SectionHeading
          index={index}
          eyebrow="Curriculum Vitae"
          title="My full experience."
          description="A complete record of my work history, education, and skills."
        />

        <div className="mt-12 flex flex-col items-center reveal-up">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
            {/* 
              We use an object tag for inline PDF viewing. 
              Fallback to a simple download link if the browser doesn't support it.
            */}
            <object
              data={cvUrl}
              type="application/pdf"
              className="h-[80vh] w-full"
            >
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-rounded mb-4 text-4xl text-brand-500">description</span>
                <p className="mb-4 text-muted">Your browser does not support inline PDF viewing.</p>
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Download PDF
                </a>
              </div>
            </object>
          </div>
          
          <div className="mt-8">
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <span className="material-symbols-rounded text-[18px]">download</span>
              Download Full CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

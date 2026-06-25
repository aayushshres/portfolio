import { useState } from "react";
import { useForm } from "react-hook-form";
import { useProfile } from "@/hooks/useProfile";
import { api } from "@/lib/api";
import SectionHeading from "./ui/SectionHeading";
import Socials from "./ui/Socials";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export default function Contact({ index }: { index: string }) {
  const { data: profile, loading: profileLoading } = useProfile();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post("/messages", data);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) return null;

  return (
    <section id="contact" className="section bg-surface/60 border-t border-line">
      <div className="container grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            index={index}
            eyebrow="Contact"
            title="Let’s collaborate."
            description="Open to research collaborations, PhD/industry opportunities, and conversations about ML for agriculture."
          />

          <a
            href={`mailto:${profile?.email}`}
            className="mt-8 inline-flex items-center gap-2 font-serif text-xl text-ink link-underline"
          >
            <span className="material-symbols-rounded text-brand-600">mail</span>
            {profile?.email}
          </a>

          <div className="mt-8">
            <Socials />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="reveal-up">
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
              Message sent successfully! I'll get back to you soon.
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                className="text-field"
                disabled={submitting}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                autoComplete="email"
                placeholder="jane@university.edu"
                className="text-field"
                disabled={submitting}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="message" className="label">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Hi Aayush, …"
              className="text-field resize-y"
              disabled={submitting}
              {...register("message", { required: "Message is required" })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary mt-5 w-full">
            {submitting ? "Sending..." : "Send message"}
            <span className="material-symbols-rounded text-[18px]">send</span>
          </button>
        </form>
      </div>
    </section>
  );
}

import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string(),
  affiliation: z.string(),
  location: z.string(),
  email: z.string().email(),
  headline: z.string(),
  tagline: z.string(),
  bio: z.array(z.string()),
  interests: z.array(z.string()),
  avatar: z.string(),
});

export const ContactInfoSchema = z.object({
  contactHeading: z.string(),
  contactDescription: z.string(),
});

export const SettingsSchema = z.object({
  sections: z.object({
    research: z.boolean(),
    projects: z.boolean(),
    publications: z.boolean(),
  }),
  cv: z.object({
    visible: z.boolean(),
  }),
  siteContent: z.record(z.string()).default({}),
  theme: z.object({
    accentColor: z.string(),
  }).default({ accentColor: "#2d33a8" }),
});

export const SocialItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  visible: z.boolean(),
  icon: z.string().optional(),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  imgSrc: z.string(),
  tags: z.array(z.string()),
  projectLink: z.string().optional(),
  repoLink: z.string().optional(),
  order: z.number(),
  published: z.boolean(),
});

export const ResearchItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  published: z.boolean(),
});

export const PublicationItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  authors: z.string(),
  venue: z.string(),
  year: z.number(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  published: z.boolean(),
});

export const MessageSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  message: z.string().min(1).max(5000),
  createdAt: z.string(),
  read: z.boolean(),
});

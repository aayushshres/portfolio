// Publications list. `authors` uses the display name exactly; the component
// bolds whichever entry matches AUTHOR_SELF.
// (Placeholder entries — replace with real papers.)

export const AUTHOR_SELF = "A. Shrestha";

export type PubType = "journal" | "conference" | "workshop" | "preprint";

export interface PubLink {
  label: string;
  href: string;
}

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PubType;
  links: PubLink[];
}

export const publications: Publication[] = [
  {
    title:
      "Robust Cross-Region Crop Disease Detection with Self-Supervised Pretraining",
    authors: ["A. Shrestha", "J. Doe", "M. Smith"],
    venue: "Computers and Electronics in Agriculture",
    year: 2025,
    type: "journal",
    links: [
      { label: "PDF", href: "#" },
      { label: "Code", href: "#" },
      { label: "DOI", href: "#" },
    ],
  },
  {
    title:
      "Calibrated Multimodal Yield Forecasting from Satellite and Weather Time Series",
    authors: ["A. Shrestha", "R. Kumar", "L. Chen"],
    venue: "NeurIPS Workshop on Tackling Climate Change with ML",
    year: 2024,
    type: "workshop",
    links: [
      { label: "PDF", href: "#" },
      { label: "Poster", href: "#" },
    ],
  },
  {
    title:
      "Lightweight Segmentation of UAV Imagery for In-Field Crop Monitoring",
    authors: ["A. Shrestha", "P. Patel"],
    venue: "IEEE/CVF CVPR Workshop on Agriculture-Vision",
    year: 2024,
    type: "conference",
    links: [
      { label: "PDF", href: "#" },
      { label: "Code", href: "#" },
    ],
  },
  {
    title:
      "Data-Efficient Crop-Type Mapping under Label Scarcity: A Benchmark",
    authors: ["A. Shrestha", "S. Gurung", "T. Williams"],
    venue: "arXiv preprint",
    year: 2023,
    type: "preprint",
    links: [
      { label: "PDF", href: "#" },
      { label: "Data", href: "#" },
    ],
  },
];

// Research themes shown in the Research section.
// `icon` is a Material Symbols Rounded glyph name.

export interface ResearchArea {
  icon: string;
  title: string;
  summary: string;
  tags: string[];
}

export const researchAreas: ResearchArea[] = [
  {
    icon: "eco",
    title: "Crop Disease & Stress Detection",
    summary:
      "Computer-vision models that flag plant disease and abiotic stress early from leaf, canopy, and drone imagery — designed to stay reliable across cultivars, lighting, and field conditions.",
    tags: ["Computer Vision", "Domain Robustness", "Self-supervision"],
  },
  {
    icon: "trending_up",
    title: "Yield Forecasting",
    summary:
      "Multimodal time-series models that fuse weather, soil, and satellite signals to forecast yields earlier in the season, with calibrated uncertainty for real decision-making.",
    tags: ["Time-Series", "Multimodal Fusion", "Uncertainty"],
  },
  {
    icon: "satellite_alt",
    title: "Remote Sensing for Field Monitoring",
    summary:
      "Turning satellite and UAV imagery into field-scale insight — segmentation, change detection, and crop-type mapping that scale from a single plot to whole regions.",
    tags: ["Segmentation", "Geospatial ML", "Change Detection"],
  },
  {
    icon: "memory",
    title: "Efficient & Edge ML",
    summary:
      "Compressing and adapting models so they run on phones, drones, and low-cost field hardware — distillation, quantization, and data-efficient training for low-resource settings.",
    tags: ["Model Compression", "Edge Deployment", "Data Efficiency"],
  },
];

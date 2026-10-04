import {
  Construction,
  Droplets,
  Ellipsis,
  Lightbulb,
  Trash2,
  TrafficCone,
  Waves,
} from "lucide-react";

// Single source of truth for civic issue categories.
// `name` is the value stored on a complaint.
export const CATEGORIES = [
  {
    name: "Water Leakage",
    icon: Droplets,
    image: "/images/water-leakage.svg",
    description: "Leaking pipes and water wasted on the road.",
  },
  {
    name: "Pothole",
    icon: Construction,
    image: "/images/pothole.svg",
    description: "Damaged roads and dangerous potholes.",
  },
  {
    name: "Street Light",
    icon: Lightbulb,
    image: "/images/street-light.svg",
    description: "Street lights that are broken or switched off.",
  },
  {
    name: "Garbage",
    icon: Trash2,
    image: "/images/garbage.svg",
    description: "Garbage piling up in public places.",
  },
  {
    name: "Drainage",
    icon: Waves,
    image: "/images/drainage.svg",
    description: "Blocked, overflowing or damaged drains.",
  },
  {
    name: "Traffic Signal",
    icon: TrafficCone,
    image: "/images/traffic-signal.svg",
    description: "Signals that are faulty or not working.",
  },
  {
    name: "Other",
    icon: Ellipsis,
    image: "/images/other.svg",
    description: "Any other civic problem in your area.",
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);

export const getCategory = (name) =>
  CATEGORIES.find((category) => category.name === name) ||
  CATEGORIES[CATEGORIES.length - 1];

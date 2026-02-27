const IMAGE_FILENAMES: string[] = [
  "up-gate",
  "carabao-park",
  "raymundo-gate",
  "university-library",
  "oblation-park",
  "mariang-banga",
  "dl-umali-hall",
  "freedom-park",
  "baker-hall",
  "carillon-tower",
  "copeland",
  "searca",
  "botanical-garden",
  "irri",
  "su-building",
  "college-of-forestry",
  "physical-sciences-bldg",
  "ceat-building",
  "cvm",
  "athletics-oval",
  "graduate-school",
  "humanities-building",
  "ncas",
  "institute-of-animal-science",
  "biotech",
  "cem-building",
  "college-of-human-ecology",
  "math-building",
  "forestry-biological-sciences",
];

export function getLocationImagePath(index: number): string {
  return `/locations/${IMAGE_FILENAMES[index]}.jpg`;
}

export const FALLBACK_IMAGE: string =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='100' fill='%23374151'%3E%3Crect width='150' height='100' rx='4'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.35em' fill='%239ca3af' font-size='12' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

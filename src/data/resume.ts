export type ResumeRow = {
  role: string;
  dates: string;
  organization: string;
  detail: string;
};

export type ResumeSection = {
  section: string;
  rows: readonly ResumeRow[];
};

export const skills = [
  'EEG signal processing',
  'Domain adversarial training',
  'Python',
  'PyTorch / scikit-learn',
  'EEGNet',
  'PhysioNet',
  'Science communication',
  'Community building',
] as const;

export const resumeSections: readonly ResumeSection[] = [
  {
    section: 'Research',
    rows: [
      { role: 'Research Scholar', dates: 'Summer 2024', organization: 'Research Science Institute (RSI) · IISc Bangalore', detail: '1 of 31 selected nationally · attention-gated learning via EEG' },
      { role: 'Independent Researcher', dates: '2024 – 2025', organization: 'Cross-Session EEG Biometrics · IEEE TNSRE', detail: 'DA-EEGNet · 85.11% LOSO accuracy · 83 subjects' },
      { role: 'Research Intern', dates: '2023 – 2024', organization: 'Oculosense', detail: 'AI vision & assistive technology for smart eyewear' },
      { role: 'Team Lead, AI', dates: '2022 – 2024', organization: 'Project 2AS', detail: 'EEG-based tools for autistic children · 4,000+ community' },
      { role: 'Developer', dates: 'Summer 2022', organization: 'New York Academy of Sciences', detail: '3D cognitive AR tool · Finalist & International Runner-Up' },
    ],
  },
  {
    section: 'Leadership',
    rows: [
      { role: 'Founder & CEO', dates: '2023 – Present', organization: 'Nerdy Network Global', detail: 'Builders across 20+ countries · 1,500+ waitlist · toward pre-seed at Antler' },
      { role: 'Co-Founder & Growth Lead', dates: '2022 – Present', organization: 'STEMExpedition', detail: '10,000+ students · 70+ person team · 200k+ podcast views' },
      { role: 'Organizer & Sponsorship Lead', dates: '2023 – 2024', organization: 'Hacklub · National Hackathons', detail: '2 national hackathons · 1,000+ attendees · 10L+ INR raised' },
      { role: 'Organizer & Partnership Director', dates: '2022 – Present', organization: 'CodeDay India', detail: '4 hackathons · 15L+ INR · 1,000+ students introduced to coding' },
    ],
  },
  {
    section: 'Community',
    rows: [
      { role: 'Founder & Lead Educator', dates: '2021 – Present', organization: 'Rural STEM Initiative · Raebareli', detail: 'EEG / ECG / EMG taught across 34 rural government schools' },
      { role: 'Co-Author & Organizer', dates: '2022', organization: 'Project Emilia', detail: 'Poetry anthology on mental health · 20 authors · 300+ copies' },
    ],
  },
  {
    section: 'Education',
    rows: [
      { role: 'Higher Secondary Certificate', dates: 'Apr 2019 – May 2026', organization: "St. Peter's School, Raebareli, India", detail: 'SAT 1350 · Biology, Physics, Chemistry, English, Computer Science' },
    ],
  },
  {
    section: 'Honors',
    rows: [
      { role: 'International Finalist', dates: '2023', organization: 'Diamond Challenge', detail: 'Genetics-driven personalized nutrition venture' },
      { role: 'International Semifinalist', dates: '2023', organization: 'Conrad Challenge', detail: 'Algae-based cement to reduce construction pollution' },
      { role: 'Finalist & Intl Runner-Up', dates: '2022', organization: 'New York Academy of Sciences', detail: '3D cognitive AR learning tool' },
      { role: 'First Place', dates: '2023', organization: 'School Science Exhibition', detail: 'Neurotechnology project' },
    ],
  },
];

// A short alias keeps the data convenient for components that use the reference's name.
export const resume = resumeSections;

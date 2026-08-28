export type SiteMetadata = {
  name: string;
  title: string;
  description: string;
  url: string;
  copyright: string;
};

export type NavItem = {
  key: 'home' | 'research' | 'resume' | 'reading' | 'writing' | 'guestbook' | 'about' | 'contact';
  label: string;
  index: string;
  href: `/${string}`;
};

export type HomeInvite = {
  key: string;
  description: string;
  href: `/${string}`;
};

export type SocialLink = {
  label: string;
  href: string | null;
  available: boolean;
  note?: string;
};

export const siteMetadata: SiteMetadata = {
  name: 'Aadrika Maurya',
  title: "aadrika's archive",
  description: 'Research, projects, writing, and assorted evidence of curiosity by Aadrika Maurya.',
  url: 'https://example.com',
  copyright: '2026 Aadrika Maurya',
};

export const navItems: readonly NavItem[] = [
  { key: 'home', label: 'Home', index: '01', href: '/' },
  { key: 'research', label: 'Research', index: '02', href: '/research' },
  { key: 'resume', label: 'Resume', index: '03', href: '/resume' },
  { key: 'reading', label: 'Reading', index: '04', href: '/reading' },
  { key: 'writing', label: 'Writing', index: '05', href: '/writing' },
  { key: 'guestbook', label: 'Guestbook', index: '06', href: '/guestbook' },
  { key: 'about', label: 'About', index: '07', href: '/about' },
  { key: 'contact', label: 'Contact', index: '08', href: '/contact' },
];

export const currently = {
  label: 'CURRENTLY — AUG 2026',
  text: 'thinking about what happens to alignment when models are modified, reading far too much about consciousness, writing about bodies and old websites, and insisting this portfolio is “almost finished.”',
} as const;

export const homeInvites: readonly HomeInvite[] = [
  { key: 'RESEARCH', description: "things i'm trying to understand", href: '/research' },
  { key: 'PROJECTS', description: 'ideas that escaped the notes app', href: '/research' },
  { key: 'WRITING', description: "things i couldn't leave alone", href: '/writing' },
  { key: 'INDEX', description: 'books, films, artists & assorted brain contaminants', href: '/reading' },
  { key: 'CONSTELLATION', description: 'things strangers left behind', href: '/guestbook' },
  { key: 'ABOUT', description: 'an unnecessarily long attempt to explain myself', href: '/about' },
];

export const socialLinks: readonly SocialLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aadrikamaurya', available: true },
  { label: 'GitHub', href: null, available: false, note: 'Profile URL not supplied in the reference.' },
  { label: 'Scholar', href: null, available: false, note: 'Profile URL not supplied in the reference.' },
];

export const contact = {
  label: 'GET IN TOUCH',
  email: 'aadrikamaurya@gmail.com',
  emailHref: 'mailto:aadrikamaurya@gmail.com',
  socialLinks,
} as const;

export const featuredWriting = [
  { index: '01', slug: 'what-exactly-am-i-supposed-to-do-with-a-body' },
  { index: '02', slug: 'the-internet-used-to-have-bedrooms' },
  { index: '03', slug: 'oh-so-you-want-to-be-a-cool-girl' },
] as const;

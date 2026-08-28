export * from './about';
export * from './reading';
export * from './resume';
export * from './site';

// Stable integration names for page/layout consumers.
export { siteMetadata as siteConfig } from './site';

import { aboutCopy } from './about';

export const aboutParagraphs = aboutCopy.paragraphs;

export type ReadingItem = {
  title: string;
  by?: string;
};

export type ReadingCategory = {
  title: 'Books' | 'Essays' | 'Artists' | 'Films';
  items: readonly ReadingItem[];
};

export const readingCategories: readonly ReadingCategory[] = [
  {
    title: 'Books',
    items: [
      { title: 'The Vegetarian', by: 'Han Kang' },
      { title: 'The Bell Jar', by: 'Sylvia Plath' },
      { title: 'The Secret History', by: 'Donna Tartt' },
      { title: 'Piranesi', by: 'Susanna Clarke' },
      { title: "The Hitchhiker's Guide to the Galaxy", by: 'Douglas Adams' },
      { title: 'Frankenstein', by: 'Mary Shelley' },
      { title: 'Flowers for Algernon', by: 'Daniel Keyes' },
      { title: 'The God of Small Things', by: 'Arundhati Roy' },
      { title: 'The Picture of Dorian Gray', by: 'Oscar Wilde' },
      { title: 'Project Hail Mary', by: 'Andy Weir' },
      { title: 'Gödel, Escher, Bach', by: 'Douglas Hofstadter' },
    ],
  },
  {
    title: 'Essays',
    items: [
      { title: 'Why Have There Been No Great Women Artists?', by: 'Linda Nochlin' },
      { title: 'What Is It Like to Be a Bat?', by: 'Thomas Nagel' },
      { title: 'On Keeping a Notebook', by: 'Joan Didion' },
      { title: 'The Death of the Author', by: 'Roland Barthes' },
      { title: 'The Unreasonable Effectiveness of Mathematics in the Natural Sciences', by: 'Eugene Wigner' },
      { title: 'Consider the Lobster', by: 'David Foster Wallace' },
      { title: 'Politics and the English Language', by: 'George Orwell' },
      { title: 'A Room of One’s Own', by: 'Virginia Woolf' },
      { title: 'As We May Think', by: 'Vannevar Bush' },
    ],
  },
  {
    title: 'Artists',
    items: [
      { title: 'Peter Cat Recording Co.' },
      { title: 'Begum' },
      { title: 'Darzi' },
      { title: 'ear' },
      { title: 'Shauharty' },
      { title: 'Fiona Apple' },
      { title: 'Adrianne Lenker' },
      { title: 'David Bowie' },
      { title: 'The Beatles' },
      { title: 'Natalie Merchant' },
      { title: 'Suzanne Vega' },
    ],
  },
  {
    title: 'Films',
    items: [
      { title: 'The Science of Sleep' },
      { title: 'Amélie' },
      { title: 'La La Land' },
      { title: 'Daisies' },
      { title: 'The Double Life of Véronique' },
      { title: 'The Fall' },
      { title: 'The Color of Pomegranates' },
      { title: 'The Taste of Tea' },
      { title: 'Paprika' },
      { title: 'Meshes of the Afternoon' },
    ],
  },
];

export const reading = readingCategories;

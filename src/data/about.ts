export type AboutCopy = {
  displayName: string;
  greeting: string;
  paragraphs: readonly string[];
  focus: readonly string[];
  based: string;
};

export const aboutCopy: AboutCopy = {
  displayName: 'Aadrika Maurya',
  greeting: 'Dear stranger on the internet,',
  paragraphs: [
    "I'm Aadrika.",
    "I've never been particularly good at liking one thing at a time. I like brains and machines, strange films and stranger books, badly behaved ideas, beautifully designed things, research papers with ridiculous titles, people who care too much, and questions that are probably too large to answer properly.",
    "Most of what I do begins with some version of ‘wait, but why does it work like that?’ Sometimes that turns into research. Sometimes code. Sometimes a community, a film, an essay, a half-finished experiment, or seventeen tabs I swear I'm going to come back to.",
    "I'm especially fascinated by intelligence — biological and artificial — and by everything we still don't understand about how either one makes sense of the world. I like taking things apart to see what survives: models, assumptions, systems, ideas. Maybe that's why I'm equally at home reading about consciousness and interpretability as I am watching an obscure film about dreams or disappearing into something someone made twenty years before I was born.",
    'I also really like making things exist.',
    "Not just thinking about them. Making the website. Running the experiment. Sending the email. Gathering the people. Shooting the film. Building the weird prototype. Putting the first version into the world while it's still a little embarrassing. I think there's something wonderful about taking an idea that previously existed only inside someone's head and giving it a URL, a dataset, a room full of people, or at least a name.",
    "I don't have a neat sentence explaining what I want to become. I hope I never really do. I'd rather keep collecting questions, building things around them, changing my mind occasionally, and leaving behind evidence that I was curious while I was here.",
    'This website is some of that evidence.',
    "It has the serious things and the unserious things. Things I've built, things I've studied, things I'm still trying to understand, and things I simply love for no defensible reason whatsoever.",
    'Stay as long as you like. Click on something strange.',
  ],
  focus: ['EEG / BCI', 'Signal processing', 'Science communication', 'Community building'],
  based: 'Raebareli, India',
};

export const about = aboutCopy;

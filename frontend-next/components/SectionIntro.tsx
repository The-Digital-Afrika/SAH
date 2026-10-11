import styles from "./SectionIntro.module.css";

const introductions: Record<string, { label: string; title: string; description: string }> = {
  home: {
    label: "Home & School",
    title: "Learning together, at home and beyond",
    description:
      "Ideas, stories, and practical inspiration for South African families, from the classroom to everyday life.",
  },
  education: {
    label: "Education",
    title: "Education that opens possibilities",
    description:
      "Explore learning approaches, curriculum choices, and practical support for your child's education journey.",
  },
  development: {
    label: "Development",
    title: "Growing with confidence, one step at a time",
    description:
      "Thoughtful perspectives on children's development, wellbeing, and the skills that help them thrive.",
  },
  "ask-dalena": {
    label: "Ask Dalena",
    title: "A little guidance for life's big questions",
    description:
      "Explore Dalena's advice on family life, growing up, and navigating everyday challenges with care.",
  },
  "cooking-bonding": {
    label: "Cooking & Bonding",
    title: "Good food, shared moments",
    description:
      "Bring the family together with recipes, kitchen creativity, and simple ways to turn cooking into quality time.",
  },
  magazines: {
    label: "Magazines",
    title: "Stories and inspiration, issue by issue",
    description:
      "Discover our magazine collection, filled with education insights, family stories, and fresh ideas for learning together.",
  },
};

export default function SectionIntro({ section }: { section: string }) {
  const introduction = introductions[section];
  if (!introduction) return null;

  return (
    <header className={`section-intro ${styles.panel}`}>
      <p className={styles.label}>{introduction.label}</p>
      <h1>{introduction.title}</h1>
      <p className={styles.description}>{introduction.description}</p>
    </header>
  );
}

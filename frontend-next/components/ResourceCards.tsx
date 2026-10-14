import Link from "next/link";
import styles from "./ResourceCards.module.css";

type ResourceCard = {
  href: string;
  label: string;
  title: string;
  description: string;
  variant: "magazine" | "directory" | "recipes";
};

type ResourceCardsContext = "education" | "parenting" | "development" | "cooking-bonding" | "default";

type ResourceCardsContent = {
  kicker: string;
  title: string;
  cards: ResourceCard[];
};

const resourceContent: Record<ResourceCardsContext, ResourceCardsContent> = {
  education: {
    kicker: "Education resources",
    title: "Plan the next step in your homeschool journey",
    cards: [
      {
        href: "/category/development",
        label: "Development",
        title: "Support learning skills and confidence",
        description: "Explore thinking skills, learning support, study habits, and practical development guidance.",
        variant: "magazine",
      },
      {
        href: "/directory",
        label: "Partners",
        title: "Find education providers and support",
        description: "Browse schools, resource centres, study guides, olympiads, and curriculum partners.",
        variant: "directory",
      },
      {
        href: "/magazines",
        label: "Magazines",
        title: "View more education features",
        description: "Open SA Homeschooling magazine issues for longer guides, interviews, and parent resources.",
        variant: "recipes",
      },
    ],
  },
  parenting: {
    kicker: "Parenting resources",
    title: "More support for family life and learning",
    cards: [
      {
        href: "/category/cooking-bonding",
        label: "Cooking & Bonding",
        title: "Cook, connect, and learn together",
        description: "Try family-friendly recipes and activities that build connection beyond formal lessons.",
        variant: "recipes",
      },
      {
        href: "/category/development",
        label: "Development",
        title: "Understand how children learn",
        description: "Find guidance on confidence, motivation, learning support, and emotional development.",
        variant: "directory",
      },
      {
        href: "/subscribe",
        label: "Newsletter",
        title: "Get fresh parenting stories",
        description: "Receive practical homeschool ideas and parent support articles in your inbox.",
        variant: "magazine",
      },
    ],
  },
  development: {
    kicker: "Development resources",
    title: "Build stronger learning foundations",
    cards: [
      {
        href: "/articles",
        label: "Education",
        title: "Connect skills to subject planning",
        description: "Move from learning support into subject choices, matric planning, and education pathways.",
        variant: "directory",
      },
      {
        href: "/category/parenting",
        label: "Parenting",
        title: "Support motivation and wellbeing",
        description: "Read practical parenting guidance for routines, stress, confidence, and connection.",
        variant: "recipes",
      },
      {
        href: "/directory",
        label: "Partners",
        title: "Find specialist learning support",
        description: "Explore trusted education partners, resource centres, and support providers.",
        variant: "magazine",
      },
    ],
  },
  "cooking-bonding": {
    kicker: "Family resources",
    title: "Turn everyday moments into learning",
    cards: [
      {
        href: "/category/parenting",
        label: "Parenting",
        title: "Strengthen family connection",
        description: "Find parenting ideas for routines, communication, confidence, and time together.",
        variant: "recipes",
      },
      {
        href: "/category/development",
        label: "Development",
        title: "Build skills through simple activities",
        description: "Explore learning development, thinking skills, and practical support strategies.",
        variant: "directory",
      },
      {
        href: "/magazines",
        label: "Magazines",
        title: "Browse family features",
        description: "Read magazine issues with recipes, family activities, education stories, and guides.",
        variant: "magazine",
      },
    ],
  },
  default: {
    kicker: "Resources",
    title: "Magazines, partners, and family activities",
    cards: [
      {
        href: "/magazines",
        label: "Magazines",
        title: "Browse magazine issues",
        description: "Open uploaded PDF issues directly from the website.",
        variant: "magazine",
      },
      {
        href: "/directory",
        label: "Partners",
        title: "Find education partners",
        description: "Explore schools, resource centres, olympiads, study guides, and curriculum support partners.",
        variant: "directory",
      },
      {
        href: "/category/cooking-bonding",
        label: "Cooking & Bonding",
        title: "Cook and learn together",
        description: "Family-friendly recipes that double as practical homeschool activities.",
        variant: "recipes",
      },
    ],
  },
};

type ResourceCardsProps = {
  context?: string;
};

function resolveContext(context?: string): ResourceCardsContext {
  if (context === "education" || context === "parenting" || context === "development" || context === "cooking-bonding") {
    return context;
  }

  return "default";
}

export default function ResourceCards({ context }: ResourceCardsProps) {
  const content = resourceContent[resolveContext(context)];

  return (
    <section className={`resource-card-section ${styles.section}`} data-resource-cards aria-label="More SA Homeschooling resources">
      <div className="section-heading resource-card-heading">
        <span className="kicker">{content.kicker}</span>
        <h2>{content.title}</h2>
      </div>
      <div className="resource-grid">
        {content.cards.map((card) => (
          <Link className={`resource-card resource-card--${card.variant}`} href={card.href} key={card.href}>
            <span className="kicker">{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

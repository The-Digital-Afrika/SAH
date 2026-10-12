import Image from "next/image";
import Link from "next/link";

const promotions = [
  {
    href: "/magazines",
    title: "Discover our magazine archive",
    description: "Education, parenting and family stories to explore.",
    action: "Browse magazines",
    image: "/magazine-covers/sa-homeschooling-december-2025.jpg",
    alt: "SA Homeschooling & Beyond December 2025 magazine cover",
    theme: "magazines",
  },
  {
    href: "/subscribe",
    title: "Join our community",
    description: "Stay connected with Home & School.",
    action: "Sign up",
    image: "/images/photo-online-learning-family.png",
    alt: "A family learning together at home",
    theme: "community",
  },
  {
    href: "/articles",
    title: "Make room for learning",
    description: "Explore education stories and practical learning ideas.",
    action: "Explore education",
    image: "/images/photo-maths.jpg",
    alt: "Mathematics learning resources",
    theme: "education",
  },
];

export default function HouseAd({ seed, wide }: { seed: string; wide: boolean }) {
  const index = Array.from(seed).reduce((sum, character) => sum + character.charCodeAt(0), 0) % promotions.length;
  const promotion = promotions[index];

  return (
    <Link
      className={`house-ad house-ad--${promotion.theme}${wide ? " house-ad--banner" : ""}`}
      href={promotion.href}
      aria-label={`Home & School promotion: ${promotion.title}`}
    >
      <Image className="house-ad-image" src={promotion.image} alt={promotion.alt} width={240} height={320} />
      <span className="house-ad-copy">
        <span className="house-ad-brand">Home &amp; School</span>
        <strong>{promotion.title}</strong>
        <span className="house-ad-description">{promotion.description}</span>
        <span className="house-ad-action">{promotion.action}</span>
      </span>
    </Link>
  );
}

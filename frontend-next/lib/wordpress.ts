import { unstable_cache } from "next/cache";
import { prepareWordPressCacheValue, resolveWordPressCacheValue } from "@/lib/wordpress-payload";
import { parseTakeoverConfig, type TakeoverConfig } from "@/lib/takeover";

const WORDPRESS_ORIGIN = "https://cms.homeandschool.co.za";
const WP_API = process.env.NEXT_PUBLIC_WP_API_URL ?? `${WORDPRESS_ORIGIN}/wp-json`;

export type WPAuthor = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  link?: string;
  avatar_urls?: Record<string, string>;
};

export type WPCategory = {
  id: number;
  count: number;
  name: string;
  slug: string;
  taxonomy?: string;
  description?: string;
  link?: string;
};

export type WPTag = {
  id: number;
  count: number;
  name: string;
  slug: string;
  taxonomy?: string;
  description?: string;
  link?: string;
};

export type WPMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
};

export type WPPost = {
  source_origin?: string;
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  author: number;
  featured_media: number;
  categories: number[];
  tags?: number[];
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  aioseo_head?: string;
  aioseo_head_json?: Record<string, unknown>;
  _embedded?: {
    author?: WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: Array<Array<WPCategory | WPTag>>;
  };
};

export type WPPage = {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content: { rendered: string };
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
  };
};

export type PaginatedPosts = {
  posts: WPPost[];
  total: number;
  totalPages: number;
};

export type MagazineIssue = {
  id: string;
  slug: string;
  title: string;
  issueNumber?: string;
  description: string;
  date?: string;
  pdfUrl?: string;
  embedUrl?: string;
  dflipId?: string;
  dflipOption?: DFlipOption;
  coverImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  sourcePost?: WPPost;
};

export type DFlipOption = {
  id?: number | string;
  source?: string;
  outline?: unknown[];
  overwritePDFOutline?: boolean;
  pageSize?: string;
  slug?: string;
  wpOptions?: string;
  thumb?: string;
  thumbnail?: string;
  cover?: string;
  coverImage?: string;
  texture?: string;
  title?: string;
  [key: string]: unknown;
};

export function getMagazinePdfReaderUrl(pdfUrl?: string) {
  if (!pdfUrl) return undefined;

  return pdfUrl.startsWith("/") ? pdfUrl : `/api/magazine-pdf?url=${encodeURIComponent(pdfUrl)}`;
}

export function getMagazineReaderUrl(issue: Pick<MagazineIssue, "pdfUrl" | "embedUrl" | "sourcePost">) {
  return getMagazinePdfReaderUrl(issue.pdfUrl) || issue.embedUrl || issue.sourcePost?.link;
}

export type AdPlacement =
  | "home-top"
  | "home-middle"
  | "home-bottom"
  | "article-top"
  | "article-inline"
  | "article-sidebar"
  | "category-top"
  | "magazine-top"
  | "directory-top"
  | "subscribe-bottom";

export type SiteAd = {
  id: string;
  placement: AdPlacement;
  dataUnit: string;
  sizeClass: string;
  html?: string;
  takeover?: TakeoverConfig;
  google?: {
    networkCode: string;
    adUnitCode: string;
    sizes: Array<[number, number]>;
  };
};

type WPAdCode = {
  id: number;
  slug: string;
  title: { rendered: string };
  content?: { rendered: string };
  meta?: Record<string, unknown>;
  acf?: Record<string, unknown>;
};

type GetPostsOptions = {
  perPage?: number;
  page?: number;
  categories?: number | number[];
  tags?: number | number[];
  exclude?: number | number[];
  search?: string;
  embed?: string | number;
};

const revalidate = 3600;
const wpRequestTimeoutMs = 25000;
const wordpressFetchHeaders = {
  accept: "application/json",
  "user-agent": "SA Home&School frontend (+https://homeandschool.co.za)",
};
const googleAdNetworkCode = process.env.NEXT_PUBLIC_GOOGLE_AD_NETWORK_CODE ?? "23298734611";

const googleLeaderboardAd = {
  networkCode: googleAdNetworkCode,
  adUnitCode: "sahomeschooling_home_leaderboard",
  sizes: [
    [300, 250],
    [728, 90],
    [970, 250],
  ] as Array<[number, number]>,
};

const googleSidebarAd = {
  networkCode: googleAdNetworkCode,
  adUnitCode: "newspack-sidebar-1-684ff96a6f547",
  sizes: [
    [300, 250],
    [300, 600],
  ] as Array<[number, number]>,
};

const googleSidebarAdAlt = {
  networkCode: googleAdNetworkCode,
  adUnitCode: "newspack-sidebar-2-684ff96b922df",
  sizes: [
    [300, 250],
    [300, 600],
  ] as Array<[number, number]>,
};

const localMagazineCovers = {
  "sahab-june-2026": {
    src: `${WORDPRESS_ORIGIN}/wp-content/uploads/dflip-thumbs/6869.jpeg?1780466638`,
    alt: "SA Homeschooling & Beyond June 2026 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-autumn-2024": {
    src: "/magazine-covers/sa-homeschooling-autumn-2024.jpg",
    alt: "SA Homeschooling & Beyond Autumn 2024 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-december-2025": {
    src: "/magazine-covers/sa-homeschooling-december-2025.jpg",
    alt: "SA Homeschooling & Beyond December 2025 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-1": {
    src: "/magazine-covers/sa-homeschooling-issue-1.jpg",
    alt: "SA Homeschooling & Beyond Issue 1 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-1-2025": {
    src: "/magazine-covers/sa-homeschooling-issue-1-2025.jpg",
    alt: "SA Homeschooling & Beyond Issue 1 2025 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-11-spring-2022": {
    src: "/magazine-covers/sa-homeschooling-issue-11-spring-2022.jpg",
    alt: "SA Homeschooling & Beyond Issue 11 Spring 2022 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-12-summer-2022": {
    src: "/magazine-covers/sa-homeschooling-issue-12-summer-2022.jpg",
    alt: "SA Homeschooling & Beyond Issue 12 Summer 2022 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-13-autumn-2023": {
    src: "/magazine-covers/sa-homeschooling-issue-13-autumn-2023.jpg",
    alt: "SA Homeschooling & Beyond Issue 13 Autumn 2023 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-14-winter-2023": {
    src: "/magazine-covers/sa-homeschooling-issue-14-winter-2023.jpg",
    alt: "SA Homeschooling & Beyond Issue 14 Winter 2023 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-15-spring-2023": {
    src: "/magazine-covers/sa-homeschooling-issue-15-spring-2023.jpg",
    alt: "SA Homeschooling & Beyond Issue 15 Spring 2023 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-16-summer-2023": {
    src: "/magazine-covers/sa-homeschooling-issue-16-summer-2023.jpg",
    alt: "SA Homeschooling & Beyond Issue 16 Summer 2023 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-issue-2-2021": {
    src: "/magazine-covers/sa-homeschooling-issue-2-2021.jpg",
    alt: "SA Homeschooling & Beyond Issue 2 2021 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-3-2021": {
    src: "/magazine-covers/sa-homeschooling-issue-3-2021.jpg",
    alt: "SA Homeschooling & Beyond Issue 3 2021 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-4-2021": {
    src: "/magazine-covers/sa-homeschooling-issue-4-2021.jpg",
    alt: "SA Homeschooling & Beyond Issue 4 2021 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-5": {
    src: "/magazine-covers/sa-homeschooling-issue-5.jpg",
    alt: "SA Homeschooling & Beyond Issue 5 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-6-2021": {
    src: "/magazine-covers/sa-homeschooling-issue-6-2021.jpg",
    alt: "SA Homeschooling & Beyond Issue 6 2021 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-7-2021": {
    src: "/magazine-covers/sa-homeschooling-issue-7-2021.jpg",
    alt: "SA Homeschooling & Beyond Issue 7 2021 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-8-2022": {
    src: "/magazine-covers/sa-homeschooling-issue-8-2022.jpg",
    alt: "SA Homeschooling & Beyond Issue 8 2022 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-issue-9-2022": {
    src: "/magazine-covers/sa-homeschooling-issue-9-2022.jpg",
    alt: "SA Homeschooling & Beyond Issue 9 2022 cover",
    width: 974,
    height: 1263,
  },
  "sa-homeschooling-spring-2024": {
    src: "/magazine-covers/sa-homeschooling-spring-2024.jpg",
    alt: "SA Homeschooling & Beyond Spring 2024 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-spring-2025": {
    src: "/magazine-covers/sa-homeschooling-spring-2025.jpg",
    alt: "SA Homeschooling & Beyond Spring 2025 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-summer-2024": {
    src: "/magazine-covers/sa-homeschooling-summer-2024.jpg",
    alt: "SA Homeschooling & Beyond Summer 2024 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-winter-2024": {
    src: "/magazine-covers/sa-homeschooling-winter-2024.jpg",
    alt: "SA Homeschooling & Beyond Winter 2024 cover",
    width: 893,
    height: 1263,
  },
  "sa-homeschooling-winter-2025": {
    src: "/magazine-covers/sa-homeschooling-winter-2025.jpg",
    alt: "SA Homeschooling & Beyond Winter 2025 cover",
    width: 893,
    height: 1263,
  },
} satisfies Record<string, NonNullable<MagazineIssue["coverImage"]>>;

const localMagazineOrder = [
  "sahab-june-2026",
  "sa-homeschooling-december-2025",
  "sa-homeschooling-spring-2025",
  "sa-homeschooling-winter-2025",
  "sa-homeschooling-issue-1-2025",
  "sa-homeschooling-summer-2024",
  "sa-homeschooling-spring-2024",
  "sa-homeschooling-winter-2024",
  "sa-homeschooling-autumn-2024",
  "sa-homeschooling-issue-16-summer-2023",
  "sa-homeschooling-issue-15-spring-2023",
  "sa-homeschooling-issue-14-winter-2023",
  "sa-homeschooling-issue-13-autumn-2023",
  "sa-homeschooling-issue-12-summer-2022",
  "sa-homeschooling-issue-11-spring-2022",
  "sa-homeschooling-issue-9-2022",
  "sa-homeschooling-issue-8-2022",
  "sa-homeschooling-issue-7-2021",
  "sa-homeschooling-issue-6-2021",
  "sa-homeschooling-issue-5",
  "sa-homeschooling-issue-4-2021",
  "sa-homeschooling-issue-3-2021",
  "sa-homeschooling-issue-2-2021",
  "sa-homeschooling-issue-1",
] as const;

const localMagazineDescriptions: Record<(typeof localMagazineOrder)[number], string> = {
  "sahab-june-2026":
    "The SA Homeschooling & Beyond June 2026 issue brings families fresh guidance, practical education support, and inspiring ideas for learning at home. Explore the latest stories, resources, and expert insight for South African homeschool parents and learners.",
  "sa-homeschooling-december-2025":
    "The SA Homeschooling December 2025 issue is dedicated to empowering parents for a successful academic year ahead, focusing on essential developmental, educational, and planning topics. The magazine explores critical foundations for learning, featuring articles like “Sleep Your Way to Success,” which highlights how crucial quality sleep is for improving a homeschooler’s memory, emotional regulation, and overall academic performance. Addressing special needs, the cover story asks “What are the Best Educational Options for Autism?” offering insight into the condition and explaining why homeschooling is often the preferred, low-sensory, and flexible choice for many South African families.",
  "sa-homeschooling-spring-2025":
    "The Spring 2025 issue of SA Homeschooling and Beyond magazine explores key topics shaping modern homeschooling in South Africa. It discusses the importance of choosing pure mathematics, the growing role of AI in education, and how extra lessons can help close academic gaps. The magazine also features a story of a family homeschooling a child with autism, highlighting resilience and personalized learning. Parents are guided on understanding and managing ADHD in children through practical, expert-backed strategies. Lifestyle content includes a comforting oxtail recipe that turns cooking into a family learning experience.",
  "sa-homeschooling-winter-2025":
    "The Winter 2025 edition of SA Homeschooling & Beyond explores parenting in the digital age, the timeless value of classic books, family bonding through cooking, and the beauty of the homeschooling journey. Packed with practical guides, resources, and inspiration, this issue connects homeschooling families with the tools and brands that support their learning and lifestyle.",
  "sa-homeschooling-issue-1-2025":
    "SA Homeschooling & Beyond – Issue 1, 2025 is a vibrant, family-focused publication that explores the evolving landscape of education in South Africa, with a strong emphasis on homeschooling, alternative learning paths, and youth empowerment. This spring edition blends practical advice, expert insights, and inspiring stories to support parents, educators, and learners navigating non-traditional schooling",
  "sa-homeschooling-summer-2024":
    "SA Homeschooling & Beyond – Summer 2024 Edition is a warm, insightful magazine tailored for South African families navigating homeschooling, alternative education, and parenting in a rapidly evolving world. This festive-season issue blends practical guidance with emotional support, creative inspiration, and expert advice to help parents and learners thrive.",
  "sa-homeschooling-spring-2024":
    "SA Homeschooling & Beyond – Spring 2024 Edition is a thoughtful and empowering resource for South African families navigating education, parenting, and youth development. This issue leans into emotional well-being, digital literacy, and future-readiness, offering both practical advice and heartfelt perspectives.",
  "sa-homeschooling-winter-2024":
    "SA Homeschooling & Beyond – Winter 2024 Edition is a rich and reflective guide for South African families navigating homeschooling, parenting, and education during the colder months. This issue leans into emotional resilience, academic strategy, and holistic development, offering practical tools and heartfelt insights for learners and parents alike.",
  "sa-homeschooling-autumn-2024":
    "SA Homeschooling & Beyond – Autumn 2024 Edition is a rich and reflective magazine designed for South African families exploring homeschooling, alternative education, and youth development. This issue leans into emotional intelligence, academic strategy, and future-readiness, offering practical tools and heartfelt insights for learners and parents alike.",
  "sa-homeschooling-issue-16-summer-2023":
    "SA Homeschooling & Beyond – Issue 16, Summer 2023 is a lively and insightful edition that blends practical homeschooling guidance with emotional support, creative inspiration, and future-focused advice for South African families. It’s designed to help parents and learners thrive during the festive season and beyond.",
  "sa-homeschooling-issue-15-spring-2023":
    "SA Homeschooling & Beyond – Issue 15, Spring 2023 is a vibrant, practical, and emotionally intelligent edition that speaks directly to South African homeschooling families navigating exam season, personal growth, and future planning.",
  "sa-homeschooling-issue-14-winter-2023":
    "SA Homeschooling & Beyond – Issue 14, Winter 2023 is a rich, emotionally resonant edition that blends practical homeschooling strategies with empowering insights for parents and learners navigating the colder months.",
  "sa-homeschooling-issue-13-autumn-2023":
    "SA Homeschooling & Beyond – Issue 13, Autumn 2023 is a heartfelt and practical edition that dives into the emotional, cognitive, and logistical aspects of homeschooling, especially for families navigating new beginnings and academic challenges.",
  "sa-homeschooling-issue-12-summer-2022":
    "SA Homeschooling & Beyond – Issue 12, Summer 2022 is a vibrant, future-focused edition that celebrates the power of homeschooling to nurture confident, curious, and capable learners in South Africa.",
  "sa-homeschooling-issue-11-spring-2022":
    "SA Homeschooling & Beyond – Issue 11, Spring 2022 is a dynamic, emotionally intelligent edition that blends practical homeschooling advice with creative inspiration, cognitive insights, and family bonding ideas.",
  "sa-homeschooling-issue-9-2022":
    "SA Homeschooling & Beyond – Issue 9, 2022 is a foundational edition that speaks directly to South African families exploring the possibilities of homeschooling and alternative education. It’s packed with practical advice, emotional support, and empowering insights for both new and experienced homeschoolers",
  "sa-homeschooling-issue-8-2022":
    "SA Homeschooling Issue 8 (2022) explores the evolving landscape of education in South Africa, spotlighting flexible learning models, parental empowerment, and the emotional journey of homeschooling",
  "sa-homeschooling-issue-7-2021":
    "SA Homeschooling & Beyond – Issue 7, 2021 is a foundational edition that captures the heart of South Africa’s homeschooling movement during a time of global educational shifts. It offers practical guidance for new homeschoolers, emotional support for families adjusting to change, and expert insights into learning strategies that work.",
  "sa-homeschooling-issue-6-2021":
    "SA Homeschooling – Issue 6, 2021 is a vibrant, family-focused edition that celebrates curiosity, creativity, and connection in the homeschooling journey. With its theme “Living & Learning – Together,” this issue blends practical advice with emotional insight and hands-on activities.",
  "sa-homeschooling-issue-5":
    "SA Homeschooling – Issue 5, 2021 explores the theme of “Learning Through Life,” highlighting how everyday experiences—from gardening to storytelling—can become powerful educational moments.",
  "sa-homeschooling-issue-4-2021":
    "SA Homeschooling – Issue 4, 2021 is a rich and practical edition themed around “Living & Learning – Together,” offering families tools to future-proof their teens, nurture cognitive development, and stay grounded through seasonal shifts.",
  "sa-homeschooling-issue-3-2021":
    "A Homeschooling – Issue 3, 2021 dives into the theme of “Learning Through Life,” celebrating how everyday experiences—from baking to budgeting—can become powerful educational tools.",
  "sa-homeschooling-issue-2-2021":
    "SA Homeschooling – Issue 2, 2021 is a dynamic and emotionally resonant edition that blends practical tools with heartfelt stories to support families navigating homeschooling during uncertain times.",
  "sa-homeschooling-issue-1":
    "SA Homeschooling – Issue 1 marks the beginning of a heartfelt and practical journey into alternative education in South Africa. This debut edition introduces core homeschooling principles, shares real-life stories from families, and offers expert insights into learning styles, emotional development, and curriculum choices. It sets the tone for a community-driven, values-based approach to education—where curiosity, connection, and flexibility lead the way.",
};

const localMagazineTitles: Partial<Record<(typeof localMagazineOrder)[number], string>> = {
  "sahab-june-2026": "SA Homeschooling & Beyond June 2026",
  "sa-homeschooling-issue-5": "SA Homeschooling Issue 5 2021",
};

const localMagazinePdfUrls: Partial<Record<(typeof localMagazineOrder)[number], string>> = {
  "sahab-june-2026": `${WORDPRESS_ORIGIN}/wp-content/uploads/2026/06/SAHAB_June-2026_Web_300dpi_Rasterized.pdf`,
};

const magazineFallbackCovers = [
  {
    src: "/images/photo-homeschool-family-table.png",
    alt: "Homeschool family working together at a table",
    width: 1200,
    height: 800,
    keywords: ["family", "home", "homeschool", "parent", "children"],
  },
  {
    src: "/images/photo-online-learning-family.png",
    alt: "Family using online learning resources",
    width: 1200,
    height: 800,
    keywords: ["online", "digital", "learning", "school"],
  },
  {
    src: "/images/photo-passion-learning-tools.png",
    alt: "Colourful learning tools and school supplies",
    width: 1200,
    height: 800,
    keywords: ["learning", "tools", "resources", "guide"],
  },
  {
    src: "/images/photo-learning-materials.jpg",
    alt: "Learning materials arranged on a desk",
    width: 1200,
    height: 800,
    keywords: ["materials", "books", "study", "guide"],
  },
  {
    src: "/images/photo-library.jpg",
    alt: "Library shelves with study books",
    width: 1200,
    height: 800,
    keywords: ["books", "library", "reading"],
  },
  {
    src: "/images/photo-studying.jpg",
    alt: "Student studying with notes",
    width: 1200,
    height: 800,
    keywords: ["study", "exam", "matric"],
  },
  {
    src: "/images/photo-maths.jpg",
    alt: "Maths learning materials on a desk",
    width: 1200,
    height: 800,
    keywords: ["maths", "exam", "study"],
  },
  {
    src: "/images/photo-tutor.jpg",
    alt: "Tutor helping a learner",
    width: 1200,
    height: 800,
    keywords: ["tutor", "teacher", "support"],
  },
  {
    src: "/images/photo-classroom.jpg",
    alt: "Classroom learning space",
    width: 1200,
    height: 800,
    keywords: ["classroom", "school", "education"],
  },
  {
    src: "/images/photo-desk-supplies.jpg",
    alt: "Desk with homeschool supplies",
    width: 1200,
    height: 800,
    keywords: ["desk", "supplies", "planning"],
  },
  {
    src: "/images/photo-leadership-booklet.jpg",
    alt: "Leadership booklet and study notes",
    width: 1200,
    height: 800,
    keywords: ["leadership", "development", "guide"],
  },
  {
    src: "/images/photo-homeschool-success.png",
    alt: "Homeschool success sign and study items",
    width: 1200,
    height: 800,
    keywords: ["success", "homeschool", "motivation"],
  },
];

const categoryAliases: Record<string, string> = {
  education: "newspack-featured",
  parenting: "partner",
  "ask-dalena": "newspack-ask-dalena",
  "cooking-bonding": "cooking-and-bonding",
};

const fallbackAds: Record<AdPlacement, SiteAd> = {
  "home-top": {
    id: "ad-home-above-menu",
    placement: "home-top",
    dataUnit: "newspack_home_above_menu",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
  "home-middle": {
    id: "ad-after-hero",
    placement: "home-middle",
    dataUnit: "newspack_after_hero",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
  "home-bottom": {
    id: "ad-footer-wide",
    placement: "home-bottom",
    dataUnit: "newspack_home_footer",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
  "article-top": {
    id: "ad-article-top",
    placement: "article-top",
    dataUnit: "newspack_article_top",
    sizeClass: "google-ad-slot--leaderboard-sm",
    google: googleLeaderboardAd,
  },
  "article-inline": {
    id: "ad-article-inline",
    placement: "article-inline",
    dataUnit: "newspack_article_inline",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
  "article-sidebar": {
    id: "ad-article-sidebar",
    placement: "article-sidebar",
    dataUnit: "newspack_article_sidebar",
    sizeClass: "google-ad-slot--medium-rect",
    google: googleSidebarAd,
  },
  "category-top": {
    id: "ad-category-top",
    placement: "category-top",
    dataUnit: "newspack_education_top",
    sizeClass: "google-ad-slot--leaderboard-sm",
    google: googleLeaderboardAd,
  },
  "magazine-top": {
    id: "ad-magazines-bottom",
    placement: "magazine-top",
    dataUnit: "newspack_magazines_bottom",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
  "directory-top": {
    id: "ad-directory-sidebar",
    placement: "directory-top",
    dataUnit: "newspack_directory_sidebar",
    sizeClass: "google-ad-slot--directory-rect",
    google: googleSidebarAdAlt,
  },
  "subscribe-bottom": {
    id: "ad-newsletter-leaderboard",
    placement: "subscribe-bottom",
    dataUnit: "newspack_newsletter_footer",
    sizeClass: "google-ad-slot--leaderboard",
    google: googleLeaderboardAd,
  },
};

function resolveCategorySlug(slug: string) {
  return categoryAliases[slug] ?? slug;
}

function normalizeCategory(category: WPCategory): WPCategory {
  return {
    ...category,
    name: decodeHtml(category.name),
    description: stripHtml(category.description ?? ""),
  };
}

function normalizeTag(tag: WPTag): WPTag {
  return {
    ...tag,
    name: decodeHtml(tag.name),
    description: stripHtml(tag.description ?? ""),
  };
}

// Keep embedded images, authors and categories without the full SEO schema payload.
const postResponseFields = "id,date,modified,slug,link,author,featured_media,categories,tags,title,excerpt,content,_links,_embedded,aioseo_head_json.twitter:image,aioseo_head_json.og:image";

function apiUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${WP_API.replace(/\/$/, "")}${path}`);

  if (path === "/wp/v2/posts") url.searchParams.set("_fields", postResponseFields);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function logWordPressError(context: string, error: unknown) {
  console.warn(`[wordpress] ${context}: ${getErrorMessage(error)}`);
}

async function loadWordPressResponse(url: string, paginated = false) {
    const res = await fetch(url, {
      headers: wordpressFetchHeaders,
      signal: AbortSignal.timeout(wpRequestTimeoutMs),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`WordPress request failed (${res.status} ${res.statusText}): ${url}`);
    }

    const value = await res.json();
    return paginated ? {
      posts: value,
      total: Number(res.headers.get("x-wp-total") ?? 0),
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? 0),
    } : value;
}

const cachedWordPressJson = unstable_cache(
  async (url: string) => prepareWordPressCacheValue(await loadWordPressResponse(url)),
  ["wordpress-json-cms-only-v2"],
  { revalidate, tags: ["wordpress-json"] },
);

const cachedWordPressPaginated = unstable_cache(
  async (url: string) => prepareWordPressCacheValue(await loadWordPressResponse(url, true)),
  ["wordpress-paginated-cms-only-v2"],
  { revalidate, tags: ["wordpress-paginated"] },
);

async function fetchWordPressJson(url: string) {
  if (process.env.NODE_ENV === "development") return loadWordPressResponse(url);
  return resolveWordPressCacheValue(await cachedWordPressJson(url), () => loadWordPressResponse(url));
}

async function fetchWordPressPaginated(url: string) {
  if (process.env.NODE_ENV === "development") return await loadWordPressResponse(url, true) as PaginatedPosts;
  return await resolveWordPressCacheValue(await cachedWordPressPaginated(url), () => loadWordPressResponse(url, true)) as PaginatedPosts;
}

async function wpFetch<T>(path: string, params?: Record<string, string | number | undefined>) {
  const url = apiUrl(path, params);

  try {
    return (await fetchWordPressJson(url)) as T;
  } catch (error) {
    throw new Error(`WordPress request failed: ${url} (${getErrorMessage(error)})`);
  }
}

async function wpFetchPaginated(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<PaginatedPosts> {
  const url = apiUrl(path, params);

  try {
    return await fetchWordPressPaginated(url);
  } catch (error) {
    throw new Error(`WordPress request failed: ${url} (${getErrorMessage(error)})`);
  }
}

function listParam(value?: number | number[]) {
  return Array.isArray(value) ? value.join(",") : value;
}

async function getCmsPosts(options: GetPostsOptions): Promise<PaginatedPosts> {
  return wpFetchPaginated("/wp/v2/posts", {
    status: "publish",
    _embed: options.embed ?? 1,
    categories: listParam(options.categories),
    tags: listParam(options.tags),
    exclude: listParam(options.exclude),
    search: options.search,
    per_page: Math.min(100, Math.max(1, options.perPage ?? 10)),
    page: Number.isSafeInteger(options.page) && (options.page ?? 0) > 0 ? options.page! : 1,
  });
}

export async function getPosts(options: GetPostsOptions = {}) {
  try {
    return (await getCmsPosts(options)).posts;
  } catch (error) {
    logWordPressError("getPosts failed", error);
    return [];
  }
}

export async function getPaginatedPosts(options: GetPostsOptions = {}) {
  try {
    return await getCmsPosts(options);
  } catch (error) {
    logWordPressError("getPaginatedPosts failed", error);
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const posts = await wpFetch<WPPost[]>("/wp/v2/posts", {
      status: "publish",
      _embed: 1,
      slug: encodeURIComponent(slug),
      per_page: 1,
    });

    return posts[0] ?? null;
  } catch (error) {
    logWordPressError(`getPostBySlug failed for "${slug}"`, error);
    return null;
  }
}

export async function getAdjacentPosts(post: WPPost) {
  function choose(posts: WPPost[], direction: "before" | "after") {
    return posts
      .filter(candidate => candidate.slug !== post.slug && (direction === "before" ? candidate.date < post.date : candidate.date > post.date))
      .sort((a, b) => direction === "before" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))[0] ?? null;
  }
  async function find(direction: "before" | "after") {
    try {
      const posts = await wpFetch<WPPost[]>("/wp/v2/posts", {
      status: "publish",
        per_page: 1, _embed: 1, exclude: post.id,
        [direction]: post.date,
        order: direction === "before" ? "desc" : "asc",
        orderby: "date",
      });
      return choose(posts, direction);
    } catch {
      return null;
    }
  }
  const [previous, next] = await Promise.all([find("before"), find("after")]);
  return { previous, next };
}

export async function getCategories() {
  try {
    const categories = await wpFetch<WPCategory[]>("/wp/v2/categories", {
      per_page: 100,
      orderby: "count",
      order: "desc",
    });

    return categories.map(normalizeCategory);
  } catch (error) {
    logWordPressError("getCategories failed", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const categories = await wpFetch<WPCategory[]>("/wp/v2/categories", {
      slug: encodeURIComponent(resolveCategorySlug(slug)),
      per_page: 1,
    });

    return categories[0] ? normalizeCategory(categories[0]) : null;
  } catch (error) {
    logWordPressError(`getCategoryBySlug failed for "${slug}"`, error);
    return null;
  }
}

export async function getPostsByCategory(slug: string, page = 1, perPage = 9) {
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { category: null, posts: [], total: 0, totalPages: 0 };
  }

  const result = await getPaginatedPosts({
    categories: category.id,
    page,
    perPage,
  });

  return { category, ...result };
}

export async function getTags() {
  try {
    const tags = await wpFetch<WPTag[]>("/wp/v2/tags", {
      per_page: 100,
      orderby: "count",
      order: "desc",
    });

    return tags.map(normalizeTag);
  } catch (error) {
    logWordPressError("getTags failed", error);
    return [];
  }
}

export async function getTagBySlug(slug: string) {
  try {
    const tags = await wpFetch<WPTag[]>("/wp/v2/tags", {
      slug: encodeURIComponent(slug),
      per_page: 1,
    });

    return tags[0] ? normalizeTag(tags[0]) : null;
  } catch (error) {
    logWordPressError(`getTagBySlug failed for "${slug}"`, error);
    return null;
  }
}

export async function getPostsByTag(slug: string, page = 1, perPage = 9) {
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return { tag: null, posts: [], total: 0, totalPages: 0 };
  }

  const result = await getPaginatedPosts({
    tags: tag.id,
    page,
    perPage,
  });

  return { tag, ...result };
}

export async function getAuthors() {
  try {
    const authors = await wpFetch<WPAuthor[]>("/wp/v2/users", {
      per_page: 100,
    });

    return authors.map(normalizeAuthor);
  } catch (error) {
    logWordPressError("getAuthors failed", error);
    return [];
  }
}

export async function getAuthorBySlug(slug: string) {
  try {
    const authors = await wpFetch<WPAuthor[]>("/wp/v2/users", {
      slug: encodeURIComponent(slug),
      per_page: 1,
    });

    return authors[0] ? normalizeAuthor(authors[0]) : null;
  } catch (error) {
    logWordPressError(`getAuthorBySlug failed for "${slug}"`, error);
    return null;
  }
}

export async function getPostsByAuthor(authorId: number, perPage = 12) {
  try {
    const posts = await wpFetch<WPPost[]>("/wp/v2/posts", {
      status: "publish",
      _embed: 1,
      author: authorId,
      per_page: perPage,
    });
    return posts;
  } catch (error) {
    logWordPressError(`getPostsByAuthor failed for "${authorId}"`, error);
    return [];
  }
}

export async function getMagazineEmbedData() {
  const page = await getMagazineWordPressPage();

  if (!page) return [];

  return parseDFlipIssues(page.content.rendered);
}

export async function getMagazinePosts() {
  const [embedResult, relatedPostResult] = await Promise.allSettled([
    getMagazineEmbedData(),
    getMagazineRelatedPosts(),
  ]);
  const embeddedIssues = embedResult.status === "fulfilled" ? embedResult.value : [];
  const relatedPosts = relatedPostResult.status === "fulfilled" ? relatedPostResult.value : [];
  const enrichedEmbeddedIssues = embeddedIssues.map((issue) => {
    const post = findMagazinePost(issue, relatedPosts);

    if (!post) return issue;

    return {
      ...issue,
      title: getPostTitle(post) || issue.title,
      description: getPostExcerpt(post, 260) || issue.description,
      date: post.date,
      sourcePost: post,
      coverImage: getMagazineCoverImage(
        getLocalMagazineCover(issue, post),
        issue.coverImage,
        getMagazineMetadataCover(post),
        getFeaturedImage(post),
      ),
    };
  });
  const postIssues = relatedPosts.flatMap(getMagazineIssuesFromPost);
  const issues = dedupeMagazineIssues([...postIssues, ...enrichedEmbeddedIssues]);

  return applyMagazineFallbackCovers(issues.map((issue) => ({
    ...issue,
    // Embedded archive entries can carry a landscape promotional thumbnail.
    // Prefer the verified full cover even when no announcement post was matched.
    coverImage: getMagazineCoverImage(getLocalMagazineCover(issue, issue.sourcePost), issue.coverImage),
    description: /september[-\s_]*2026/i.test(`${issue.title} ${issue.slug}`)
      ? issue.description.replace(/August 2026/gi, "September 2026")
      : issue.description,
  }))).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getMagazineBySlug(slug: string) {
  const issues = await getMagazinePosts();
  const exactIssue = issues.find((issue) => issue.slug === slug);

  if (exactIssue && (!hasMagazineSlugDate(slug) || matchesMagazineSlugDate(slug, exactIssue))) return exactIssue;

  const dateMatchedIssue = issues.find((issue) => matchesMagazineSlugDate(slug, issue));

  if (dateMatchedIssue) return dateMatchedIssue;

  return issues.find((issue) => issue.sourcePost?.slug === slug) ?? null;
}

export async function getAds() {
  const ads = { ...fallbackAds };

  try {
    const wpAds = await wpFetch<WPAdCode[]>("/wp/v2/newspack_ad_codes", {
      per_page: 100,
    });

    wpAds.forEach((wpAd) => {
      const placement = resolveAdPlacement(wpAd);

      if (!placement) return;

      const fallback = ads[placement];

      ads[placement] = {
        ...fallback,
        id: `wp-ad-${wpAd.id}`,
        html: sanitizeAdHtml(wpAd.content?.rendered ?? ""),
        takeover: parseTakeoverConfig(wpAd.acf?.takeover ?? wpAd.meta?.takeover),
      };
    });
  } catch (error) {
    logWordPressError("getAds failed", error);
    return Object.values(ads);
  }

  return Object.values(ads);
}

export async function getAdByPlacement(placement: AdPlacement) {
  const ads = await getAds();

  return ads.find((ad) => ad.placement === placement) ?? fallbackAds[placement];
}

export function decodeHtml(value = "") {
  return value
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function stripHtml(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

export function getPostTitle(post: WPPost) {
  return decodeHtml(post.title.rendered);
}

export function getPostExcerpt(post: WPPost, fallbackLength = 170) {
  const excerpt = stripHtml(post.excerpt.rendered);

  if (excerpt) return excerpt;

  return `${stripHtml(post.content.rendered).slice(0, fallbackLength).trim()}...`;
}

export function getPostAuthor(post: WPPost) {
  return post._embedded?.author?.[0]?.name ?? "SA Homeschooling";
}

export function getPostAuthorSlug(post: WPPost) {
  return post._embedded?.author?.[0]?.slug ?? "";
}

export function getPostAuthorProfile(post: WPPost) {
  const author = post._embedded?.author?.[0];

  return author ? normalizeAuthor(author) : null;
}

export function getPostCategories(post: WPPost) {
  const terms = post._embedded?.["wp:term"] ?? [];
  const categories = terms.flat().filter((term): term is WPCategory => term.taxonomy === "category");

  if (categories.length) return categories.map(normalizeCategory);

  return (terms[0] ?? []).map((term) => normalizeCategory(term as WPCategory));
}

export function getPrimaryCategory(post: WPPost) {
  return getPostCategories(post)[0]?.name ?? "SA Homeschooling";
}

export function getPostTags(post: WPPost) {
  const terms = post._embedded?.["wp:term"] ?? [];
  const embeddedTags = terms.flat().filter((term): term is WPTag => term.taxonomy === "post_tag");

  if (embeddedTags.length) return embeddedTags.map(normalizeTag);

  return (terms[1] ?? []).map((term) => normalizeTag(term as WPTag));
}

export function getFeaturedImage(post: WPPost) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes;

  return {
    src:
      sizes?.large?.source_url ??
      sizes?.medium_large?.source_url ??
      sizes?.full?.source_url ??
      media?.source_url ??
      "/images/hero-placeholder.svg",
    alt: media?.alt_text || getPostTitle(post),
    width: sizes?.large?.width ?? media?.media_details?.width ?? 1200,
    height: sizes?.large?.height ?? media?.media_details?.height ?? 800,
  };
}

export function getArticleImage(post: WPPost) {
  const featuredImage = getFeaturedImage(post);

  if (!isMagazineArticle(post)) return featuredImage;

  const parsedIssue = parseDFlipIssues(post.content.rendered)[0];
  const pdfUrl = parsedIssue?.pdfUrl ?? extractFirstPdfUrl(post.content.rendered);
  const issueForCover: Pick<MagazineIssue, "slug" | "pdfUrl"> = {
    slug: parsedIssue?.slug ?? (slugFromUrl(pdfUrl) || post.slug),
    pdfUrl,
  };

  return (
    getMagazineCoverImage(
      getLocalMagazineCover(issueForCover, post),
      parsedIssue?.coverImage,
      getMagazineMetadataCover(post),
      featuredImage,
    ) ?? featuredImage
  );
}

export function isMagazineArticle(post: WPPost) {
  const rawText = `${post.slug} ${getPostTitle(post)} ${getPostExcerpt(post)} ${post.content.rendered}`.toLowerCase();
  const postText = normalizeText(rawText);
  const hasFlipbook = rawText.includes("_df_book") || rawText.includes("df_option_") || rawText.includes("dflip");
  const hasMagazinePdf = rawText.includes(".pdf") && /\b(magazine|issue|sahab)\b/.test(postText);

  return hasFlipbook || hasMagazinePdf;
}

function getMagazineCoverImage(...covers: Array<MagazineIssue["coverImage"] | undefined>) {
  return covers.find((cover) => cover && !isPlaceholderImage(cover.src));
}

function getLocalMagazineCover(issue: Pick<MagazineIssue, "slug" | "pdfUrl">, post?: WPPost) {
  const coverAliases: Record<string, keyof typeof localMagazineCovers> = {
    "sahab-december-2025": "sa-homeschooling-december-2025",
    "sa-homeschooling-summer-2025-issue-is-here": "sa-homeschooling-december-2025",
  };
  const candidates = [
    slugFromUrl(issue.pdfUrl),
    issue.slug,
    post?.slug,
    post ? slugFromUrl(extractFirstPdfUrl(post.content.rendered)) : "",
  ].filter(Boolean);

  return candidates.map((candidate) => {
    if (!candidate) return undefined;
    const key = coverAliases[candidate] ?? candidate as keyof typeof localMagazineCovers;
    return localMagazineCovers[key];
  }).find(Boolean);
}

function isPlaceholderImage(src?: string) {
  return !src || src.includes("/images/hero-placeholder.svg");
}

function applyMagazineFallbackCovers(issues: MagazineIssue[]) {
  const usedFallbacks = new Set<string>();

  return issues.map((issue) => {
    if (issue.coverImage && !isPlaceholderImage(issue.coverImage.src)) return issue;

    const cover = pickMagazineFallbackCover(issue, usedFallbacks);

    return {
      ...issue,
      coverImage: {
        src: cover.src,
        alt: cover.alt,
        width: cover.width,
        height: cover.height,
      },
    };
  });
}

function pickMagazineFallbackCover(issue: MagazineIssue, usedFallbacks: Set<string>) {
  const haystack = normalizeText(`${issue.title} ${issue.slug} ${issue.description}`);
  const unused = magazineFallbackCovers.filter((cover) => !usedFallbacks.has(cover.src));
  const pool = unused.length ? unused : magazineFallbackCovers;
  const keywordMatch = pool.find((cover) => cover.keywords.some((keyword) => haystack.includes(keyword)));
  const issueNumber = Number(issue.issueNumber ?? issue.slug.match(/issue-(\d+)/)?.[1] ?? issue.id.replace(/\D/g, ""));
  const fallback = keywordMatch ?? pool[Math.abs(Number.isFinite(issueNumber) ? issueNumber : hashString(issue.slug)) % pool.length];

  usedFallbacks.add(fallback.src);
  return fallback;
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function normalizeAuthor(author: WPAuthor): WPAuthor {
  return {
    ...author,
    name: decodeHtml(author.name),
    description: stripHtml(author.description ?? ""),
  };
}

export function getAuthorBio(author: WPAuthor | null | undefined) {
  return author?.description || "SA Homeschooling contributor.";
}

export function getAuthorAvatar(author: WPAuthor | null | undefined) {
  const avatars = author?.avatar_urls;
  const src = avatars?.["192"] ?? avatars?.["96"] ?? avatars?.["48"] ?? avatars?.["24"];

  return src
    ? {
        src,
        alt: author?.name ? `${author.name} profile image` : "Author profile image",
      }
    : null;
}

export function getAuthorEmail(author: WPAuthor | null | undefined) {
  return author?.email || null;
}

async function getMagazineWordPressPage() {
  try {
    const pages = await wpFetch<WPPage[]>("/wp/v2/pages", {
      _embed: 1,
      slug: "magazine",
      per_page: 1,
    });

    if (pages[0]) return pages[0];

    return await wpFetch<WPPage>("/wp/v2/pages/1788", {
      _embed: 1,
    });
  } catch (error) {
    logWordPressError("getMagazineWordPressPage failed", error);
    return null;
  }
}

async function getMagazineRelatedPosts() {
  const [magazineResult, issueResult] = await Promise.allSettled([
    getPosts({ perPage: 20, search: "magazine", embed: "wp:featuredmedia" }),
    getPosts({ perPage: 20, search: "issue", embed: "wp:featuredmedia" }),
  ]);
  const posts = [
    ...(magazineResult.status === "fulfilled" ? magazineResult.value : []),
    ...(issueResult.status === "fulfilled" ? issueResult.value : []),
  ];
  const seen = new Set<number>();

  return posts
    .filter((post) => {
      const haystack = `${post.slug} ${getPostTitle(post)} ${getPostExcerpt(post)} ${stripHtml(post.content.rendered)}`.toLowerCase();
      const isMagazine = haystack.includes("magazine") || haystack.includes("issue") || haystack.includes(".pdf");

      if (!isMagazine || seen.has(post.id)) return false;

      seen.add(post.id);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function parseDFlipIssues(content: string): MagazineIssue[] {
  const paragraphs = Array.from(content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripHtml(match[1]))
    .filter((text) => text.length > 40);
  const scriptMatches = Array.from(
    content.matchAll(/window\.(df_option_\d+)\s*=\s*({[\s\S]*?})\s*;\s*if\s*\(window\.DFLIP/g),
  );

  return scriptMatches
    .map((match, index) => {
      const option = parseDFlipOption(match[2]);
      const pdfUrl = normalizePublicUrl(option?.source);
      const slug = slugFromUrl(pdfUrl) || option?.slug || `magazine-${option?.id ?? index + 1}`;
      const title = option?.title && option.title !== slug ? decodeHtml(option.title) : titleFromSlug(slug);
      const description =
        paragraphs[index] || `${title} is available to read online as part of the SA Homeschooling & Beyond archive.`;
      const coverUrl = normalizePublicUrl(option?.thumb || option?.thumbnail || option?.cover || option?.coverImage || option?.texture);

      return {
        id: String(option?.id ?? slug),
        slug,
        title,
        issueNumber: extractIssueNumber(`${title} ${slug} ${pdfUrl ?? ""}`),
        description,
        pdfUrl,
        embedUrl: `/magazines/embed/${slug}`,
        dflipId: String(option?.id ?? slug),
        dflipOption: option ?? undefined,
        coverImage: coverUrl
          ? {
              src: coverUrl,
              alt: `${title} cover`,
              width: 800,
              height: 1100,
            }
          : undefined,
      };
    })
    .filter((issue) => issue.pdfUrl || issue.embedUrl);
}

export function getMagazineIssueForPost(post: WPPost) {
  if (!isMagazineArticle(post)) return null;
  return getMagazineIssuesFromPost(post)[0] ?? null;
}

function getMagazineIssuesFromPost(post: WPPost): MagazineIssue[] {
  const postTitle = getPostTitle(post);
  const postDescription = getPostExcerpt(post, 260);
  const postCover = getFeaturedImage(post);
  const metadataCover = getMagazineMetadataCover(post);
  const parsedIssues = parseDFlipIssues(post.content.rendered);

  if (parsedIssues.length) {
    return parsedIssues.map((issue) => ({
      ...issue,
      id: `${post.id}-${issue.id}`,
      title: postTitle || issue.title,
      description: postDescription || issue.description,
      date: post.date,
      sourcePost: post,
      coverImage: getMagazineCoverImage(getLocalMagazineCover(issue, post), issue.coverImage, metadataCover, postCover),
    }));
  }

  const pdfUrl = extractFirstPdfUrl(post.content.rendered);

  if (!pdfUrl) return [];

  const slug = slugFromUrl(pdfUrl) || post.slug;
  const issue: MagazineIssue = {
    id: String(post.id),
    slug,
    title: postTitle || titleFromSlug(slug),
    issueNumber: extractIssueNumber(`${postTitle} ${slug} ${pdfUrl}`),
    description: postDescription || `${postTitle || titleFromSlug(slug)} is available to read online.`,
    date: post.date,
    pdfUrl,
    embedUrl: `/magazines/embed/${slug}`,
    sourcePost: post,
  };

  return [
    {
      ...issue,
      coverImage: getMagazineCoverImage(getLocalMagazineCover(issue, post), metadataCover, postCover),
    },
  ];
}

function getMagazineMetadataCover(post: WPPost) {
  const metadata = post.aioseo_head_json ?? {};
  const candidates = [
    metadata["twitter:image"],
    metadata["og:image"],
    extractMetaContent(post.aioseo_head, "twitter:image"),
    extractMetaContent(post.aioseo_head, "og:image"),
  ];
  const src = candidates.map((candidate) => normalizePublicUrl(asString(candidate))).find(Boolean);

  return src
    ? {
        src,
        alt: `${getPostTitle(post)} cover`,
        width: 900,
        height: 1270,
      }
    : undefined;
}

function extractMetaContent(html: string | undefined, property: string) {
  if (!html) return undefined;

  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");

  return html.match(pattern)?.[1];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function parseDFlipOption(value: string) {
  try {
    return JSON.parse(value) as DFlipOption;
  } catch {
    return null;
  }
}

function findMagazinePost(issue: MagazineIssue, posts: WPPost[]) {
  const issueText = normalizeText(`${issue.slug} ${issue.title} ${slugFromUrl(issue.pdfUrl)}`);

  return posts.find((post) => {
    const postText = normalizeText(`${post.slug} ${getPostTitle(post)} ${getPostExcerpt(post)} ${post.content.rendered}`);

    return postText.includes(issueText) || issueText.includes(post.slug) || sharesMagazineDate(issueText, postText);
  });
}

function dedupeMagazineIssues(issues: MagazineIssue[]) {
  const indexes = new Map<string, number>();
  const deduped: MagazineIssue[] = [];

  issues.forEach((issue) => {
    const key = getMagazineIssueKey(issue);
    const existingIndex = indexes.get(key);

    if (existingIndex === undefined) {
      indexes.set(key, deduped.length);
      deduped.push(issue);
      return;
    }

    const existing = deduped[existingIndex];

    if (getMagazineIssueQualityScore(issue) > getMagazineIssueQualityScore(existing)) {
      deduped[existingIndex] = mergeMagazineIssues(issue, existing);
    } else {
      deduped[existingIndex] = mergeMagazineIssues(existing, issue);
    }
  });

  return deduped;
}

const magazineDateWords = ["summer", "spring", "winter", "autumn", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const magazineDateAliases: Partial<Record<(typeof magazineDateWords)[number], string>> = {
  december: "summer",
  june: "winter",
};
const magazineIssueNumberYearAliases: Record<string, string> = {
  "2": "2021",
  "3": "2021",
  "4": "2021",
  "5": "2021",
  "6": "2021",
  "7": "2021",
  "8": "2022",
  "9": "2022",
};

function getMagazineIssueKey(issue: MagazineIssue) {
  const pdfSlug = slugFromUrl(issue.pdfUrl);
  const identityText = normalizeText(`${issue.title} ${pdfSlug} ${issue.description}`);
  const year = identityText.match(/20\d{2}/)?.[0];
  const dateWord = getMagazineDateWord(identityText);
  const issueNumber = extractIssueNumber(`${issue.title} ${issue.slug} ${issue.pdfUrl ?? ""} ${issue.description}`);
  const issueYear = year ?? (issueNumber ? magazineIssueNumberYearAliases[issueNumber] : undefined);

  if (year && dateWord) return `date:${dateWord}:${year}`;
  if (issueYear && issueNumber) return `issue:${issueNumber}:${issueYear}`;
  if (issueNumber) return `issue:${issueNumber}`;

  return pdfSlug || issue.slug;
}

function getMagazineIssueQualityScore(issue: MagazineIssue) {
  let score = 0;

  if (issue.pdfUrl) score += issue.pdfUrl.startsWith("/magazines/") ? 14 : 20;
  if (issue.sourcePost) score += 24;
  if (issue.issueNumber) score += 4;
  if (issue.description.length > 80) score += 10;
  if (issue.coverImage && !isPlaceholderImage(issue.coverImage.src)) {
    score += issue.coverImage.src.startsWith("/magazine-covers/") ? 22 : 14;
  }
  if (isUsefulMagazineTitle(issue.title)) score += issue.title.toLowerCase().includes("sa homeschooling") ? 28 : 18;
  if (/^\d+$/.test(normalizeText(issue.title))) score -= 40;

  return score;
}

function mergeMagazineIssues(primary: MagazineIssue, secondary: MagazineIssue): MagazineIssue {
  return {
    ...secondary,
    ...primary,
    title: getBestMagazineTitle(primary.title, secondary.title),
    issueNumber: primary.issueNumber || secondary.issueNumber,
    description: primary.description || secondary.description,
    date: primary.date || secondary.date,
    pdfUrl: primary.pdfUrl || secondary.pdfUrl,
    embedUrl: primary.embedUrl || secondary.embedUrl,
    dflipId: primary.dflipId || secondary.dflipId,
    dflipOption: primary.dflipOption || secondary.dflipOption,
    coverImage: getMagazineCoverImage(primary.coverImage, secondary.coverImage),
    sourcePost: primary.sourcePost || secondary.sourcePost,
  };
}

function getBestMagazineTitle(primaryTitle: string, secondaryTitle: string) {
  return getMagazineTitleQualityScore(primaryTitle) >= getMagazineTitleQualityScore(secondaryTitle) ? primaryTitle : secondaryTitle;
}

function getMagazineTitleQualityScore(title: string) {
  const normalizedTitle = normalizeText(title);
  let score = Math.min(normalizedTitle.length, 80);

  if (/^\d+$/.test(normalizedTitle)) score -= 80;
  if (/^issue \d+$/.test(normalizedTitle)) score -= 50;
  if (normalizedTitle.includes("sa homeschooling")) score += 30;
  if (normalizedTitle.match(/20\d{2}/)) score += 16;
  if (getMagazineDateWord(normalizedTitle)) score += 12;
  if (normalizedTitle.includes("out now")) score += 8;

  return score;
}

function isUsefulMagazineTitle(title: string) {
  const normalizedTitle = normalizeText(title);

  return normalizedTitle.length > 8 && !/^\d+$/.test(normalizedTitle) && !/^issue \d+$/.test(normalizedTitle);
}

function getMagazineDateWord(value: string) {
  const dateWord = magazineDateWords.find((word) => value.includes(word));

  return dateWord ? magazineDateAliases[dateWord] ?? dateWord : undefined;
}

function hasMagazineSlugDate(slug: string) {
  const requestedText = normalizeText(slug);

  return Boolean(requestedText.match(/20\d{2}/)?.[0]) && Boolean(getMagazineDateWord(requestedText));
}

function matchesMagazineSlugDate(slug: string, issue: MagazineIssue) {
  const requestedText = normalizeText(slug);
  const issueText = normalizeText(`${issue.title} ${slugFromUrl(issue.pdfUrl)}`);
  const year = requestedText.match(/20\d{2}/)?.[0];
  const dateWord = getMagazineDateWord(requestedText);

  if (!year || !dateWord) return false;

  return issueText.includes(year) && getMagazineDateWord(issueText) === dateWord;
}

function sharesMagazineDate(a: string, b: string) {
  const year = a.match(/20\d{2}/)?.[0];

  if (!year || !b.includes(year)) return false;

  const dateWord = getMagazineDateWord(a);

  return Boolean(dateWord) && getMagazineDateWord(b) === dateWord;
}

function extractFirstPdfUrl(value: string) {
  return normalizePublicUrl(value.match(/https?:\/\/[^"'\s<>]+\.pdf/gi)?.[0]);
}

function normalizePublicUrl(value?: string) {
  if (!value) return undefined;

  const cleaned = decodeHtml(value).replace(/\\\//g, "/").trim();

  try {
    const url = new URL(cleaned, WORDPRESS_ORIGIN);

    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return undefined;
  }

  return undefined;
}

function slugFromUrl(value?: string) {
  if (!value) return "";

  const filename = value.split("/").pop()?.replace(/\.pdf(\?.*)?$/i, "") ?? "";

  return filename.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1)}`))
    .join(" ");
}

function extractIssueNumber(value: string) {
  return value.match(/issue[-_\s]*(\d+)/i)?.[1];
}

function normalizeText(value: string) {
  return stripHtml(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resolveAdPlacement(ad: WPAdCode): AdPlacement | null {
  const haystack = normalizeText(`${ad.slug} ${ad.title.rendered} ${ad.content?.rendered ?? ""}`);
  const direct = Object.keys(fallbackAds).find((placement) => haystack.includes(placement.replace("-", " ")));

  if (direct) return direct as AdPlacement;

  const dataUnit = Object.values(fallbackAds).find((fallback) => haystack.includes(normalizeText(fallback.dataUnit)));

  return dataUnit?.placement ?? null;
}

function sanitizeAdHtml(html: string) {
  if (!html || /<script/i.test(html)) return undefined;

  return html
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .trim();
}

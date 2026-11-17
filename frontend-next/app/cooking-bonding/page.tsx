import CategoryPage, { generateMetadata as categoryMetadata } from "../category/[slug]/page";

type PageProps = { searchParams: Promise<{ page?: string }> };

export function generateMetadata() {
  return categoryMetadata({ params: Promise.resolve({ slug: "cooking-bonding" }), searchParams: Promise.resolve({}) });
}

export default function Page({ searchParams }: PageProps) {
  return CategoryPage({ params: Promise.resolve({ slug: "cooking-bonding" }), searchParams });
}

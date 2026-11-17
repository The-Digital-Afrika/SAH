// Public page URLs are independent of WordPress category slugs.
const categoryPaths: Record<string, string> = {
  "education": "/education",
  "development": "/development",
  "parenting": "/parenting",
  "partner-2": "/partners",
  "cooking-bonding": "/cooking-bonding",
  "cooking-and-bonding": "/cooking-bonding",
  "ask-dalena": "/ask-dalena"
};

export function getCategoryPath(slug: string): string {
  return categoryPaths[slug] ?? `/category/${slug}`;
}

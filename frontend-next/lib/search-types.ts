export type SearchItem = { title: string; url: string; category: string; text?: string; excerpt?: string; image?: string; author?: string; date?: string };

export const searchPages: SearchItem[] = [
  { title: "Home", url: "/", category: "Page", text: "Home & School homeschooling families South Africa" },
  ...["Education", "Development", "Parenting", "Directory", "Partners", "Magazines", "Authors"].map(title => ({ title, url: `/${title.toLowerCase()}`, category: "Page" })),
  { title: "Ask Dalena", url: "/ask-dalena", category: "Page", text: "advice questions" },
  { title: "Cooking & Bonding", url: "/cooking-bonding", category: "Page", text: "recipes food family" },
  { title: "Newsletter Subscribe", url: "/subscribe", category: "Page", text: "sign up email newsletter" },
];


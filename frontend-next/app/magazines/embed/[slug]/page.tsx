import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getMagazineBySlug, getMagazinePdfReaderUrl } from "@/lib/wordpress";

type MagazineEmbedPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Magazine Viewer",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MagazineEmbedPage({ params }: MagazineEmbedPageProps) {
  const { slug } = await params;
  const issue = await getMagazineBySlug(slug);

  if (!issue) notFound();

  const pdfReaderUrl = getMagazinePdfReaderUrl(issue.pdfUrl);

  if (pdfReaderUrl) {
    redirect(pdfReaderUrl);
  }

  if (issue.sourcePost?.link) {
    redirect(issue.sourcePost.link);
  }

  return (
    <main className="dflip-embed-page dflip-embed-page--fallback">
      <p>{issue.title}</p>
    </main>
  );
}

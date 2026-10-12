import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import { getPartnerBySlug, partners } from "@/lib/partners";

type PartnerPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return partners.map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) {
    return {
      title: "Partner Not Found",
    };
  }

  return {
    title: partner.name,
    description: partner.shortDescription,
    alternates: {
      canonical: `/directory/${partner.slug}`,
    },
    openGraph: {
      title: `${partner.name} | SA Homeschooling & Beyond`,
      description: partner.shortDescription,
      url: `/directory/${partner.slug}`,
      images: [
        {
          url: partner.logo,
          width: 1200,
          height: 630,
          alt: `${partner.name} logo`,
        },
      ],
    },
  };
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);

  if (!partner) notFound();

  const pageBackgroundStyle = { "--page-bg-image": `url(${JSON.stringify(partner.logo)})` } as CSSProperties;

  return (
    <div className="directory-page partner-detail-page">
      <Header />

      <main className="directory-layout partner-detail-layout" style={pageBackgroundStyle}>
        <article className="partner-detail-card">
          <Link className="partner-back-link" href="/directory">
            Back to partners
          </Link>
          <h2>{partner.detailTitle}</h2>

          <div className="partner-detail-intro">
            <Image src={partner.logo} alt={`${partner.name} logo`} width={520} height={320} />
            <div>
              <h3>Description</h3>
              <p>{partner.description}</p>
            </div>
          </div>

          {partner.sections.map((section) => (
            <section className="partner-detail-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          <div className="partner-detail-actions">
            {partner.website ? (
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            ) : null}
            <Link href="/directory">View all partners</Link>
          </div>
        </article>

        <section className="partner-extra-grid" aria-label={`${partner.name} contact and information`}>
          <div className="partner-extra-left">
            {partner.moreInfo?.length ? (
              <div className="partner-info-panel">
                <h2>More Information</h2>
                <ul>
                  {partner.moreInfo.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          {item.label}
                        </a>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="partner-contact-panel">
              <h2>Want to know more?</h2>
              {partner.contact?.phone ? (
                <>
                  <h3>Phone</h3>
                  <p>{partner.contact.phone}</p>
                </>
              ) : null}
              {partner.contact?.email ? (
                <>
                  <h3>Email</h3>
                  <p>
                    <a href={`mailto:${partner.contact.email}`}>{partner.contact.email}</a>
                  </p>
                </>
              ) : null}
              {partner.contact?.address ? (
                <>
                  <h3>Address</h3>
                  <p>{partner.contact.address}</p>
                </>
              ) : null}
              {!partner.contact ? <p>Visit the partner website for current contact details.</p> : null}
            </div>
          </div>

          <div className="partner-extra-right">
            {partner.contact?.mapQuery ? (
              <iframe
                className="partner-map"
                title={`${partner.name} map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(partner.contact.mapQuery)}&output=embed`}
              />
            ) : null}

            <div className="partner-form-panel">
              <h2>Send a message</h2>
              <form
                className="partner-contact-form"
                action={partner.contact?.email ? `mailto:${partner.contact.email}` : undefined}
              >
                <label>
                  <span>Name</span>
                  <input name="name" type="text" placeholder="Name" />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" placeholder="Email" />
                </label>
                <label>
                  <span>Subject</span>
                  <input name="subject" type="text" placeholder="Subject" />
                </label>
                <label>
                  <span>Message</span>
                  <textarea name="message" placeholder="Message" rows={5} />
                </label>
                <button type="submit">Send Message</button>
              </form>
            </div>
          </div>
        </section>

        <aside className="directory-sidebar">
          <NewsletterAdStack idPrefix={`partner-${partner.slug}`} formClassName="sidebar-newsletter labeled" />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

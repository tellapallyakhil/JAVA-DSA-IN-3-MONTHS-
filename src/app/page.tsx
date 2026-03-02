import HomeContainer from '@/components/HomeContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "90-Day DSA Prep | Master Java, Algorithms & Placement Interviews",
  description: "The ultimate 3-month structured preparation guide for Data Structures, Algorithms, and Technical Placement Interviews. Featuring spaced repetition, pattern-based learning, and AI mock interviews.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "90-Day DSA Prep",
    "url": "https://java-dsa-in-3-months.vercel.app",
    "description": "Structured 90-day DSA preparation plan for Java developers.",
    "author": {
      "@type": "Person",
      "name": "Tellapalli Akhil Kumar"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://java-dsa-in-3-months.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContainer />
    </>
  );
}

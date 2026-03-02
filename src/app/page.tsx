import HomeContainer from '@/components/HomeContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "90-Day DSA Roadmap: Master Java & Placement Interviews (Free Guide)",
  description: "Master Data Structures and Algorithms in 90 days. Our structured Java roadmap covers 14 core coding patterns, 400+ problems, and AI mock interviews. Perfect for FAANG placement preparation.",
  keywords: [
    "90 day DSA plan", "Java DSA roadmap", "learn DSA in 90 days",
    "placement preparation guide", "technical interview bootcamp",
    "coding interview roadmap", "structured dsa course", "free dsa roadmap",
    "Java placements roadmap", "interview preparation for engineers"
  ],
};

export default function Home() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DSAPrep",
    "url": "https://java-dsa-in-3-months.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://java-dsa-in-3-months.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "90-Day DSA Mastery Roadmap",
    "description": "A comprehensive 90-day plan to master Data Structures, Algorithms, and Technical interviews using Java.",
    "provider": {
      "@type": "Organization",
      "name": "DSAPrep",
      "sameAs": "https://java-dsa-in-3-months.vercel.app"
    },
    "courseCode": "DSA-90",
    "educationalLevel": "Intermediate",
    "about": ["Computer Science", "Programming", "Algorithms", "Data Structures"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does it take to learn DSA for placements?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our plan is structured to take 90 days (3 months), covering everything from basics to advanced patterns like DP and Graphs."
        }
      },
      {
        "@type": "Question",
        "name": "Is this DSA roadmap free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our 90-day roadmap is completely free and includes structured practice problems for Java developers."
        }
      },
      {
        "@type": "Question",
        "name": "Which coding patterns are covered in this roadmap?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We cover 14 essential coding patterns including Sliding Window, Two Pointers, Fast and Slow Pointers, Merge Intervals, and more."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeContainer />
    </>
  );
}

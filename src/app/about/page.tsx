import AboutContainer from "@/components/AboutContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About DSAPrep | Our Methodology & Architecture",
    description: "Learn about the high-performance architecture and proven learning methodologies behind DSAPrep. Discover how our 90-day pipeline turns candidates into FAANG-ready engineers.",
    keywords: [
        "DSA learning methodology", "spaced repetition learning", "technical interview architecture",
        "software engineering career path", "FAANG preparation strategy",
        "coding interview coaching", "placement prep system", "high performance learning"
    ],
};

export default function AboutPage() {
    return <AboutContainer />;
}

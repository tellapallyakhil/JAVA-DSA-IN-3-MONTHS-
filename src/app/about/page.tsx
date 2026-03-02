import AboutContainer from "@/components/AboutContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About DSAPrep | Our Methodology & Architecture",
    description: "Learn about the high-performance architecture and proven learning methodologies behind DSAPrep. Discover how our 90-day pipeline turns candidates into FAANG-ready engineers.",
};

export default function AboutPage() {
    return <AboutContainer />;
}

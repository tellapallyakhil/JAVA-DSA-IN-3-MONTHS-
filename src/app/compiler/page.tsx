import CompilerContainer from "@/components/CompilerContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Java Compiler | Run Java Code in Browser",
    description: "Use our high-performance online Java compiler to test your DSA solutions. Features a CyberVM JVM engine, standard input/output support, and real-time execution.",
    keywords: [
        "Online Java Compiler", "Java Runner", "Browser JVM", "Java IDE Online", "DSA Practice Compiler",
        "run Java code online", "free Java compiler", "Java code executor online",
        "compile Java in browser", "Java playground online", "test Java code",
        "Java online editor", "execute Java program online", "Java sandbox",
        "practice Java coding online", "Java code runner free",
        "Java compiler with input", "Java stdin stdout online"
    ],
};

export default function CompilerPage() {
    return <CompilerContainer />;
}

import CompilerContainer from "@/components/CompilerContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Java Compiler | Run Java Code in Browser",
    description: "Use our high-performance online Java compiler to test your DSA solutions. Features a CyberVM JVM engine, standard input/output support, and real-time execution.",
    keywords: ["Online Java Compiler", "Java Runner", "Browser JVM", "Java IDE Online", "DSA Practice Compiler"],
};

export default function CompilerPage() {
    return <CompilerContainer />;
}

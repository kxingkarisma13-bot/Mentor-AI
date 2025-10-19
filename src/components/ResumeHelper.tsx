import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const resumeSections = [
  {
    title: "Contact Information",
    tips: [
      "Include your full name, phone number, email, and LinkedIn profile",
      "Use a professional email address (firstname.lastname@email.com)",
      "Add your city and state (full address not necessary)",
      "Consider adding a personal portfolio website if relevant",
    ],
    example: "John Smith\nPhone: (555) 123-4567\nEmail: john.smith@email.com\nLinkedIn: linkedin.com/in/johnsmith\nBoston, MA",
  },
  {
    title: "Professional Summary",
    tips: [
      "Write 2-3 sentences highlighting your experience and skills",
      "Focus on your unique value proposition",
      "Tailor it to the specific job you're applying for",
      "Use action words and quantifiable achievements",
    ],
    example: "Results-driven Software Engineer with 5+ years of experience building scalable web applications. Proven track record of improving system performance by 40% and leading cross-functional teams of 8+ developers.",
  },
  {
    title: "Work Experience",
    tips: [
      "List experiences in reverse chronological order",
      "Use bullet points starting with strong action verbs",
      "Quantify achievements with numbers and percentages",
      "Focus on results and impact, not just responsibilities",
      "Keep each bullet point to 1-2 lines maximum",
    ],
    example: "Senior Developer | Tech Company | 2020-Present\n• Increased application performance by 45% through code optimization\n• Led team of 6 developers in implementing new features\n• Reduced bug count by 60% through improved testing practices",
  },
  {
    title: "Education",
    tips: [
      "List degree, institution, and graduation year",
      "Include GPA if it's 3.5 or higher",
      "Add relevant coursework for recent graduates",
      "Include honors, awards, or scholarships",
    ],
    example: "Bachelor of Science in Computer Science\nUniversity of Technology | 2018\nGPA: 3.8/4.0 | Dean's List",
  },
  {
    title: "Skills",
    tips: [
      "Group skills into categories (Technical, Soft Skills, etc.)",
      "List skills relevant to the job posting",
      "Include proficiency levels if applicable",
      "Keep it concise and scannable",
    ],
    example: "Technical: JavaScript, React, Node.js, Python, SQL\nTools: Git, Docker, AWS, Jira\nSoft Skills: Team Leadership, Problem Solving, Communication",
  },
];

const commonMistakes = [
  "Using an unprofessional email address",
  "Including a photo (unless required)",
  "Writing long paragraphs instead of bullet points",
  "Listing responsibilities instead of achievements",
  "Using passive language instead of action verbs",
  "Including irrelevant work experience",
  "Having typos or grammatical errors",
  "Making it longer than 2 pages",
  "Using fancy fonts or too many colors",
  "Forgetting to tailor it to each job",
];

const actionVerbs = [
  "Achieved", "Analyzed", "Built", "Created", "Designed",
  "Developed", "Enhanced", "Established", "Improved", "Increased",
  "Led", "Managed", "Optimized", "Streamlined", "Transformed",
];

export const ResumeHelper = () => {
  const [activeTab, setActiveTab] = useState<"guide" | "tips" | "verbs">("guide");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Writing Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "guide" ? "default" : "outline"}
              onClick={() => setActiveTab("guide")}
            >
              Section Guide
            </Button>
            <Button
              variant={activeTab === "tips" ? "default" : "outline"}
              onClick={() => setActiveTab("tips")}
            >
              Common Mistakes
            </Button>
            <Button
              variant={activeTab === "verbs" ? "default" : "outline"}
              onClick={() => setActiveTab("verbs")}
            >
              Action Verbs
            </Button>
          </div>

          {activeTab === "guide" && (
            <Accordion type="single" collapsible className="w-full">
              {resumeSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      {section.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Tips:</h4>
                        <ul className="space-y-1">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">Example:</h4>
                        <pre className="text-sm whitespace-pre-wrap">{section.example}</pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {activeTab === "tips" && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Avoid These Common Mistakes
              </h3>
              <ul className="space-y-3">
                {commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-destructive text-xl leading-none">✗</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "verbs" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Powerful Action Verbs to Use</h3>
              <p className="text-sm text-muted-foreground">
                Start your bullet points with these strong action verbs to make your achievements stand out:
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {actionVerbs.map((verb, index) => (
                  <div
                    key={index}
                    className="bg-muted px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    {verb}
                  </div>
                ))}
              </div>
              <div className="bg-primary/10 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> Always follow action verbs with specific, quantifiable results.
                  Example: "Increased sales by 35%" instead of just "Increased sales"
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

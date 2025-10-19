import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Lightbulb, MessageSquare } from "lucide-react";

const professionTips = {
  software: {
    title: "Software Engineering",
    preparation: [
      "Practice coding problems on platforms like LeetCode",
      "Review data structures and algorithms",
      "Prepare to explain your past projects in detail",
      "Be ready for system design questions",
      "Study the company's tech stack",
    ],
    commonQuestions: [
      "Explain a challenging bug you fixed",
      "How do you handle technical debt?",
      "Describe your development process",
      "How do you stay updated with new technologies?",
    ],
    tips: [
      "Think out loud during coding challenges",
      "Ask clarifying questions before solving problems",
      "Discuss trade-offs in your solutions",
      "Be honest about what you don't know",
    ],
  },
  marketing: {
    title: "Marketing",
    preparation: [
      "Research the company's current marketing campaigns",
      "Prepare a portfolio of your best work",
      "Know key marketing metrics and KPIs",
      "Study the company's target audience",
      "Understand their competitors",
    ],
    commonQuestions: [
      "How do you measure campaign success?",
      "Describe a campaign you're proud of",
      "How do you handle negative feedback?",
      "What's your content creation process?",
    ],
    tips: [
      "Bring data to support your achievements",
      "Show creativity in your examples",
      "Demonstrate understanding of ROI",
      "Be prepared to discuss social media trends",
    ],
  },
  healthcare: {
    title: "Healthcare",
    preparation: [
      "Review common medical procedures and protocols",
      "Know patient care best practices",
      "Understand healthcare regulations (HIPAA, etc.)",
      "Prepare examples of patient interactions",
      "Research the facility's specialties",
    ],
    commonQuestions: [
      "How do you handle difficult patients?",
      "Describe your approach to patient care",
      "How do you stay current with medical knowledge?",
      "Tell me about a medical emergency you handled",
    ],
    tips: [
      "Emphasize patient safety and care quality",
      "Show empathy and compassion",
      "Discuss teamwork and collaboration",
      "Be prepared for scenario-based questions",
    ],
  },
  education: {
    title: "Education",
    preparation: [
      "Prepare sample lesson plans",
      "Know education standards and curricula",
      "Research the school's teaching philosophy",
      "Think about classroom management strategies",
      "Review your teaching certifications",
    ],
    commonQuestions: [
      "How do you handle classroom disruptions?",
      "Describe your teaching philosophy",
      "How do you adapt to different learning styles?",
      "How do you measure student progress?",
    ],
    tips: [
      "Share specific teaching success stories",
      "Demonstrate passion for education",
      "Discuss parent communication strategies",
      "Show flexibility and adaptability",
    ],
  },
  finance: {
    title: "Finance",
    preparation: [
      "Review financial modeling and analysis",
      "Know current market trends",
      "Understand the company's financial products",
      "Study relevant regulations and compliance",
      "Prepare to discuss your financial certifications",
    ],
    commonQuestions: [
      "How do you approach risk assessment?",
      "Explain a complex financial concept simply",
      "How do you stay informed about markets?",
      "Describe your experience with financial software",
    ],
    tips: [
      "Demonstrate analytical thinking",
      "Show attention to detail",
      "Discuss ethical decision-making",
      "Be prepared for technical assessments",
    ],
  },
};

const generalTips = [
  "Research the company thoroughly beforehand",
  "Practice the STAR method (Situation, Task, Action, Result)",
  "Prepare thoughtful questions to ask the interviewer",
  "Dress professionally and appropriately",
  "Arrive 10-15 minutes early",
  "Bring extra copies of your resume",
  "Maintain good eye contact and posture",
  "Send a thank-you email within 24 hours",
];

export const InterviewTips = () => {
  const [selectedProfession, setSelectedProfession] = useState("");

  const professionData = selectedProfession
    ? professionTips[selectedProfession as keyof typeof professionTips]
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Interview Preparation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Your Profession</label>
            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your field" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(professionTips).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {professionData && (
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Preparation Checklist
                </h3>
                <ul className="space-y-2">
                  {professionData.preparation.map((item, index) => (
                    <li key={index} className="flex gap-2 items-start">
                      <span className="text-primary text-lg leading-none">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Common Interview Questions
                </h3>
                <div className="space-y-2">
                  {professionData.commonQuestions.map((question, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium">Q: {question}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Interview Tips</h3>
                <ul className="space-y-2">
                  {professionData.tips.map((tip, index) => (
                    <li key={index} className="flex gap-2 items-start">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Interview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {generalTips.map((tip, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="text-primary">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

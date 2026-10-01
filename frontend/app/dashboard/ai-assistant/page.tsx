import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ComingSoon } from "@/components/shared/coming-soon";

const SUGGESTED_QUESTIONS = [
  "How much did I spend this month?",
  "What were my biggest expenses?",
  "Which month had the highest sales?",
  "Why did my profit change?",
  "Ni angahe nakoresheje muri uku kwezi?",
  "Ese ubucuruzi bwanjye bwunguka?",
];

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="text-headline-sm text-text-dark">bTrack AI</p>
        <p className="text-body-md text-text-muted">Your business assistant -- ask questions in English or Kinyarwanda.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="text-body-sm font-semibold text-text-dark">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <span key={question} className="rounded-full bg-chip-surface px-3 py-1.5 text-body-sm text-text-muted">
                {question}
              </span>
            ))}
          </div>
          <Input disabled placeholder="Ask bTrack AI..." className="h-12" />
        </CardContent>
      </Card>

      <ComingSoon
        icon={Sparkles}
        title="bTrack AI is almost ready"
        description="Natural-language answers grounded in your real transactions -- amounts come from your data, never invented -- are landing in a future update."
        phase="Phase 8"
      />
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { ChatPanel } from "@/components/ai/chat-panel";

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="text-headline-sm text-text-dark">bTrack AI</p>
        <p className="text-body-md text-text-muted">
          Your business assistant -- ask questions in English or Kinyarwanda, grounded in your real transactions.
        </p>
      </div>

      <Card>
        <CardContent>
          <ChatPanel />
        </CardContent>
      </Card>
    </div>
  );
}

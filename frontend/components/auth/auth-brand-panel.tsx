import { BarChart3, MessageCircleQuestion, Receipt } from "lucide-react";

const VALUE_PROPS = [
  { icon: Receipt, text: "Record income, expenses, and sales in seconds" },
  { icon: BarChart3, text: "See real revenue, profit, and cash flow at a glance" },
  { icon: MessageCircleQuestion, text: "Ask bTrack AI anything about your business" },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-deep p-12 text-on-primary lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 40%)",
        }}
        aria-hidden
      />

      <p className="text-title-lg relative">bTrack.ai</p>

      <div className="relative flex flex-col gap-8">
        <div>
          <p className="text-headline-lg">Track your business.</p>
          <p className="text-headline-lg">Understand your money.</p>
          <p className="text-headline-lg">Grow smarter.</p>
        </div>

        <ul className="flex flex-col gap-4">
          {VALUE_PROPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Icon className="size-4.5" />
              </span>
              <span className="text-body-md">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-caption relative text-on-primary/70">Built for small and medium businesses in Rwanda.</p>
    </div>
  );
}

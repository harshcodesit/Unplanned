import type { FC } from "react";
import { CheckCircle2, Compass, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import "./PillarsSection.css";

interface ProtocolStep {
  stepNum: string;
  badge: string;
  icon: typeof Compass;
  title: string;
  description: string;
  userBenefit: string;
  benefitIcon: typeof ShieldCheck;
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    stepNum: "01",
    badge: "Instant Radar",
    icon: Compass,
    title: "Spontaneous Discovery",
    description:
      "Find open microadventures happening around your city today. Skip weeks of dead group chat polls and jump straight into a sunset hike, coffee, or rooftop jam.",
    userBenefit: "Zero planning polls — Just show up and explore",
    benefitIcon: CheckCircle2,
  },
  {
    stepNum: "02",
    badge: "Wanderer Privacy",
    icon: MapPin,
    title: "Protected Neighborhood Radius",
    description:
      "Exact meetup locations stay private within a safe, approximate neighborhood zone until the host accepts your request. Explore with complete comfort and peace of mind.",
    userBenefit: "Safe approximate zone — Coordinates stay private until approved",
    benefitIcon: ShieldCheck,
  },
  {
    stepNum: "03",
    badge: "Real-World Trail",
    icon: Sparkles,
    title: "Rendezvous & Trail Memories",
    description:
      "Once approved, receive the exact meeting spot. Connect face-to-face with verified fellow wanderers and permanently log every shared microadventure onto your personal Trail.",
    userBenefit: "Verified wanderers — Real adventures saved to your Trail",
    benefitIcon: CheckCircle2,
  },
];

const PillarsSection: FC = () => {
  return (
    <section className="pillars-wrapper" aria-label="How Unplanned Works">
      <div className="pillars-header">
        <span className="pillars-kicker">
          <Sparkles size={14} />
          <span>The Spontaneous Mindset</span>
        </span>
        <h2 className="pillars-title">How A Microadventure Unfolds</h2>
        <p className="pillars-lead">
          Designed to replace endless online chatter with genuine, spontaneous real-world gatherings.
        </p>
      </div>

      <div className="protocol-grid">
        {PROTOCOL_STEPS.map((step) => {
          const Icon = step.icon;
          const BenefitIcon = step.benefitIcon;
          return (
            <article key={step.stepNum} className="protocol-card">
              {/* Left and Right Ticket-Style Semicircle Cutout Notches */}
              <div className="protocol-card-notch-left" aria-hidden="true" />
              <div className="protocol-card-notch-right" aria-hidden="true" />

              {/* Notched Top Header with Negative-Radius Concave Fillets */}
              <div className="protocol-notched-header">
                <div className="protocol-phase-indicator">
                  <span className="protocol-step-prefix">STEP</span>
                  <span className="protocol-step-num">{step.stepNum}</span>
                </div>
                <span className="protocol-badge">{step.badge}</span>
              </div>

              {/* Card Body */}
              <div className="protocol-card-body">
                <div className="protocol-icon-orb">
                  <Icon size={24} strokeWidth={2.2} />
                </div>

                <h3 className="protocol-card-title">{step.title}</h3>
                <p className="protocol-card-desc">{step.description}</p>

                {/* Decorative Perforation Line between notches */}
                <div className="protocol-perforation" aria-hidden="true" />

                {/* User-Centric Value Guarantee Tag (Free of any code or technical jargon) */}
                <div className="protocol-benefit-tag">
                  <BenefitIcon size={15} className="protocol-benefit-icon" />
                  <span>{step.userBenefit}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PillarsSection;

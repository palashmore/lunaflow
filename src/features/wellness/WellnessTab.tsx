import React, { useState } from 'react';
import { 
  BookOpen, 
  Flame, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  Apple, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert
} from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
  warning?: string;
}

const ARTICLES: Article[] = [
  {
    id: 'heat-therapy',
    category: 'Cramp Comfort',
    title: 'Continuous Heat Therapy for Dysmenorrhea & Burn Safety',
    summary: 'Clinical studies show continuous topical heat (approx 40°C) is as effective as ibuprofen for primary dysmenorrhea.',
    content: [
      'Topical heat relaxes the myometrium (uterine muscle layer) and dilates pelvic blood vessels, counteracting prostaglandin-induced uterine spasms.',
      'Always wrap hot water bottles or gel heat packs in a towel or layer of clothing. Never apply hot rubber or boiling water directly against bare skin.',
      'Limit continuous heat application to 20–30 minute intervals to prevent erythema ab igne (mottled skin discoloration caused by prolonged heat exposure).',
      'Combine heat therapy with gentle diaphragmatic breathing to release pelvic floor tension.',
    ],
    warning: 'Do not fall asleep with an electric heating pad turned on high.',
  },
  {
    id: 'fertility-estimates',
    category: 'Reproductive Biology',
    title: 'Understanding Fertile Windows: Why Calendar Estimates Cannot Replace Contraception',
    summary: 'Calendar-based estimations identify general biological probabilities, not infallible guarantees.',
    content: [
      'Sperm can survive in the female reproductive tract for up to 5 days under favorable cervical mucus conditions. An unfertilized ovum lives approximately 12–24 hours post-ovulation.',
      'Because ovulation timing shifts naturally due to stress, travel, illness, and hormonal fluctuations, calendar math cannot confirm the exact day of ovulation.',
      'Never rely on calendar predictions as a primary method of contraception. Use barrier methods (condoms) or consult a reproductive health provider regarding reliable contraceptive options.',
      'Tracking basal body temperature (BBT) and cervical mucus observations provides additional physiological context compared to date counting alone.',
    ],
    warning: 'LunaFlow predictions are informational and not a certified contraceptive medical device.',
  },
  {
    id: 'when-to-see-doctor',
    category: 'Clinical Safety',
    title: 'When to Seek Urgent Medical Care: Red Flag Symptoms',
    summary: 'Clear clinical guidelines for identifying symptoms requiring medical evaluation by a gynecologist.',
    content: [
      'Heavy Menstrual Bleeding (Menorrhagia): Soaking through two or more regular or super pads or tampons every hour for two consecutive hours.',
      'Severe, debilitating pelvic pain that is unmanageable with standard over-the-counter pain relievers or that disrupts normal functioning.',
      'Bleeding or spotting between periods, or unexpected bleeding after intercourse.',
      'Fever, chills, vomiting, or dizziness occurring during your period or shortly after using tampons (potential Toxic Shock Syndrome).',
      'Cycles consistently shorter than 21 days or longer than 35 days, or sudden cessation of periods for more than 90 days (secondary amenorrhea).',
    ],
    warning: 'Severe sudden lower abdominal pain with dizziness requires immediate emergency room evaluation.',
  },
  {
    id: 'evidence-nutrition',
    category: 'Holistic Wellness',
    title: 'Balanced Nutrition & Hydration During Menstruation',
    summary: 'Evidence-based nutritional replenishment to combat fatigue and fluid retention.',
    content: [
      'Iron Replenishment: Monthly menstrual blood loss depletes systemic ferritin. Combine non-heme plant iron (spinach, lentils, pumpkin seeds) with vitamin C (citrus fruits, bell peppers) to boost absorption.',
      'Magnesium: Found in dark chocolate (70%+), almonds, and leafy greens. Magnesium supports muscular relaxation and may reduce prostaglandin-mediated uterine cramping.',
      'Adequate Hydration: Counterintuitively, drinking 7–8 glasses of water daily reduces water retention and abdominal bloating by helping the kidneys flush excess sodium.',
      'Listen to your body without guilt: small energy drops are natural during menstruation; prioritize restorative sleep and steady nourishment.',
    ],
  },
];

export default function WellnessTab() {
  const [expandedId, setExpandedId] = useState<string | null>('heat-therapy');

  function toggleArticle(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div>
        <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-white">
          Evidence-Informed Wellness Library
        </h2>
        <p className="text-xs text-slate-400">
          Scientifically grounded guidance for menstrual health, comfort & safety
        </p>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Medical Disclaimer</h4>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Content provided in LunaFlow is educational and not medical advice, diagnosis, or treatment. Always consult a qualified physician or gynecologist for personal health concerns.
          </p>
        </div>
      </div>

      {/* Articles Accordion */}
      <div className="space-y-3">
        {ARTICLES.map((art) => {
          const isExpanded = expandedId === art.id;

          return (
            <div
              key={art.id}
              className="glass-panel rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleArticle(art.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/40 transition-colors"
              >
                <div className="space-y-1 pr-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    {art.category}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-slate-800">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {art.summary}
                  </p>
                </div>
                <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-rose-100/50 space-y-3 text-xs text-slate-600 leading-relaxed">
                  <ul className="space-y-2 list-disc list-inside pt-3">
                    {art.content.map((point, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>

                  {art.warning && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2 mt-3 font-medium text-[11px]">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{art.warning}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

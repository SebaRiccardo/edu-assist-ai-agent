'use client';

import { useTranslations } from 'next-intl';
import { Tag, Filter, ArrowUpDown, Inbox, Zap } from 'lucide-react';
import { IconMailSpark } from '@tabler/icons-react';

export default function FeaturesSection() {
  const t = useTranslations('Landing');
  const features = [
    {
      icon: <IconMailSpark className="w-6 h-6 text-primary" />,
      title: t('featureSmartAnalysis'),
      text: t('featureSmartAnalysisText'),
      iconWrap: 'bg-primary/10',
    },
    {
      icon: <Filter className="w-6 h-6 text-chart-3" />,
      title: t('featureCourseAwareFiltering'),
      text: t('featureCourseAwareFilteringText'),
      iconWrap: 'bg-chart-3/20',
    },
    {
      icon: <Tag className="w-6 h-6 text-chart-1" />,
      title: t('featureAutoLabeling'),
      text: t('featureAutoLabelingText'),
      iconWrap: 'bg-chart-1/20',
    },
    {
      icon: <Zap className="w-6 h-6 text-chart-2" />,
      title: t('featureRealtimeReplies'),
      text: t('featureRealtimeRepliesText'),
      iconWrap: 'bg-chart-2/20',
    },
    {
      icon: <ArrowUpDown className="w-6 h-6 text-chart-4" />,
      title: t('featurePrioritySorting'),
      text: t('featurePrioritySortingText'),
      iconWrap: 'bg-chart-4/20',
    },
    {
      icon: <Inbox className="w-6 h-6 text-primary" />,
      title: t('featureMultipleInboxes'),
      text: t('featureMultipleInboxesText'),
      iconWrap: 'bg-primary/10',
    },
  ];
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('featuresTitle')}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map(({ icon, title, text, iconWrap }) => (
            <div
              key={title}
              className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border-none shadow-none hover:bg-background/80 transition-all"
            >
              <div
                className={`w-12 h-12 ${iconWrap} rounded-lg flex items-center justify-center mb-4`}
              >
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

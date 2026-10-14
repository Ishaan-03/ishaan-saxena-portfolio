import { useFormatter, useTranslations } from 'next-intl';
import { Reveal } from '@/components/layout/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { timeline } from '@/content/experience';

/**
 * Section 5: one vertical timeline, newest first, a thin glowing line with a dot
 * per entry, alternating sides from md up. Dates go through Intl so each locale
 * formats them its own way.
 */
export function Timeline() {
  const t = useTranslations('timeline');
  const format = useFormatter();

  const period = (start: string, end?: string) => {
    const from = format.dateTime(new Date(start), { month: 'short', year: 'numeric' });
    const to = end
      ? format.dateTime(new Date(end), { month: 'short', year: 'numeric' })
      : t('present');
    return `${from} — ${to}`;
  };

  return (
    <section id="experience" className="relative scroll-mt-24 py-24">
      <SectionHeader badge={t('badge')} title={t('title')} lead={t('lead')} />

      <div className="relative mx-auto mt-14 max-w-4xl px-5">
        {/* The line. Left on mobile, centred from md up. */}
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-[26px] w-px bg-gradient-to-b from-transparent via-[var(--border-glow)] to-transparent md:left-1/2"
        />

        <ol className="space-y-10">
          {timeline.map((entry, index) => {
            const bullets = t.raw(`entries.${entry.key}.bullets`) as string[];
            const left = index % 2 === 0;

            return (
              <li key={entry.key} className="relative">
                <Reveal index={index}>
                  <div
                    className={
                      'relative pl-16 md:w-[calc(50%-32px)] md:pl-0 ' +
                      (left ? 'md:mr-auto md:pr-10 md:text-right' : 'md:ml-auto md:pl-10')
                    }
                  >
                    {/*
                      The dot, centred on the line. Each entry is
                      calc(50% - 32px) wide, so its inner edge sits 32px from
                      the centre line; 32 + half the 14px dot puts it on the
                      line rather than on top of the date.
                    */}
                    <span
                      aria-hidden
                      className={
                        'absolute top-1.5 left-[19px] size-3.5 rounded-full border-2 border-[var(--bg)] bg-[var(--primary-hover)] shadow-[0_0_12px_rgba(59,130,246,0.8)] ' +
                        // `md:left-auto` belongs only to the left-hand branch.
                        // Emitting it for both put two `left` rules at the same
                        // breakpoint, and Tailwind's output order decided the
                        // winner, which parked the dot on top of the date.
                        (left ? 'md:left-auto md:-right-[39px]' : 'md:-left-[39px]')
                      }
                    />

                    <p className="font-mono text-[11px] text-[var(--text-muted)]">
                      {period(entry.start, entry.end)}
                    </p>

                    <h3 className="mt-1.5 text-[15px] font-semibold text-[var(--text)]">
                      {t(`entries.${entry.key}.role`)}
                    </h3>
                    <p className="text-[13px] text-[var(--accent)]">
                      {t(`entries.${entry.key}.org`)}
                    </p>

                    <ul className={'mt-3 space-y-1.5 ' + (left ? 'md:ml-auto' : '')}>
                      {bullets.map((line) => (
                        <li key={line} className="text-[13px] text-[var(--text-muted)]">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

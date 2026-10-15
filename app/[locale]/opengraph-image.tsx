import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

/**
 * Section 11: 1200x630, one per locale, generated rather than designed by hand
 * so the four stay in step. Dark ground, blue glow where the globe sits, name,
 * title line, and the availability line a recruiter is scanning for.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Ishaan Saxena · Cloud Security & DevSecOps';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'og' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px 80px',
        backgroundColor: '#02040A',
        // The hero's glow, flattened into two radial layers.
        backgroundImage:
          'radial-gradient(900px 600px at 78% 52%, rgba(37,99,235,0.42), transparent 62%), radial-gradient(700px 480px at 20% 10%, rgba(10,26,63,0.85), transparent 70%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 20,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#94A3B8',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#34D399',
            display: 'flex',
          }}
        />
        {t('available')}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 28,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -2,
          color: '#F1F5F9',
        }}
      >
        Ishaan Saxena
      </div>

      <div style={{ display: 'flex', marginTop: 16, fontSize: 38, color: '#60A5FA' }}>
        {t('title')}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 34,
          fontSize: 26,
          color: '#94A3B8',
          maxWidth: 820,
          lineHeight: 1.45,
        }}
      >
        {t('line')}
      </div>
    </div>,
    size,
  );
}

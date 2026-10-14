import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Certificates } from '@/components/sections/Certificates';
import { Contact } from '@/components/sections/Contact';
import { InternshipCTA } from '@/components/sections/InternshipCTA';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Timeline } from '@/components/sections/Timeline';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Timeline />
      <Certificates />
      <InternshipCTA />
      <Contact />
    </>
  );
}

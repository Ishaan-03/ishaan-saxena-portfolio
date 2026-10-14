import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,

    /**
     * A missing key is a bug, not a formatting detail. next-intl logs it and
     * renders the key path, so a build would quietly ship `projects.brokeLabel`
     * as visible text. Throwing during the production build turns that into a
     * failure. Development keeps logging, so an in-progress key does not stop
     * the dev server.
     */
    onError(error) {
      if (process.env.NODE_ENV === 'production') throw error;
      console.error(error);
    },
  };
});

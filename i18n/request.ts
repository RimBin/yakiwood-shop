import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  const supported = ['en', 'lt'] as const;

  const requested = await requestLocale;
  const locale = requested && supported.includes(requested as (typeof supported)[number])
    ? (requested as (typeof supported)[number])
    : 'lt';

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../messages/en.json')).default;
  }

  return {
    locale,
    messages
  };
});

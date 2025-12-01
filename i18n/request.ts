import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const supported = ['lt'];
  const resolved = supported.includes(locale ?? '') ? (locale as string) : 'lt';
  let messages;
  try {
    messages = (await import(`../messages/${resolved}.json`)).default;
  } catch {
    messages = (await import('../messages/en.json')).default;
  }
  return {
    locale: resolved,
    messages
  };
});

import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const supported = ['lt', 'en'];
  
  // Get locale from cookie or default to 'lt'
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value && supported.includes(localeCookie.value) 
    ? localeCookie.value 
    : 'lt';
  
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../messages/lt.json')).default;
  }
  
  return {
    locale,
    messages
  };
});

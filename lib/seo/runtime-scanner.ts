import 'server-only'

import type { PageSEOResult } from '@/lib/seo/scanner'
import { validatePageMetadata, type PageMetadata } from '@/lib/seo/validator'
import { seedProducts } from '@/data/seed-products'
import { projects } from '@/data/projects'

type ScanTarget = {
	path: string
	url: string
}

type ParsedHtmlMetadata = {
	title?: string
	description?: string
	canonical?: string
	robots?: PageMetadata['robots']
	openGraph?: PageMetadata['openGraph']
	twitter?: PageMetadata['twitter']
	h1?: string
}

const DEFAULT_FETCH_TIMEOUT_MS = 10_000

function getSafeFallbackPaths(): string[] {
	const staticPaths = [
		'/',
		'/lt',
		'/products',
		'/lt/produktai',
		'/projects',
		'/lt/projektai',
		'/solutions',
		'/lt/sprendimai',
		'/about',
		'/lt/apie',
		'/contact',
		'/lt/kontaktai',
		'/faq',
		'/lt/duk',
		'/configurator3d',
		'/lt/konfiguratorius3d',
		'/naujienos',
	]

	const productSlugs = Array.from(new Set(seedProducts.map((p) => p.slug).filter(Boolean)))
	const productPaths = productSlugs.flatMap((slug) => [`/products/${slug}`, `/lt/produktai/${slug}`])

	const projectSlugs = Array.from(new Set(projects.map((p) => p.slug).filter(Boolean)))
	const projectPaths = projectSlugs.flatMap((slug) => [`/projects/${slug}`, `/lt/projektai/${slug}`])

	return Array.from(new Set([...staticPaths, ...productPaths, ...projectPaths]))
}

async function readTextWithTimeout(res: Response, timeoutMs: number, onTimeout?: () => void): Promise<string> {
	let timeoutHandle: NodeJS.Timeout | undefined
	try {
		return await Promise.race([
			res.text(),
			new Promise<string>((_, reject) => {
				timeoutHandle = setTimeout(() => {
					onTimeout?.()
					reject(new Error(`Timed out while reading response body after ${timeoutMs}ms`))
				}, timeoutMs)
			}),
		])
	} finally {
		if (timeoutHandle) clearTimeout(timeoutHandle)
	}
}

async function fetchTextWithTimeout(
	url: string,
	options: RequestInit,
	timeoutMs: number,
): Promise<{ res: Response; text: string }> {
	const controller = new AbortController()
	const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)
	try {
		const res = await fetch(url, { ...options, signal: controller.signal })
		const text = await readTextWithTimeout(res, timeoutMs, () => {
			try {
				res.body?.cancel()
			} catch {
				// ignore
			}
			controller.abort()
		})
		return { res, text }
	} finally {
		clearTimeout(timeoutHandle)
	}
}

export type SEOAutoFixSuggestion = {
	path: string
	url: string
	suggested: {
		title?: string
		description?: string
		canonical?: string
		openGraph?: PageMetadata['openGraph']
		twitter?: PageMetadata['twitter']
		robots?: PageMetadata['robots']
	}
	reason: string[]
}

function decodeHtmlEntities(input: string): string {
	return input
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
}

function stripHtml(input: string): string {
	return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseAttributes(tag: string): Record<string, string> {
	const attrs: Record<string, string> = {}
	const attrRe = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
	let match: RegExpExecArray | null
	// eslint-disable-next-line no-cond-assign
	while ((match = attrRe.exec(tag))) {
		const key = match[1].toLowerCase()
		const value = (match[2] ?? match[3] ?? match[4] ?? '').trim()
		attrs[key] = decodeHtmlEntities(value)
	}
	return attrs
}

function resolveMaybeRelativeUrl(origin: string, value?: string): string | undefined {
	if (!value) return undefined
	try {
		return new URL(value, origin).toString()
	} catch {
		return value
	}
}

function parseRobots(content?: string): PageMetadata['robots'] | undefined {
	if (!content) return undefined
	const tokens = content
		.split(',')
		.map((t) => t.trim().toLowerCase())
		.filter(Boolean)

	const robots: PageMetadata['robots'] = {}
	if (tokens.includes('noindex')) robots.index = false
	if (tokens.includes('index')) robots.index = true
	if (tokens.includes('nofollow')) robots.follow = false
	if (tokens.includes('follow')) robots.follow = true

	if (Object.keys(robots).length === 0) return undefined
	return robots
}

function extractFromHtml(html: string, origin: string): ParsedHtmlMetadata {
	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
	const title = titleMatch ? stripHtml(decodeHtmlEntities(titleMatch[1])) : undefined

	const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
	const h1 = h1Match ? stripHtml(decodeHtmlEntities(h1Match[1])) : undefined

	const metaTags = Array.from(html.matchAll(/<meta\b[^>]*>/gi)).map((m) => parseAttributes(m[0]))
	const linkTags = Array.from(html.matchAll(/<link\b[^>]*>/gi)).map((m) => parseAttributes(m[0]))

	const metaByNameOrProp = (key: string): string | undefined => {
		const k = key.toLowerCase()
		const hit = metaTags.find((m) => (m.name || m.property || '').toLowerCase() === k)
		return hit?.content
	}

	const canonical = (() => {
		const hit = linkTags.find((l) => (l.rel || '').toLowerCase().split(/\s+/).includes('canonical'))
		return resolveMaybeRelativeUrl(origin, hit?.href)
	})()

	const description = metaByNameOrProp('description')
	const robots = parseRobots(metaByNameOrProp('robots'))

	const ogTitle = metaByNameOrProp('og:title')
	const ogDescription = metaByNameOrProp('og:description')
	const ogType = metaByNameOrProp('og:type')
	const ogSiteName = metaByNameOrProp('og:site_name')
	const ogImageUrl = resolveMaybeRelativeUrl(origin, metaByNameOrProp('og:image'))
	const ogImageWidth = metaByNameOrProp('og:image:width')
	const ogImageHeight = metaByNameOrProp('og:image:height')
	const ogImageAlt = metaByNameOrProp('og:image:alt')

	const openGraph: PageMetadata['openGraph'] | undefined =
		ogTitle || ogDescription || ogType || ogSiteName || ogImageUrl
			? {
					title: ogTitle,
					description: ogDescription,
					type: ogType,
					siteName: ogSiteName,
					images: ogImageUrl
						? [
								{
									url: ogImageUrl,
									width: ogImageWidth ? Number(ogImageWidth) : undefined,
									height: ogImageHeight ? Number(ogImageHeight) : undefined,
									alt: ogImageAlt,
								},
							]
						: undefined,
				}
			: undefined

	const twitterCard = metaByNameOrProp('twitter:card')
	const twitterTitle = metaByNameOrProp('twitter:title')
	const twitterDescription = metaByNameOrProp('twitter:description')
	const twitterImage = resolveMaybeRelativeUrl(origin, metaByNameOrProp('twitter:image'))

	const twitter: PageMetadata['twitter'] | undefined =
		twitterCard || twitterTitle || twitterDescription || twitterImage
			? {
					card: twitterCard,
					title: twitterTitle,
					description: twitterDescription,
					images: twitterImage ? [twitterImage] : undefined,
				}
			: undefined

	return {
		title,
		description,
		canonical,
		robots,
		openGraph,
		twitter,
		h1,
	}
}

function buildTargetsFromPaths(origin: string, paths: string[]): ScanTarget[] {
	const unique = Array.from(new Set(paths))
	const cleaned = unique
		.map((p) => (p.startsWith('/') ? p : `/${p}`))
		.filter((p) => !p.startsWith('/admin'))
		.filter((p) => !p.startsWith('/studio'))

	return cleaned.map((path) => ({ path, url: new URL(path, origin).toString() }))
}

async function getAllIndexablePathsFromOrigin(origin: string): Promise<string[]> {
	// Prefer parsing the actual runtime sitemap output
	try {
		const sitemapUrl = new URL('/sitemap.xml', origin).toString()
		const { res, text: xml } = await fetchTextWithTimeout(
			sitemapUrl,
			{ cache: 'no-store' },
			DEFAULT_FETCH_TIMEOUT_MS,
		)
		if (res.ok) {
			const locs = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1])
			const paths = locs
				.map((loc) => {
					try {
						return new URL(loc).pathname
					} catch {
						return null
					}
				})
				.filter((p): p is string => !!p)

			if (paths.length > 0) return Array.from(new Set(paths))
		}
	} catch {
		// ignore and fallback
	}

	// Fallback: safe local list (avoids hanging on Supabase-backed sitemap generation)
	return getSafeFallbackPaths()
}

async function scanOne(
	target: ScanTarget,
	origin: string,
	params: { fetchTimeoutMs: number },
): Promise<{ result: PageSEOResult; parsed: ParsedHtmlMetadata }> {
	const base: PageMetadata = {
		url: target.url,
	}

	try {
		const { res, text: html } = await fetchTextWithTimeout(
			target.url,
			{
				cache: 'no-store',
				headers: {
					'User-Agent': 'YakiwoodSEOScanner/1.0',
				},
			},
			params.fetchTimeoutMs,
		)
		const parsed = extractFromHtml(html, origin)

		const metadata: PageMetadata = {
			...base,
			title: parsed.title,
			description: parsed.description,
			canonical: parsed.canonical,
			robots: parsed.robots,
			openGraph: parsed.openGraph,
			twitter: parsed.twitter,
		}

		const validation = validatePageMetadata(metadata)
		const issues = [...validation.issues]

		if (!res.ok) {
			issues.unshift({
				field: 'fetch',
				severity: 'error',
				message: `Failed to fetch page (${res.status})`,
			})
		}

		return {
			parsed,
			result: {
				path: target.path,
				title: metadata.title,
				description: metadata.description,
				url: metadata.url,
				openGraph: metadata.openGraph,
				twitter: metadata.twitter,
				seoScore: validation.score,
				issues,
			},
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown fetch error'
		return {
			parsed: {},
			result: {
				path: target.path,
				url: target.url,
				seoScore: 0,
				issues: [
					{ field: 'fetch', severity: 'error', message },
					{ field: 'title', severity: 'error', message: 'Title is missing - this is a critical SEO element' },
					{ field: 'description', severity: 'error', message: 'Description is missing - this is a critical SEO element' },
				],
			},
		}
	}
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length)
	let index = 0

	async function worker() {
		while (true) {
			const current = index
			index += 1
			if (current >= items.length) return
			results[current] = await fn(items[current])
		}
	}

	const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
	await Promise.all(workers)
	return results
}

export async function scanSitePages(params: {
	origin: string
	paths?: string[]
	concurrency?: number
	fetchTimeoutMs?: number
}): Promise<{ pages: PageSEOResult[]; parsedByPath: Record<string, ParsedHtmlMetadata> }> {
	const { origin, concurrency = 8, fetchTimeoutMs = DEFAULT_FETCH_TIMEOUT_MS } = params
	const paths =
		params.paths && params.paths.length > 0 ? params.paths : await getAllIndexablePathsFromOrigin(origin)

	const targets = buildTargetsFromPaths(origin, paths)
	const scanned = await mapWithConcurrency(targets, concurrency, async (t) =>
		scanOne(t, origin, { fetchTimeoutMs }),
	)

	const pages = scanned.map((s) => s.result)
	const parsedByPath: Record<string, ParsedHtmlMetadata> = {}
	scanned.forEach((s) => {
		parsedByPath[s.result.path] = s.parsed
	})

	return { pages, parsedByPath }
}

function titleFromPath(path: string): string {
	if (path === '/' || path === '/lt') return 'Yakiwood - Shou Sugi Ban deginta mediena'

	const cleaned = path.replace(/^\/(lt)\/?/, '/').replace(/\/$/, '')
	const parts = cleaned.split('/').filter(Boolean)

	const last = parts[parts.length - 1] || 'Yakiwood'
	const human = last
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())

	return `${human} | Yakiwood`
}

function descriptionFromPath(path: string): string {
	if (path.includes('/produktai')) {
		return 'Peržiūrėkite Shou Sugi Ban degintos medienos produktus: fasadams, terasai, tvorai ir interjerui. Skirtingos spalvos ir profiliai.'
	}
	if (path.includes('/projektai') || path.includes('/projects')) {
		return 'Įkvėpimui – Yakiwood projektų galerija su Shou Sugi Ban degintos medienos sprendimais ir realiais įgyvendinimais.'
	}
	if (path.includes('/sprendimai') || path.includes('/solutions')) {
		return 'Shou Sugi Ban degintos medienos sprendimai fasadams, interjerui, terasoms ir tvoroms. Ilgaamžiai ir estetiški paviršiai.'
	}
	if (path.includes('/kontaktai') || path.includes('/contact')) {
		return 'Susisiekite su Yakiwood komanda – konsultacijos dėl Shou Sugi Ban degintos medienos, kainų ir projektų.'
	}
	if (path.includes('/apie') || path.includes('/about')) {
		return 'Sužinokite apie Yakiwood – Shou Sugi Ban (japoniškos degintos medienos) technologiją, vertybes ir gamybos procesą.'
	}
	if (path.includes('/faq') || path.includes('/duk')) {
		return 'Dažniausiai užduodami klausimai apie Shou Sugi Ban degintos medienos produktus, montavimą, priežiūrą ir naudojimą.'
	}

	return 'Yakiwood – Shou Sugi Ban deginta mediena fasadams, terasoms, tvoroms ir interjerui. Ekologiški ir ilgaamžiai sprendimai.'
}

export async function suggestSeoFixes(params: { origin: string; paths?: string[] }): Promise<SEOAutoFixSuggestion[]> {
	const { origin } = params
	const { pages, parsedByPath } = await scanSitePages({ origin, paths: params.paths })

	const suggestions: SEOAutoFixSuggestion[] = []

	pages.forEach((page) => {
		const reasons: string[] = []
		const parsed = parsedByPath[page.path] || {}

		const suggested: SEOAutoFixSuggestion['suggested'] = {}

		if (!page.title) {
			suggested.title = parsed.h1 || titleFromPath(page.path)
			reasons.push('Missing <title>')
		}

		if (!page.description) {
			suggested.description = descriptionFromPath(page.path)
			reasons.push('Missing meta description')
		}

		const expectedCanonical = new URL(page.path, origin).toString()
		if (!parsed.canonical) {
			suggested.canonical = expectedCanonical
			reasons.push('Missing canonical')
		}

		if (!page.openGraph) {
			suggested.openGraph = {
				title: suggested.title || page.title,
				description: suggested.description || page.description,
				type: 'website',
				siteName: 'Yakiwood',
				images: [
					{
						url: new URL('/og-image.jpg', origin).toString(),
						width: 1200,
						height: 630,
						alt: 'Yakiwood',
					},
				],
			}
			reasons.push('Missing Open Graph')
		}

		if (!page.twitter) {
			suggested.twitter = {
				card: 'summary_large_image',
				title: suggested.title || page.title,
				description: suggested.description || page.description,
				images: [new URL('/og-image.jpg', origin).toString()],
			}
			reasons.push('Missing Twitter Card')
		}

		const shouldNoIndex =
			page.path.startsWith('/admin') ||
			page.path.startsWith('/studio') ||
			page.path.startsWith('/account') ||
			page.path.startsWith('/login') ||
			page.path.startsWith('/register')

		if (!parsed.robots && shouldNoIndex) {
			suggested.robots = { index: false, follow: false }
			reasons.push('Missing robots (recommended noindex,nofollow for private pages)')
		}

		if (reasons.length > 0) {
			suggestions.push({
				path: page.path,
				url: page.url,
				suggested,
				reason: reasons,
			})
		}
	})

	return suggestions
}


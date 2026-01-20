'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

import { projects as defaultProjects } from '@/data/projects'
import type { Project } from '@/types/project'
import { getProjectDescription, getProjectLocation, getProjectSubtitle, getProjectTitle, normalizeProjectLocale } from '@/lib/projects/i18n'
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminSectionTitle,
  AdminStack,
  AdminTextarea,
} from '@/components/admin/ui/AdminUI'

const PROJECTS_STORAGE_KEY = 'yakiwood_projects'
const PROJECT_IMAGES_BUCKET = 'project-images'

async function getAdminToken(): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

async function uploadImageToSupabase(file: File, bucket = PROJECT_IMAGES_BUCKET): Promise<string> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase is not configured (missing env vars)')
  }

  const token = await getAdminToken()
  if (!token) {
    throw new Error('No admin session. Please login again.')
  }

  const res = await fetch('/api/admin/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      bucket,
    }),
  })

  const json = (await res.json().catch(() => null)) as any
  if (!res.ok) {
    const msg = json?.error || `Upload URL request failed (${res.status})`
    throw new Error(msg)
  }

  const path = String(json?.path || '')
  const signedToken = String(json?.token || '')
  const outBucket = String(json?.bucket || bucket)
  const publicUrl = String(json?.publicUrl || '')

  if (!path || !signedToken || !publicUrl) {
    throw new Error('Upload URL response missing required fields')
  }

  const { error } = await supabase.storage.from(outBucket).uploadToSignedUrl(path, signedToken, file, {
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(error.message)
  }

  return publicUrl
}

let adminDbPromise: Promise<IDBDatabase> | null = null

function openAdminDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available during SSR'))
  }
  if (adminDbPromise) return adminDbPromise

  adminDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('yakiwood-admin', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })

  return adminDbPromise
}

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openAdminDb()
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction('kv', 'readonly')
      const store = tx.objectStore('kv')
      const req = store.get(key)
      req.onsuccess = () => {
        const row = req.result as { key: string; value: T } | undefined
        resolve(row?.value ?? null)
      }
      req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'))
    })
  } catch {
    return null
  }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  const db = await openAdminDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite')
    const store = tx.objectStore('kv')
    store.put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

async function getProjectsFromStorage(): Promise<Project[] | null> {
  const fromIdb = await kvGet<Project[]>(PROJECTS_STORAGE_KEY)
  if (fromIdb && Array.isArray(fromIdb)) return fromIdb

  try {
    const legacy = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!legacy) return null
    const parsed = JSON.parse(legacy) as Project[]
    if (!Array.isArray(parsed)) return null
    await kvSet(PROJECTS_STORAGE_KEY, parsed)
    window.localStorage.removeItem(PROJECTS_STORAGE_KEY)
    return parsed
  } catch {
    return null
  }
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type ProjectFormState = {
  title: string
  subtitle: string
  slug: string
  location: string
  titleEn: string
  subtitleEn: string
  slugEn: string
  locationEn: string
  images: string
  featuredImage: string
  productsUsed: string
  description: string
  fullDescription: string
  descriptionEn: string
  fullDescriptionEn: string
  category: string
  featured: boolean
}

const EMPTY_FORM: ProjectFormState = {
  title: '',
  subtitle: '',
  slug: '',
  location: '',
  titleEn: '',
  subtitleEn: '',
  slugEn: '',
  locationEn: '',
  images: '',
  featuredImage: '',
  productsUsed: '',
  description: '',
  fullDescription: '',
  descriptionEn: '',
  fullDescriptionEn: '',
  category: 'residential',
  featured: false,
}

export default function ProjectsAdminClient() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const currentLocale = normalizeProjectLocale(locale)

  const [message, setMessage] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_FORM)

  const [projectImageFiles, setProjectImageFiles] = useState<string[]>([])
  const [featuredImageFile, setFeaturedImageFile] = useState('')
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const projectFileInputRef = useRef<HTMLInputElement | null>(null)
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null)
  const [projectSelectedFileNames, setProjectSelectedFileNames] = useState(() => t('ui.noFileSelected'))

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const storedProjects = await getProjectsFromStorage()
      if (cancelled) return

      if (storedProjects) {
        setProjects(storedProjects)
      } else {
        setProjects(defaultProjects)
        try {
          await kvSet(PROJECTS_STORAGE_KEY, defaultProjects)
          window.localStorage.removeItem(PROJECTS_STORAGE_KEY)
        } catch {
          // ignore
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const showToast = (msg: string) => {
    setMessage(msg)
    window.setTimeout(() => setMessage(''), 3000)
  }

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    const fileNames = files.map((f) => f.name).join(', ')
    setProjectSelectedFileNames(fileNames)

    setIsUploadingImages(true)

    try {
      const urls: string[] = []
      for (const file of files) {
        urls.push(await uploadImageToSupabase(file))
      }

      setProjectImageFiles((prev) => [...prev, ...urls])
      showToast(`Įkelta ${urls.length} nuotr. į Supabase.`)
    } catch (error) {
      // Fallback to local base64 in case Supabase isn't configured yet.
      try {
        const base64Images = await Promise.all(
          files.map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result || ''))
                reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
                reader.readAsDataURL(file)
              })
          )
        )

        const cleaned = base64Images.filter(Boolean)
        if (cleaned.length > 0) {
          setProjectImageFiles((prev) => [...prev, ...cleaned])
        }

        showToast(
          `Įkėlimas nepavyko; nuotraukos išsaugotos lokaliai: ${getErrorMessage(error, 'Įkėlimas nepavyko')}`
        )
      } catch {
        showToast(getErrorMessage(error, 'Įkėlimas nepavyko'))
      }
    } finally {
      setIsUploadingImages(false)
      // allow selecting same file again
      e.target.value = ''
      if (projectFileInputRef.current) projectFileInputRef.current.value = ''
    }
  }

  const handleProjectFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setProjectSelectedFileNames(t('ui.noFileSelected'))
      return
    }
    const names = Array.from(files)
      .map((f) => f.name)
      .join(', ')
    setProjectSelectedFileNames(names)
  }

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImages(true)
    try {
      const url = await uploadImageToSupabase(file)
      setFeaturedImageFile(url)
      showToast('Pagrindinė nuotrauka įkelta į Supabase.')
    } catch (error) {
      // Fallback to local base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setFeaturedImageFile(String(reader.result || ''))
        showToast(`Įkėlimas nepavyko; nuotrauka išsaugota lokaliai: ${getErrorMessage(error, 'Įkėlimas nepavyko')}`)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingImages(false)
      e.target.value = ''
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = ''
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const urlImages = projectForm.images
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)

    const allImages = [...projectImageFiles, ...urlImages]

    const productsArray = projectForm.productsUsed
      .split(',')
      .map((p) => ({ name: p.trim(), slug: slugify(p.trim()) }))
      .filter((p) => p.name)

    const safeSlug = projectForm.slug?.trim() ? projectForm.slug : slugify(projectForm.title)
    const safeSlugEn = projectForm.slugEn?.trim()
      ? projectForm.slugEn
      : slugify(projectForm.titleEn?.trim() ? projectForm.titleEn : projectForm.title)

    const featuredImg =
      featuredImageFile || projectForm.featuredImage || (allImages.length > 0 ? allImages[0] : undefined)

    const ltTitle = projectForm.title
    const ltSubtitle = projectForm.subtitle || undefined
    const ltLocation = projectForm.location
    const ltDescription = projectForm.description
    const ltFullDescription = projectForm.fullDescription || undefined

    const enTitle = projectForm.titleEn?.trim() ? projectForm.titleEn : ltTitle
    const enSubtitle = projectForm.subtitleEn?.trim() ? projectForm.subtitleEn : ltSubtitle
    const enLocation = projectForm.locationEn?.trim() ? projectForm.locationEn : ltLocation
    const enDescription = projectForm.descriptionEn?.trim() ? projectForm.descriptionEn : ltDescription
    const enFullDescription = projectForm.fullDescriptionEn?.trim() ? projectForm.fullDescriptionEn : ltFullDescription

    if (editingProjectId) {
      const updated = projects.map((project) => {
        if (project.id === editingProjectId) {
          return {
            ...project,
            title: ltTitle,
            subtitle: ltSubtitle,
            slug: safeSlug,
            location: ltLocation,
            images: allImages.length > 0 ? allImages : project.images,
            featuredImage: featuredImg,
            productsUsed: productsArray,
            description: ltDescription,
            fullDescription: ltFullDescription,
            i18n: {
              ...(project.i18n ?? {}),
              lt: {
                ...(project.i18n?.lt ?? {}),
                title: ltTitle,
                subtitle: ltSubtitle,
                slug: safeSlug,
                location: ltLocation,
                description: ltDescription,
                fullDescription: ltFullDescription,
              },
              en: {
                ...(project.i18n?.en ?? {}),
                title: enTitle,
                subtitle: enSubtitle,
                slug: safeSlugEn,
                location: enLocation,
                description: enDescription,
                fullDescription: enFullDescription,
              },
            },
            category: projectForm.category as 'residential' | 'commercial',
            featured: projectForm.featured,
          }
        }
        return project
      })

      setProjects(updated)
      let persisted = true
      try {
        await kvSet(PROJECTS_STORAGE_KEY, updated)
      } catch {
        persisted = false
      }
      showToast(
        persisted
          ? 'Projektas atnaujintas!'
          : 'Projektas atnaujintas, bet nepavyko išsaugoti šiame naršyklės saugykloje (limitai).'
      )
      setEditingProjectId(null)
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...projectForm,
        slug: safeSlug,
        images:
          allImages.length > 0
            ? allImages
            : projectForm.images
                .split(',')
                .map((url) => url.trim())
                .filter(Boolean),
        featuredImage: featuredImg,
        productsUsed: productsArray,
        i18n: {
          lt: {
            title: ltTitle,
            subtitle: ltSubtitle,
            slug: safeSlug,
            location: ltLocation,
            description: ltDescription,
            fullDescription: ltFullDescription,
          },
          en: {
            title: enTitle,
            subtitle: enSubtitle,
            slug: safeSlugEn,
            location: enLocation,
            description: enDescription,
            fullDescription: enFullDescription,
          },
        },
      }

      const updated = [...projects, newProject]
      setProjects(updated)
      let persisted = true
      try {
        await kvSet(PROJECTS_STORAGE_KEY, updated)
      } catch {
        persisted = false
      }
      showToast(
        persisted
          ? 'Projektas pridėtas!'
          : 'Projektas pridėtas, bet nepavyko išsaugoti šiame naršyklės saugykloje (limitai).'
      )
    }

    setProjectForm(EMPTY_FORM)
    setProjectImageFiles([])
    setFeaturedImageFile('')
    setProjectSelectedFileNames(t('ui.noFileSelected'))

    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = ''
    }
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = ''
    }
  }

  const handleProjectDelete = (id: string) => {
    const updated = projects.filter((p) => p.id !== id)
    setProjects(updated)
    void kvSet(PROJECTS_STORAGE_KEY, updated).catch(() => {
      // ignore
    })
    showToast('Projektas ištrintas')
  }

  const handleProjectCancelEdit = () => {
    setEditingProjectId(null)
    setShowAddForm(false)
    setProjectForm(EMPTY_FORM)
    setProjectImageFiles([])
    setFeaturedImageFile('')
    setProjectSelectedFileNames(t('ui.noFileSelected'))
  }

  const handleProjectEdit = (project: Project) => {
    if (editingProjectId === project.id) {
      handleProjectCancelEdit()
      return
    }

    setShowAddForm(false)
    setEditingProjectId(project.id)

    const lt = project.i18n?.lt ?? {}
    const en = project.i18n?.en ?? {}

    const baseTitle = project.title
    const baseSubtitle = project.subtitle || ''
    const baseSlug = project.slug
    const baseLocation = project.location
    const baseDescription = project.description
    const baseFullDescription = project.fullDescription || ''

    setProjectForm({
      title: typeof lt.title === 'string' && lt.title.trim() ? lt.title : baseTitle,
      subtitle: typeof lt.subtitle === 'string' && lt.subtitle.trim() ? lt.subtitle : baseSubtitle,
      slug: typeof lt.slug === 'string' && lt.slug.trim() ? lt.slug : baseSlug,
      location: typeof lt.location === 'string' && lt.location.trim() ? lt.location : baseLocation,
      titleEn: typeof en.title === 'string' && en.title.trim() ? en.title : baseTitle,
      subtitleEn: typeof en.subtitle === 'string' && en.subtitle.trim() ? en.subtitle : baseSubtitle,
      slugEn: typeof en.slug === 'string' && en.slug.trim() ? en.slug : baseSlug,
      locationEn: typeof en.location === 'string' && en.location.trim() ? en.location : baseLocation,
      images: '',
      featuredImage: project.featuredImage || '',
      productsUsed: Array.isArray(project.productsUsed)
        ? project.productsUsed.map((p) => (typeof p === 'string' ? p : p.name)).join(', ')
        : (project.productsUsed as any) || '',
      description: typeof lt.description === 'string' && lt.description.trim() ? lt.description : baseDescription,
      fullDescription:
        typeof lt.fullDescription === 'string' && lt.fullDescription.trim() ? lt.fullDescription : baseFullDescription,
      descriptionEn:
        typeof en.description === 'string' && en.description.trim() ? en.description : baseDescription,
      fullDescriptionEn:
        typeof en.fullDescription === 'string' && en.fullDescription.trim()
          ? en.fullDescription
          : baseFullDescription,
      category: project.category || 'residential',
      featured: project.featured || false,
    })

    if (project.images && project.images.length > 0) {
      setProjectImageFiles(project.images.map((img) => (typeof img === 'string' ? img : (img as any).url || '')))
    }
    if (project.featuredImage) {
      setFeaturedImageFile(project.featuredImage)
    }
  }

  const handleProjectImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedProjects = JSON.parse(event.target?.result as string) as unknown
        if (!Array.isArray(importedProjects)) {
          showToast('Nepavyko importuoti projektų. Patikrinkite JSON formatą.')
          return
        }
        const updated = [...projects, ...(importedProjects as Project[])]
        setProjects(updated)
        void kvSet(PROJECTS_STORAGE_KEY, updated).catch(() => {
          // ignore
        })
        showToast(`Importuota: ${importedProjects.length} projektai.`)
      } catch {
        showToast('Nepavyko importuoti projektų. Patikrinkite JSON formatą.')
      }
    }
    reader.readAsText(file)
  }

  const handleProjectExport = () => {
    const dataStr = JSON.stringify(projects, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'yakiwood-projects.json'
    link.click()
  }

  return (
    <AdminStack>
      {message && (
        <div className="bg-[#161616] text-white px-[24px] py-[16px] rounded-[24px] font-['Outfit'] text-[14px]">
          {message}
        </div>
      )}

      <AdminCard>
        <div className="flex items-end justify-between gap-[16px]">
          <div>
            <AdminSectionTitle>{t('breadcrumb.projects')}</AdminSectionTitle>
            <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">{t('main.subtitle')}</p>
          </div>

          <AdminButton
            size="sm"
            onClick={() => {
              setShowAddForm((prev) => !prev)
              setEditingProjectId(null)
              if (!showAddForm) {
                setProjectForm(EMPTY_FORM)
                setProjectImageFiles([])
                setFeaturedImageFile('')
              }
            }}
          >
            {showAddForm ? t('ui.cancel') : t('projects.actions.addProject')}
          </AdminButton>
        </div>

        {showAddForm && (
          <form onSubmit={handleProjectSubmit} className="mt-[24px] space-y-[20px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <div>
                <AdminInput
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value
                    setProjectForm((prev) => {
                      const prevAutoSlug = slugify(prev.title)
                      const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                      return {
                        ...prev,
                        title: nextTitle,
                        slug: shouldAuto ? slugify(nextTitle) : prev.slug,
                      }
                    })
                  }}
                  placeholder="Projekto pavadinimas"
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                  Rodomas sąrašuose ir projekto puslapyje.
                </p>
              </div>

              <div>
                <AdminInput
                  type="text"
                  value={projectForm.subtitle}
                  onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                  placeholder="Paantraštė (nebūtina)"
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                  Trumpa paantraštė šalia pavadinimo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <div>
                <AdminInput
                  type="text"
                  required
                  value={projectForm.slug}
                  onChange={(e) => setProjectForm({ ...projectForm, slug: slugify(e.target.value) })}
                  placeholder="projekto-slug"
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                  URL identifikatorius (mažosios raidės, brūkšneliai). Sugeneruojamas automatiškai, bet galima keisti.
                </p>
              </div>

              <div>
                <AdminInput
                  type="text"
                  required
                  value={projectForm.location}
                  onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                  placeholder="Vieta (pvz., Vilnius, Lietuva)"
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Miestas, šalis (pvz., Vilnius, Lietuva).</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#BBBBBB] bg-[#EAEAEA] p-[16px]">
              <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">English (optional)</p>
              <p className="mt-[4px] font-['Outfit'] text-[12px] text-[#535353]">Palikite tuščia — bus naudojamas LT tekstas.</p>

              <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div>
                  <AdminInput
                    type="text"
                    value={projectForm.titleEn}
                    onChange={(e) => {
                      const nextTitle = e.target.value
                      setProjectForm((prev) => {
                        const prevAutoSlug = slugify(prev.titleEn)
                        const shouldAuto = !prev.slugEn || prev.slugEn === prevAutoSlug
                        return {
                          ...prev,
                          titleEn: nextTitle,
                          slugEn: shouldAuto ? slugify(nextTitle) : prev.slugEn,
                        }
                      })
                    }}
                    placeholder="Project title (EN)"
                  />
                </div>
                <div>
                  <AdminInput
                    type="text"
                    value={projectForm.subtitleEn}
                    onChange={(e) => setProjectForm({ ...projectForm, subtitleEn: e.target.value })}
                    placeholder="Subtitle (EN)"
                  />
                </div>
              </div>

              <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div>
                  <AdminInput
                    type="text"
                    value={projectForm.slugEn}
                    onChange={(e) => setProjectForm({ ...projectForm, slugEn: slugify(e.target.value) })}
                    placeholder="project-slug (EN)"
                  />
                </div>
                <div>
                  <AdminInput
                    type="text"
                    value={projectForm.locationEn}
                    onChange={(e) => setProjectForm({ ...projectForm, locationEn: e.target.value })}
                    placeholder="Location (EN)"
                  />
                </div>
              </div>

              <div className="mt-[12px]">
                <AdminTextarea
                  value={projectForm.descriptionEn}
                  onChange={(e) => setProjectForm({ ...projectForm, descriptionEn: e.target.value })}
                  rows={3}
                  placeholder="Short Description (EN)"
                />
              </div>

              <div className="mt-[12px]">
                <AdminTextarea
                  value={projectForm.fullDescriptionEn}
                  onChange={(e) => setProjectForm({ ...projectForm, fullDescriptionEn: e.target.value })}
                  rows={5}
                  placeholder="Full Description (EN)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <div>
                <AdminSelect
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                >
                  <option value="residential">Gyvenamieji</option>
                  <option value="commercial">Komerciniai</option>
                  <option value="public">Viešieji</option>
                </AdminSelect>
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Projekto kategorija.</p>
              </div>

              <div>
                <label className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px]">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="w-[20px] h-[20px]"
                  />
                  <span className="font-['Outfit'] text-[14px]">Rekomenduojamas projektas</span>
                </label>
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                  Pažymėkite, jei projektas turi būti rodomas „rekomenduojamų“ sąrašuose.
                </p>
              </div>
            </div>

            <div>
              <AdminTextarea
                required
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                rows={3}
                placeholder="Trumpas aprašymas (kortelėms)"
              />
              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Trumpas tekstas, rodomas projekto kortelėje.</p>
            </div>

            <div>
              <AdminTextarea
                value={projectForm.fullDescription}
                onChange={(e) => setProjectForm({ ...projectForm, fullDescription: e.target.value })}
                rows={5}
                placeholder="Pilnas aprašymas (nebūtina, projekto puslapiui)"
              />
              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Išsamesnis tekstas projekto puslapiui.</p>
            </div>

            <div>
              <AdminInput
                type="text"
                value={projectForm.productsUsed}
                onChange={(e) => setProjectForm({ ...projectForm, productsUsed: e.target.value })}
                placeholder="Produktai (atskirti kableliais, pvz., Black larch, Brown larch)"
              />
              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Pvz.: Black larch, Brown larch.</p>
            </div>

            <div className="space-y-[12px]">
              <label className="block">
                <span className="font-['Outfit'] text-[14px] font-medium text-[#161616] mb-[8px] block">
                  Featured Image (katalogo nuotrauka)
                </span>
                <div className="relative">
                  <input
                    ref={featuredImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="hidden"
                    id="featuredImageInput"
                  />
                  <label
                    htmlFor="featuredImageInput"
                    className="flex items-center justify-center w-full px-[16px] py-[12px] border-2 border-dashed border-[#161616] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#EAEAEA] transition-colors"
                  >
                    <span className="text-[#161616] font-medium">
                      {featuredImageFile ? 'Pakeisti nuotrauką' : 'Įkelti nuotrauką'}
                    </span>
                  </label>
                </div>
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                  Pagrindinė (16:9). Rodoma sąrašuose, jei nustatyta.
                </p>
              </label>

              {featuredImageFile && (
                <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border-2 border-[#161616]">
                  <Image src={featuredImageFile} alt="Featured preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImageFile('')
                      if (featuredImageInputRef.current) {
                        featuredImageInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-red-500 text-white rounded-full flex items-center justify-center text-[18px] hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-[12px]">
              <label className="block">
                <span className="font-['Outfit'] text-[14px] text-[#535353] mb-[8px] block">
                  Galerijos nuotraukos (papildomos)
                </span>
                <div className="relative">
                  <input
                    ref={projectFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      handleProjectFileInputChange(e)
                      handleProjectImageUpload(e)
                    }}
                    className="hidden"
                    id="projectFileInput"
                  />
                  <label
                    htmlFor="projectFileInput"
                    className="flex items-center justify-center w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#EAEAEA] transition-colors"
                  >
                    <span className="text-[#535353]">{projectSelectedFileNames}</span>
                  </label>
                </div>
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Papildomos galerijos nuotraukos (kvadratinės miniatiūros).</p>
              </label>

              {projectImageFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-[12px] mt-[12px]">
                  {projectImageFiles.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                      <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setProjectImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="font-['Outfit'] text-[12px] text-[#535353]">Arba įklijuokite paveikslėlių URL (atskirti kableliais):</p>
              <AdminInput
                type="text"
                value={projectForm.images}
                onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="flex gap-[12px]">
              <AdminButton type="submit" className="flex-1">
                {editingProjectId ? t('projects.actions.save') : t('projects.actions.addProject')}
              </AdminButton>
              {editingProjectId && (
                <AdminButton variant="secondary" onClick={handleProjectCancelEdit}>
                  {t('ui.cancel')}
                </AdminButton>
              )}
            </div>
          </form>
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex justify-between items-center mb-[24px]">
          <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
            Projektai ({projects.length})
          </h2>
          <div className="flex gap-[8px]">
            <label
              htmlFor="projectImportInput"
              className="h-[40px] px-[16px] rounded-[100px] bg-[#E1E1E1] text-[#161616] hover:bg-[#BBBBBB] transition-colors cursor-pointer flex items-center font-['Outfit'] text-[12px] tracking-[0.6px] uppercase"
            >
              {t('projects.actions.import')}
            </label>
            <input id="projectImportInput" type="file" accept=".json" onChange={handleProjectImport} className="hidden" />
            <AdminButton size="sm" onClick={handleProjectExport}>
              {t('projects.actions.export')}
            </AdminButton>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">
            Projektų dar nėra. Pridėkite pirmą projektą.
          </p>
        ) : (
          <div className="space-y-[16px]">
            {projects.map((project) => (
              <div key={project.id} className="border border-[#BBBBBB] rounded-[16px] overflow-hidden">
                <div className="p-[20px]">
                  <div className="flex gap-[16px]">
                    {project.images && project.images.length > 0 && (
                      <div className="w-[120px] h-[80px] relative rounded-[8px] overflow-hidden flex-shrink-0">
                        <Image
                          src={typeof project.images[0] === 'string' ? project.images[0] : (project.images[0] as any).url || ''}
                          alt={getProjectTitle(project, currentLocale) || 'Projektas'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-['DM_Sans'] text-[20px] tracking-[-0.8px]">
                            {getProjectTitle(project, currentLocale)}
                            {getProjectSubtitle(project, currentLocale) && (
                              <span className="text-[#535353] ml-[8px]">— {getProjectSubtitle(project, currentLocale)}</span>
                            )}
                            {project.featured && (
                              <span className="ml-[8px]">
                                <AdminBadge>Rekomenduojamas</AdminBadge>
                              </span>
                            )}
                          </h3>
                          <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">{getProjectLocation(project, currentLocale)}</p>
                          <p className="font-['Outfit'] text-[14px] text-[#161616] mt-[8px] line-clamp-2">
                            {getProjectDescription(project, currentLocale)}
                          </p>
                          {project.productsUsed && (project as any).productsUsed.length > 0 && (
                            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">
                              Produktai:{' '}
                              {Array.isArray(project.productsUsed)
                                ? project.productsUsed.map((p) => (typeof p === 'string' ? p : p.name)).join(', ')
                                : (project.productsUsed as any)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-[8px]">
                          <AdminButton
                            size="sm"
                            variant={editingProjectId === project.id ? 'secondary' : 'outline'}
                            onClick={() => handleProjectEdit(project)}
                          >
                            {editingProjectId === project.id ? t('ui.cancel') : t('projects.actions.edit')}
                          </AdminButton>
                          <AdminButton size="sm" variant="danger" onClick={() => handleProjectDelete(project.id)}>
                            {t('projects.actions.delete')}
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {editingProjectId === project.id && (
                  <div className="border-t border-[#BBBBBB] bg-[#EAEAEA] p-[clamp(20px,3vw,32px)]">
                    <h3 className="font-['DM_Sans'] text-[18px] tracking-[-0.72px] text-[#161616] mb-[24px]">Projekto redagavimas</h3>
                    <form onSubmit={handleProjectSubmit} className="space-y-[20px]">
                      <div className="rounded-[16px] border border-[#BBBBBB] bg-white/50 p-[16px]">
                        <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">Lietuvių (pagrindinė)</p>

                        <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                          <div>
                            <AdminInput
                              type="text"
                              required
                              value={projectForm.title}
                              onChange={(e) => {
                                const nextTitle = e.target.value
                                setProjectForm((prev) => {
                                  const prevAutoSlug = slugify(prev.title)
                                  const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                                  return { ...prev, title: nextTitle, slug: shouldAuto ? slugify(nextTitle) : prev.slug }
                                })
                              }}
                              placeholder="Projekto pavadinimas"
                            />
                            <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Rodomas sąrašuose ir projekto puslapyje.</p>
                          </div>

                          <div>
                            <AdminInput
                              type="text"
                              value={projectForm.subtitle}
                              onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                              placeholder="Paantraštė (nebūtina)"
                            />
                            <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Trumpa paantraštė šalia pavadinimo.</p>
                          </div>
                        </div>

                        <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                          <div>
                            <AdminInput
                              type="text"
                              required
                              value={projectForm.slug}
                              onChange={(e) => setProjectForm({ ...projectForm, slug: slugify(e.target.value) })}
                              placeholder="projekto-slug"
                            />
                            <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                              URL identifikatorius (mažosios raidės, brūkšneliai). Sugeneruojamas automatiškai, bet galima keisti.
                            </p>
                          </div>

                          <div>
                            <AdminInput
                              type="text"
                              required
                              value={projectForm.location}
                              onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                              placeholder="Vieta (pvz., Vilnius, Lietuva)"
                            />
                            <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Miestas, šalis (pvz., Vilnius, Lietuva).</p>
                          </div>
                        </div>

                        <div className="mt-[12px]">
                          <AdminTextarea
                            required
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            rows={3}
                            placeholder="Trumpas aprašymas (kortelėms)"
                          />
                          <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Trumpas tekstas, rodomas projekto kortelėje.</p>
                        </div>

                        <div className="mt-[12px]">
                          <AdminTextarea
                            value={projectForm.fullDescription}
                            onChange={(e) => setProjectForm({ ...projectForm, fullDescription: e.target.value })}
                            rows={4}
                            placeholder="Pilnas aprašymas (nebūtina)"
                          />
                          <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Išsamesnis tekstas projekto puslapiui.</p>
                        </div>
                      </div>

                      <div className="rounded-[16px] border border-[#BBBBBB] bg-white/50 p-[16px]">
                        <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">English (optional)</p>
                        <p className="mt-[4px] font-['Outfit'] text-[12px] text-[#535353]">Palikite tuščia — bus naudojamas LT tekstas.</p>

                        <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                          <div>
                            <AdminInput
                              type="text"
                              value={projectForm.titleEn}
                              onChange={(e) => {
                                const nextTitle = e.target.value
                                setProjectForm((prev) => {
                                  const prevAutoSlug = slugify(prev.titleEn)
                                  const shouldAuto = !prev.slugEn || prev.slugEn === prevAutoSlug
                                  return {
                                    ...prev,
                                    titleEn: nextTitle,
                                    slugEn: shouldAuto ? slugify(nextTitle) : prev.slugEn,
                                  }
                                })
                              }}
                              placeholder="Project title (EN)"
                            />
                          </div>
                          <div>
                            <AdminInput
                              type="text"
                              value={projectForm.subtitleEn}
                              onChange={(e) => setProjectForm({ ...projectForm, subtitleEn: e.target.value })}
                              placeholder="Subtitle (EN)"
                            />
                          </div>
                        </div>

                        <div className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                          <div>
                            <AdminInput
                              type="text"
                              value={projectForm.slugEn}
                              onChange={(e) => setProjectForm({ ...projectForm, slugEn: slugify(e.target.value) })}
                              placeholder="project-slug (EN)"
                            />
                          </div>
                          <div>
                            <AdminInput
                              type="text"
                              value={projectForm.locationEn}
                              onChange={(e) => setProjectForm({ ...projectForm, locationEn: e.target.value })}
                              placeholder="Location (EN)"
                            />
                          </div>
                        </div>

                        <div className="mt-[12px]">
                          <AdminTextarea
                            value={projectForm.descriptionEn}
                            onChange={(e) => setProjectForm({ ...projectForm, descriptionEn: e.target.value })}
                            rows={3}
                            placeholder="Short description (EN)"
                          />
                        </div>

                        <div className="mt-[12px]">
                          <AdminTextarea
                            value={projectForm.fullDescriptionEn}
                            onChange={(e) => setProjectForm({ ...projectForm, fullDescriptionEn: e.target.value })}
                            rows={4}
                            placeholder="Full description (EN)"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                        <div>
                          <AdminInput
                            type="text"
                            value={projectForm.productsUsed}
                            onChange={(e) => setProjectForm({ ...projectForm, productsUsed: e.target.value })}
                            placeholder="Produktai (atskirti kableliais)"
                          />
                          <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Pvz.: Black larch, Brown larch.</p>
                        </div>

                        <div>
                          <AdminSelect
                            value={projectForm.category}
                            onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                          >
                            <option value="residential">Gyvenamieji</option>
                            <option value="commercial">Komerciniai</option>
                            <option value="public">Viešieji</option>
                          </AdminSelect>
                          <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Projekto kategorija.</p>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] bg-[#EAEAEA] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projectForm.featured}
                            onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                            className="w-[20px] h-[20px]"
                          />
                          <span className="font-['Outfit'] text-[14px]">Rekomenduojamas projektas</span>
                        </label>
                        <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                          Pažymėkite, jei projektas turi būti rodomas „rekomenduojamų“ sąrašuose.
                        </p>
                      </div>

                      <div>
                        <label className="block">
                          <span className="font-['Outfit'] text-[14px] font-medium text-[#161616] mb-[8px] block">Pagrindinė nuotrauka</span>
                          <div className="relative">
                            <input
                              ref={featuredImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFeaturedImageUpload}
                              className="hidden"
                              id="editFeaturedImageInput"
                            />
                            <label
                              htmlFor="editFeaturedImageInput"
                              className="flex items-center justify-center w-full px-[16px] py-[12px] border-2 border-dashed border-[#161616] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#f0f0f0] transition-colors bg-[#EAEAEA]"
                            >
                              <span className="text-[#161616] font-medium">
                                {featuredImageFile ? 'Pakeisti nuotrauką' : 'Įkelti nuotrauką'}
                              </span>
                            </label>
                          </div>
                          <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                            Pagrindinė (16:9). Rodoma sąrašuose, jei nustatyta.
                          </p>
                        </label>

                        {featuredImageFile && (
                          <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border-2 border-[#161616]">
                            <Image src={featuredImageFile} alt="Featured preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setFeaturedImageFile('')
                                if (featuredImageInputRef.current) {
                                  featuredImageInputRef.current.value = ''
                                }
                              }}
                              className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-red-500 text-white rounded-full flex items-center justify-center text-[18px] hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-['Outfit'] text-[14px] text-[#535353] mb-[8px]">
                          Galerijos nuotraukos {projectImageFiles.length > 0 && `(${projectImageFiles.length} pasirinkta)`}
                        </label>
                        <input
                          ref={projectFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            handleProjectFileInputChange(e)
                            handleProjectImageUpload(e)
                          }}
                          className="hidden"
                          id="project-file-upload"
                        />
                        <label
                          htmlFor="project-file-upload"
                          className="flex items-center justify-center w-full h-[48px] px-[16px] border-2 border-dashed border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] text-[#535353] hover:border-[#161616] hover:text-[#161616] transition-colors cursor-pointer bg-[#EAEAEA]"
                        >
                          {projectSelectedFileNames}
                        </label>
                        {projectImageFiles.length > 0 && (
                          <div className="grid grid-cols-4 gap-[8px] mt-[12px]">
                            {projectImageFiles.map((img, i) => (
                              <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                                <Image src={img} alt={`Preview ${i + 1}`} fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setProjectImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                          Papildomos galerijos nuotraukos (kvadratinės miniatiūros).
                        </p>
                      </div>

                      <div className="flex gap-[12px] pt-[12px]">
                        <AdminButton type="submit" className="flex-1">
                          {t('projects.actions.save')}
                        </AdminButton>
                        <AdminButton variant="secondary" onClick={handleProjectCancelEdit}>
                          {t('ui.cancel')}
                        </AdminButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminStack>
  )
}

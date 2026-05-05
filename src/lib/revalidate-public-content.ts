import { revalidatePath, revalidateTag } from 'next/cache'
import { publicContentTags } from '@/lib/public-content'

const revalidateHomePath = () => {
    revalidatePath('/')
}

export function revalidateProjectContent({
    currentSlug,
    previousSlug,
}: {
    currentSlug?: string | null
    previousSlug?: string | null
} = {}) {
    revalidateTag(publicContentTags.projects)
    revalidateHomePath()
    revalidatePath('/sitemap.xml')

    const slugs = new Set([currentSlug, previousSlug].filter(Boolean))

    for (const slug of slugs) {
        revalidatePath(`/${slug}`)
    }
}

export function revalidateProjectSkillsContent(slug?: string | null) {
    revalidateTag(publicContentTags.projects)
    revalidateTag(publicContentTags.skills)
    revalidateHomePath()

    if (slug) {
        revalidatePath(`/${slug}`)
    }
}

export function revalidateSkillsContent() {
    revalidateTag(publicContentTags.skills)
    revalidateTag(publicContentTags.projects)
    revalidateHomePath()
}

export function revalidateContactLinksContent() {
    revalidateTag(publicContentTags.contactLinks)
    revalidateHomePath()
}

export function revalidateCvContent() {
    revalidateTag(publicContentTags.cv)
    revalidatePath('/cv')
}

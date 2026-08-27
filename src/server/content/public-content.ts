import { unstable_cache } from 'next/cache'
import { Types } from 'mongoose'
import connectDB from '@/server/db/mongodb'
import Project from '@/server/models/Project'
import Skill from '@/server/models/Skill'
import SkillCategoryModel from '@/server/models/SkillCategory'
import ContactLink from '@/server/models/ContactLink'
import CV from '@/server/models/CV'
import Like from '@/server/models/Like'
import { DetailedProjectType, MinimalProjectType, ProjectMedia, ProjectMusic } from '@/types/ProjectTypes'
import { SkillCategory, SkillChild } from '@/types/SkillsTypes'

export const publicContentTags = {
    projects: 'public:projects',
    skills: 'public:skills',
    contactLinks: 'public:contact-links',
    cv: 'public:cv',
    likes: 'public:likes',
} as const

export interface PublicContactLink {
    id: string
    href: string
    display_text: string
    copy_text: string
    order: number
}

export interface PublicCV {
    id: string
    url: string
    fileName: string
    customName: string
    uploadedAt: string
}

export interface PublicProjectSitemapEntry {
    slug: string
    updatedAt: string
}

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

interface ProjectMediaSource {
    url?: string
    type?: 'image' | 'video'
    mobileUrl?: string
}

interface ProjectMusicSource {
    url?: string
    label?: string
    startAt?: number
    volume?: number
    rootOffset?: number
    creditUrl?: string
}

interface ProjectWithOptionalOrder {
    _id: Types.ObjectId
    name: string
    subtitle?: string
    slug: string
    date: Date
    summary: string
    description: string
    stack: PopulatedSkill[]
    githubLink?: string
    webLink?: string
    cover_image: string
    mobile_cover_image?: string
    medias?: ProjectMediaSource[]
    color?: string
    order?: number
    music?: ProjectMusicSource
    updatedAt: Date
}

interface SkillCategoryWithSkills {
    _id: Types.ObjectId
    name: string
    truncatedName: string
    skills: PopulatedSkill[]
}

const mapSkill = (skill: PopulatedSkill): SkillChild => ({
    id: skill._id.toString(),
    name: skill.name,
    icon: skill.icon || '',
    description: skill.description || '',
})

const mapProjectMedia = (media: ProjectMediaSource): ProjectMedia | null => {
    if (!media?.url) {
        return null
    }

    return {
        url: media.url,
        type: media.type === 'video' ? 'video' : 'image',
        mobileUrl: media.mobileUrl,
    }
}

const getProjectMedias = (coverImage: string, medias?: ProjectMediaSource[]): ProjectMedia[] => {
    if (medias && medias.length > 0) {
        const mappedMedias = medias.map(mapProjectMedia).filter((media): media is ProjectMedia => media !== null)

        if (mappedMedias.length > 0) {
            return mappedMedias
        }
    }

    return coverImage ? [{ url: coverImage, type: 'image' }] : []
}

const mapMinimalProject = (project: ProjectWithOptionalOrder): MinimalProjectType => ({
    id: project._id.toString(),
    name: project.name,
    subtitle: project.subtitle,
    date: project.date.toISOString(),
    slug: project.slug,
    cover_image: project.cover_image,
    summary: project.summary,
    color: project.color || '#f0f0f0',
    stack: (project.stack || []).map(mapSkill),
})

const mapProjectMusic = (music?: ProjectMusicSource): ProjectMusic | undefined => {
    if (!music?.url) {
        return undefined
    }

    return {
        url: music.url,
        label: music.label,
        startAt: music.startAt,
        volume: music.volume,
        rootOffset: music.rootOffset,
        creditUrl: music.creditUrl,
    }
}

const mapDetailedProject = (project: ProjectWithOptionalOrder): DetailedProjectType => ({
    id: project._id.toString(),
    name: project.name,
    subtitle: project.subtitle,
    date: project.date.toISOString(),
    slug: project.slug,
    cover_image: project.cover_image,
    mobile_cover_image: project.mobile_cover_image,
    medias: getProjectMedias(project.cover_image, project.medias),
    summary: project.summary,
    description: project.description,
    color: project.color || '#f0f0f0',
    stack: (project.stack || []).map(mapSkill),
    githubLink: project.githubLink,
    webLink: project.webLink,
    order: project.order ?? 0,
    music: mapProjectMusic(project.music),
})

const getPublicProjectsCached = unstable_cache(
    async (): Promise<MinimalProjectType[]> => {
        await connectDB()
        Skill.modelName

        const projects = (await Project.find().populate('stack').sort({ date: -1 })) as unknown as ProjectWithOptionalOrder[]

        return projects.map(mapMinimalProject)
    },
    ['public-projects'],
    { tags: [publicContentTags.projects] },
)

const getPublicProjectBySlugCached = unstable_cache(
    async (slug: string): Promise<DetailedProjectType | null> => {
        await connectDB()
        Skill.modelName

        const project = (await Project.findOne({ slug }).populate('stack')) as unknown as ProjectWithOptionalOrder | null

        if (!project) {
            return null
        }

        return mapDetailedProject(project)
    },
    ['public-project-by-slug'],
    { tags: [publicContentTags.projects] },
)

const getPublicProjectSitemapEntriesCached = unstable_cache(
    async (): Promise<PublicProjectSitemapEntry[]> => {
        await connectDB()

        const projects = (await Project.find({}, 'slug updatedAt').sort({ date: -1 })) as unknown as Array<{
            slug: string
            updatedAt: Date
        }>

        return projects.map((project) => ({
            slug: project.slug,
            updatedAt: project.updatedAt.toISOString(),
        }))
    },
    ['public-project-sitemap-entries'],
    { tags: [publicContentTags.projects] },
)

const getPublicSkillCategoriesCached = unstable_cache(
    async (): Promise<SkillCategory[]> => {
        await connectDB()
        Skill.modelName

        const categories = (await SkillCategoryModel.find().sort({ order: 1 }).populate('skills')) as unknown as SkillCategoryWithSkills[]

        return categories.map((category) => ({
            id: category._id.toString(),
            name: category.name,
            truncatedName: category.truncatedName,
            skills: (category.skills || []).map(mapSkill),
        }))
    },
    ['public-skill-categories'],
    { tags: [publicContentTags.skills] },
)

const getPublicContactLinksCached = unstable_cache(
    async (): Promise<PublicContactLink[]> => {
        await connectDB()

        const contactLinks = await ContactLink.find().sort({ order: 1 })

        return contactLinks.map((link) => ({
            id: link._id.toString(),
            href: link.href,
            display_text: link.display_text,
            copy_text: link.copy_text,
            order: link.order,
        }))
    },
    ['public-contact-links'],
    { tags: [publicContentTags.contactLinks] },
)

const getPublicCvCached = unstable_cache(
    async (): Promise<PublicCV | null> => {
        await connectDB()

        const cv = await CV.findOne()

        if (!cv) {
            return null
        }

        return {
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt.toISOString(),
        }
    },
    ['public-cv'],
    { tags: [publicContentTags.cv] },
)

export async function getPublicProjects() {
    return getPublicProjectsCached()
}

export async function getPublicProjectBySlug(slug: string) {
    return getPublicProjectBySlugCached(slug)
}

export async function getPublicProjectSitemapEntries() {
    return getPublicProjectSitemapEntriesCached()
}

export async function getPublicSkillCategories() {
    return getPublicSkillCategoriesCached()
}

export async function getPublicContactLinks() {
    return getPublicContactLinksCached()
}

export async function getPublicCv() {
    return getPublicCvCached()
}

const getPublicLikeCountCached = unstable_cache(
    async (): Promise<number> => {
        await connectDB()

        const like = await Like.findOne()

        return like?.count ?? 0
    },
    ['public-like-count'],
    { tags: [publicContentTags.likes] },
)

export async function getPublicLikeCount() {
    return getPublicLikeCountCached()
}

export interface ContactLinkResponse {
    id: string
    href: string
    display_text: string
    copy_text: string
    order: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function getContactLinks(): Promise<ContactLinkResponse[]> {
    const res = await fetch(`${API_URL}/api/contact-links`)

    if (!res.ok) {
        throw new Error('Failed to fetch contact links')
    }

    return res.json()
}

export async function getContactLink(id: string): Promise<ContactLinkResponse> {
    const res = await fetch(`${API_URL}/api/contact-links/${id}`)

    if (!res.ok) {
        throw new Error('Failed to fetch contact link')
    }

    return res.json()
}

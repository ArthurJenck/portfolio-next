export const queryKeys = {
    projects: ['projects'] as const,
    project: (id: string) => [...queryKeys.projects, id] as const,

    skills: ['skills'] as const,
    techs: ['techs'] as const,
    cv: ['cv'] as const,

    contactLinks: ['contactLinks'] as const,
    contactLink: (id: string) => [...queryKeys.contactLinks, id] as const,
}

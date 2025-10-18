import type { CollectionConfig } from "payload"

export const Projects: CollectionConfig = {
    slug: "projects",
    admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "date", "updatedAt"],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
            label: "Nom du projet",
        },
        {
            name: "date",
            type: "date",
            required: true,
            label: "Date du projet",
            admin: {
                date: {
                    pickerAppearance: "dayOnly",
                    displayFormat: "dd/MM/yyyy",
                },
            },
        },
        {
            name: "description",
            type: "textarea",
            required: true,
            label: "Description",
        },
        {
            name: "technologies",
            type: "relationship",
            relationTo: "techs",
            hasMany: true,
            label: "Technologies utilisées",
        },
        {
            name: "githubLink",
            type: "text",
            label: "Lien GitHub",
            admin: {
                placeholder: "https://github.com/...",
            },
        },
        {
            name: "webLink",
            type: "text",
            label: "Lien du site web",
            admin: {
                placeholder: "https://...",
            },
        },
        {
            name: "images",
            type: "relationship",
            relationTo: "media",
            hasMany: true,
            label: "Images du projet",
        },
    ],
}

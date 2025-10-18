import type { CollectionConfig } from "payload"

export const Skills: CollectionConfig = {
    slug: "skills",
    admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "category", "updatedAt"],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "category",
            type: "select",
            required: true,
            label: "Catégorie",
            options: [
                {
                    label: "Front-end",
                    value: "Front-end",
                },
                {
                    label: "Back-end",
                    value: "Back-end",
                },
                {
                    label: "Outils",
                    value: "Outils",
                },
            ],
        },
        {
            name: "name",
            type: "text",
            required: true,
            label: "Nom de la compétence",
        },
        {
            name: "icon",
            type: "text",
            label: "Chemin de l'icône",
            admin: {
                placeholder: "/assets/icons/...",
                description:
                    "Chemin relatif vers l'icône dans le dossier public",
            },
        },
        {
            name: "description",
            type: "textarea",
            label: "Description",
        },
    ],
}

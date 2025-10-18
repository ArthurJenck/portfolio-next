import type { CollectionConfig } from "payload"

export const Techs: CollectionConfig = {
    slug: "techs",
    admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "order", "active", "updatedAt"],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            label: "Titre de la technologie",
        },
        {
            name: "icon",
            type: "text",
            label: "Icône",
            admin: {
                placeholder: "/assets/icons/...",
                description: "Chemin relatif vers l'icône",
            },
        },
        {
            name: "activeIcon",
            type: "text",
            label: "Icône active",
            admin: {
                placeholder: "/assets/icons/...",
                description: "Chemin relatif vers l'icône active",
            },
        },
        {
            name: "inactiveIcon",
            type: "text",
            label: "Icône inactive",
            admin: {
                placeholder: "/assets/icons/...",
                description: "Chemin relatif vers l'icône inactive",
            },
        },
        {
            name: "order",
            type: "number",
            label: "Ordre d'affichage",
            defaultValue: 1,
            admin: {
                description: "Ordre d'affichage de la technologie",
            },
        },
        {
            name: "active",
            type: "checkbox",
            label: "Actif",
            defaultValue: true,
        },
    ],
}

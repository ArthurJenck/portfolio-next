import { Skeleton } from '@/components/ui/skeleton'

const ContactLinksSkeleton = () => {
    const linkCount = 4

    return (
        <>
            {Array.from({ length: linkCount }).map((_, index) => (
                <li key={index} className="relative flex mt-12 items-center">
                    {/* Skeleton pour le texte du lien */}
                    <Skeleton className="h-6 md:h-7 w-48 md:w-64" />

                    {/* Skeleton pour le bouton copier */}
                    <Skeleton className="ml-4 h-8 w-8 rounded-md" />
                </li>
            ))}
        </>
    )
}

export default ContactLinksSkeleton

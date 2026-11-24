import Image, { getImageProps } from 'next/image'

interface ProjectPictureProps {
    src: string
    mobileSrc?: string
    alt: string
    className: string
    priority?: boolean
}

const ProjectPicture = ({ src, mobileSrc, alt, className, priority = false }: ProjectPictureProps) => {
    const imageProps = { fill: true, sizes: '100vw', quality: 90 }

    if (!mobileSrc) {
        return <Image {...imageProps} src={src} alt={alt} className={className} priority={priority} />
    }

    const { props: mobile } = getImageProps({ ...imageProps, src: mobileSrc, alt })

    return (
        <picture>
            <source media="(width < 48rem)" srcSet={mobile.srcSet ?? mobile.src} sizes={mobile.sizes} />
            <Image
                {...imageProps}
                src={src}
                alt={alt}
                className={className}
                loading={priority ? 'eager' : undefined}
                fetchPriority={priority ? 'high' : undefined}
            />
        </picture>
    )
}

export default ProjectPicture

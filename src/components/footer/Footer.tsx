import ImgLink from '@/components/header/ImgLink'
import LikeButton from './LikeButton'
import { getPublicLikeCount } from '@/server/content/public-content'

const Footer = async () => {
    const likeCount = await getPublicLikeCount()

    return (
        <footer className="relative bg-[var(--secondary)] flex flex-col md:flex-row justify-between items-center py-4 md:py-4 px-0 md:px-8 gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-[1.5vw]">
                <ImgLink type="logo" className="size-16" />
                <p className="font-bold tracking-[1px] text-center md:text-left">
                    Merci d'être passé, ça vous a plu ?<span className="block">N'hésitez pas à me le dire !</span>
                </p>
                <LikeButton initialCount={likeCount} />
            </div>
            <div className="socials flex justify-center items-center gap-2">
                <ImgLink type="linkedin" />
                <ImgLink type="github" />
            </div>
        </footer>
    )
}

export default Footer

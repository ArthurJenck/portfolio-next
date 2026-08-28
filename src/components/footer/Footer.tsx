import ImgLink from '@/components/header/ImgLink'
import LikeButton from './LikeButton'
import { getPublicLikeCount } from '@/server/content/public-content'

const Footer = async () => {
    const likeCount = await getPublicLikeCount()

    return (
        <footer className="relative bg-(--secondary) flex flex-col md:flex-row justify-between items-center pt-4 py-6 md:py-4 px-0 md:px-8 gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-[1.5vw]">
                <div className="flex items-center gap-2">
                    <ImgLink type="logo" className="size-16" />
                </div>
                <p className="font-bold tracking-[1px] text-center md:text-left">
                    Merci d'être passé, ça vous a plu ?<span className="block">N'hésitez pas à me le dire !</span>
                </p>
                <div className="max-md:hidden">
                    <LikeButton initialCount={likeCount} />
                </div>
            </div>
            <div className="socials flex justify-center items-center gap-2">
                <div className="md:hidden">
                    <LikeButton initialCount={likeCount} hideCount className="size-10" />
                </div>
                <ImgLink type="linkedin" />
                <ImgLink type="github" />
            </div>
        </footer>
    )
}

export default Footer

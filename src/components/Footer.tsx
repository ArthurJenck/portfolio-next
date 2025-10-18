import ImgLink from "./ImgLink"

const Footer = () => {
    return (
        <footer className="relative bg-[var(--secondary)] flex flex-col md:flex-row justify-between items-center py-4 md:py-[2vw] px-0 md:px-[4vw] gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-[1.5vw]">
                <ImgLink type="logo" className="size-16" />
                <p className="font-bold tracking-[1px] text-center md:text-left">
                    Merci d'être passé, ça vous a plu ?
                    <span className="block">N'hésitez pas à me le dire !</span>
                </p>
            </div>
            <div className="socials flex justify-center items-center gap-2">
                <ImgLink type="linkedin" />
                <ImgLink type="github" />
            </div>
        </footer>
    )
}

export default Footer

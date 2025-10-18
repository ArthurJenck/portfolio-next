import Link from "next/link"
import ImgLink from "../components/ImgLink"
import "../styles/404.scss"

const NotFound = () => {
    return (
        <div
            id="page-404"
            className="relative h-svh flex flex-col items-center justify-center gap-[5vh] pb-10"
        >
            <h1 className="flex flex-col items-center font-bold text-[clamp(1.25rem,2.5vw,2.5vw)]">
                Erreur{" "}
                <span className="text-[clamp(8.5rem,20vw,250px)] leading-[clamp(8rem,17vw,230px)]">
                    404
                </span>
            </h1>

            <div className="flex gap-1 font-bold">
                <p className="text-[clamp(0.85rem,2vw,2rem)] relative">
                    Vous êtes perdu ?
                </p>
                <Link
                    href="/"
                    className="text-[clamp(0.85rem,2vw,2rem)] relative"
                >
                    Revenir en lieu sûr
                </Link>
            </div>
            <ImgLink
                type="logo"
                link="/"
                className="size-[clamp(100px,5vw,5vw)]"
            />
        </div>
    )
}

export default NotFound

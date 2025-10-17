"use client"

import Logo from "../assets/icons/logo.svg"
import linkedinIcon from "../assets/icons/linkedin-icon.svg"
import githubIcon from "../assets/icons/github-icon.svg"
import cvIcon from "../assets/icons/cv-icon.svg"
import extLinkIcon from "../assets/icons/ext-link.svg"
import "../styles/ImgLink.scss"
import { isMobileDevice, scrollTo } from "../hooks"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const ImgLink = (props: {
    for: string
    link?: string
    otherAlt?: string
    className?: string
}) => {
    let link = "/"
    let linkMobile = ""
    let icon = Logo
    let alt = "Logo blanc"

    // Les liens sont importés via le .env pour faciliter un éventuel changement d'URL par la suite
    switch (props.for) {
        case "linkedin":
            link = "https://www.linkedin.com/in/arthurjenck/"
            icon = linkedinIcon
            alt = "Lien vers mon compte Linkedin"
            break
        case "github":
            // Pour les projets, un lien spécifique est fourni. On vérifie si ce lien existe, sinon on renvoie le lien GitHub classique
            link = props.link ? props.link : "https://github.com/ArthurJenck/"
            icon = githubIcon
            props.otherAlt
                ? (alt = props.otherAlt)
                : (alt = "Lien vers mon compte GitHub")
            break
        case "cv":
            link = "/cv"
            linkMobile = "/CV Arthur Jenck.pdf"
            icon = cvIcon
            alt = "Lien vers mon CV"
            break
        case "projet":
            link = props.link ? props.link : ""
            icon = extLinkIcon
            alt = "Lien vers le site"
            break

        default:
            break
    }

    // Pour les liens externes (linkedin, github, projets) ou pour logo avec lien spécifique
    const isExternal = props.for !== "logo" && props.for !== "cv"
    const isLogoWithoutLink = props.for === "logo" && !props.link
    const isMobile = isMobileDevice()

    if (isExternal || (props.for === "cv" && isMobile)) {
        return (
            <a
                href={props.for === "cv" && isMobile ? linkMobile : link}
                className={cn(
                    props.for === "logo" ? "logo-link" : "socials-link",
                    props.className
                )}
                target={props.for === "logo" ? "" : "_blank"}
                rel={props.for !== "logo" ? "noopener noreferrer" : undefined}
            >
                <Image
                    src={icon}
                    alt={alt}
                    width={100}
                    height={100}
                    style={{ width: "100%", height: "100%" }}
                />
            </a>
        )
    }

    return (
        // Le CV est un cas particulier, la version bureau amenant vers une page différente avec un lecteur de PDF, la version mobile faisant télécharger le document
        <Link
            href={link}
            // Dans le cas où le composant représente le logo et sert de to-top, on retire le chargement de la page
            onClick={
                isLogoWithoutLink
                    ? (e) => {
                          e.preventDefault()
                          scrollTo(0)
                      }
                    : () => {}
            }
            className={cn(
                props.for === "logo" ? "logo-link" : "socials-link",
                props.className
            )}
        >
            <Image
                src={icon}
                alt={alt}
                width={100}
                height={100}
                className="aspect-square max-w-full max-h-full"
                style={{ width: "100%", height: "100%" }}
            />
        </Link>
    )
}

export default ImgLink

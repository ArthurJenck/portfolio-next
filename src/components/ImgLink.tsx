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

interface ImgLinkProps {
    type: "logo" | "linkedin" | "github" | "cv" | "projet"
    link?: string
    alt?: string
    className?: string
    size?: number
}

const ImgLink = ({
    type,
    link: customLink,
    alt: customAlt,
    className,
    size = 100,
}: ImgLinkProps) => {
    // Configuration des liens et icônes selon le type
    const getLinkConfig = () => {
        switch (type) {
            case "linkedin":
                return {
                    link: "https://www.linkedin.com/in/arthurjenck/",
                    icon: linkedinIcon,
                    alt: "Lien vers mon compte Linkedin",
                }
            case "github":
                return {
                    link: customLink || "https://github.com/ArthurJenck/",
                    icon: githubIcon,
                    alt: customAlt || "Lien vers mon compte GitHub",
                }
            case "cv":
                return {
                    link: "/cv",
                    linkMobile: "/CV Arthur Jenck.pdf",
                    icon: cvIcon,
                    alt: "Lien vers mon CV",
                }
            case "projet":
                return {
                    link: customLink || "",
                    icon: extLinkIcon,
                    alt: "Lien vers le site",
                }
            default:
                return {
                    link: "/",
                    icon: Logo,
                    alt: "Logo blanc",
                }
        }
    }

    const { link, linkMobile, icon, alt } = getLinkConfig()

    // Pour les liens externes (linkedin, github, projets) ou pour logo avec lien spécifique
    const isExternal = type !== "logo" && type !== "cv"
    const isLogoWithoutLink = type === "logo" && !customLink
    const isMobile = isMobileDevice()

    if (isExternal || (type === "cv" && isMobile)) {
        return (
            <a
                href={type === "cv" && isMobile ? linkMobile : link}
                className={cn("socials-link", className)}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    src={icon}
                    alt={alt}
                    width={size}
                    height={size}
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
                type === "logo" ? "logo-link" : "socials-link",
                className
            )}
        >
            <Image
                src={icon}
                alt={alt}
                width={size}
                height={size}
                style={{ width: "100%", height: "100%" }}
            />
        </Link>
    )
}

export default ImgLink

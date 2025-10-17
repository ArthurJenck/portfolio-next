"use client"

import { motion } from "framer-motion"
import Logo from "../assets/icons/logo.svg"
import linkedinIcon from "../assets/icons/linkedin-icon.svg"
import githubIcon from "../assets/icons/github-icon.svg"
import cvIcon from "../assets/icons/cv-icon.svg"
import extLinkIcon from "../assets/icons/ext-link.svg"
import { scrollTo } from "../hooks"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImgLinkProps {
    type: "logo" | "linkedin" | "github" | "cv" | "projet"
    link?: string
    alt?: string
    className?: string
}

const ImgLink = ({
    type,
    link: customLink,
    alt: customAlt,
    className,
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

    // Pour les liens externes (linkedin, github, projets)
    const isExternal = type !== "logo" && type !== "cv"
    const isLogoWithoutLink = type === "logo" && !customLink

    // Animations communes pour les liens sociaux (uniquement desktop)
    const animationProps = {
        transition: { type: "spring" as const, stiffness: 400, damping: 12 },
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
    }

    if (isExternal) {
        return (
            <>
                {/* Version mobile : sans animation */}
                <a
                    href={link}
                    className={cn("select-none md:hidden", className)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        src={icon}
                        alt={alt}
                        width={100}
                        height={100}
                        style={{ width: "100%", height: "100%" }}
                    />
                </a>

                {/* Version desktop : avec animations */}
                <motion.a
                    href={link}
                    className={cn("select-none hidden md:block", className)}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...animationProps}
                >
                    <Image
                        src={icon}
                        alt={alt}
                        width={100}
                        height={100}
                        style={{ width: "100%", height: "100%" }}
                    />
                </motion.a>
            </>
        )
    }

    // Le CV a deux versions : mobile (téléchargement direct) et desktop (page avec lecteur)
    if (type === "cv") {
        return (
            <>
                {/* Version mobile : lien direct vers le PDF */}
                <motion.a
                    href={linkMobile}
                    className={cn("select-none block md:hidden", className)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        src={icon}
                        alt={alt}
                        width={100}
                        height={100}
                        style={{ width: "100%", height: "100%" }}
                    />
                </motion.a>

                {/* Version desktop : lien vers la page CV avec animations */}
                <motion.div className={cn("hidden md:block", className)}>
                    <Link href={link} className="select-none">
                        <motion.div {...animationProps}>
                            <Image
                                src={icon}
                                alt={alt}
                                width={100}
                                height={100}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </motion.div>
                    </Link>
                </motion.div>
            </>
        )
    }

    // Logo ou lien interne
    return (
        <>
            {/* Version mobile : sans animation */}
            <Link
                href={link}
                onClick={
                    isLogoWithoutLink
                        ? (e) => {
                              e.preventDefault()
                              scrollTo(0)
                          }
                        : undefined
                }
                className={cn("select-none block md:hidden", className)}
            >
                <Image
                    src={icon}
                    alt={alt}
                    width={100}
                    height={100}
                    style={{ width: "100%", height: "100%" }}
                />
            </Link>

            {/* Version desktop : avec animations */}
            <Link
                href={link}
                className={cn("select-none hidden md:block", className)}
                onClick={
                    isLogoWithoutLink
                        ? (e) => {
                              e.preventDefault()
                              scrollTo(0)
                          }
                        : undefined
                }
            >
                <motion.div
                    {...animationProps}
                    className={cn("select-none hidden md:block", className)}
                >
                    <Image
                        src={icon}
                        alt={alt}
                        width={100}
                        height={100}
                        style={{ width: "100%", height: "100%" }}
                    />
                </motion.div>
            </Link>
        </>
    )
}

export default ImgLink

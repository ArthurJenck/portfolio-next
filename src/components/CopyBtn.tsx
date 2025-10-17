"use client"

import copyIcon from "../assets/icons/copy.svg"
import checkIcon from "../assets/icons/check.svg"
import "../styles/CopyBtn.scss"
import Image from "next/image"
import { useState } from "react"

const CopyBtn = () => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopyClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // On trouve la balise a sibling
        const linkElem = e.currentTarget.parentElement
            ?.firstChild as HTMLLinkElement
        // On ajoute le href du lien au presse-papier, en retirant les schémas d'url
        navigator.clipboard.writeText(
            linkElem.href.replace("mailto:", "").replace("tel:", "")
        )
        // Pendant une seconde, l'icone se modifie en coche pour signifier le succès de l'opération
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }

    return (
        <div
            className="about-links__copy"
            onClick={(e) => handleCopyClick(e)}
            aria-hidden
            style={{ display: isCopied ? "block" : "" }}
        >
            <Image
                src={isCopied ? checkIcon : copyIcon}
                alt=""
                width={24}
                height={24}
            />
        </div>
    )
}

export default CopyBtn

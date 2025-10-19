'use client'

import { useState } from 'react'
import CopyBtn from './CopyBtn'
import Link from 'next/link'

interface ContactLinkProps {
    href: string
    displayText: string
    copyText: string
}

const ContactLink = ({ href, displayText, copyText }: ContactLinkProps) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <li
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="about-link relative flex mt-12"
        >
            <Link href={href} target="_blank" className="font-bold">
                {displayText}
            </Link>
            <CopyBtn copyText={copyText} isHovered={isHovered} />
        </li>
    )
}

export default ContactLink

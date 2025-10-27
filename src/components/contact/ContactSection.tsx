'use client'

import React from 'react'
import './Contact.scss'
import ContactLink from './ContactLink'
import SectionTitle from '@/components/SectionTitle'
import { useContactLinks } from '@/hooks/useContactLinks'
import ContactLinksSkeleton from './ContactLinksSkeleton'

const Contact = () => {
    const { data: contactLinks, isLoading } = useContactLinks()

    return (
        <section id="contact" className="relative z-0 md:pb-[12vh]">
            <SectionTitle title="On prend un café ?" />
            <ul className="about-links flex flex-col items-start md:items-center text-base md:text-xl ml-[13vw] md:ml-0 mt-4 md:mt-6 pb-16 md:pb-0">
                {isLoading ? (
                    <ContactLinksSkeleton />
                ) : (
                    contactLinks?.map((link, index) => (
                        <ContactLink
                            key={index}
                            href={link.href}
                            displayText={link.display_text}
                            copyText={link.copy_text}
                        />
                    ))
                )}
            </ul>
        </section>
    )
}

export default Contact

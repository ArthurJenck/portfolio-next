import React from "react"
import "../styles/Contact.scss"
import ContactLink from "../components/ContactLink"
import SectionTitle from "@/components/SectionTitle"

const Contact = () => {
    const contactLinks = [
        {
            id: "mail",
            href: "mailto:contact@arthurjenck.com",
            displayText: "contact@arthurjenck.com",
            copyText: "contact@arthurjenck.com",
        },
        {
            id: "tel",
            href: "tel:0610790509",
            displayText: "06.10.79.05.09",
            copyText: "0610790509",
        },
        {
            id: "linkedin",
            href: "https://www.linkedin.com/in/arthurjenck/",
            displayText: "linkedin.com/in/arthurjenck",
            copyText: "https://www.linkedin.com/in/arthurjenck/",
        },
        {
            id: "github",
            href: "https://github.com/ArthurJenck/",
            displayText: "github.com/ArthurJenck",
            copyText: "https://github.com/ArthurJenck/",
        },
    ]

    return (
        <section id="contact" className="relative z-0 md:pb-[15vh]">
            <SectionTitle title="On prend un café ?" />
            <ul className="about-links flex flex-col items-start md:items-center text-base md:text-xl ml-[13vw] md:ml-0 mt-4 md:mt-6 pb-16 md:pb-0">
                {contactLinks.map((link) => (
                    <ContactLink
                        key={link.id}
                        href={link.href}
                        displayText={link.displayText}
                        copyText={link.copyText}
                    />
                ))}
            </ul>
        </section>
    )
}

export default Contact

import Header from '@/components/header/HeaderSection'
import Skills from '@/components/skills/SkillsSection'
import About from '@/components/about/AboutSection'
import Contact from '@/components/contact/ContactSection'
import Projets from '@/components/projects/ProjectsSection'
import FastTravel from '@/components/fastTravel/FastTravel'
import TunnelGate from '@/components/background/TunnelGate'
import { getPublicContactLinks, getPublicProjects, getPublicSkillCategories } from '@/server/content/public-content'

const Home = async () => {
    const [skillCategories, projects, contactLinks] = await Promise.all([
        getPublicSkillCategories(),
        getPublicProjects(),
        getPublicContactLinks(),
    ])

    return (
        <>
            <FastTravel />
            <Header />
            <TunnelGate />
            <main>
                <Skills skillCategories={skillCategories} />
                <Projets projects={projects} />
                <About />
                <Contact contactLinks={contactLinks} />
            </main>
        </>
    )
}

export default Home

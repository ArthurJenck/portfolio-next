import Header from '@/components/header/HeaderSection'
import Skills from '@/components/skills/SkillsSection'
import About from '@/components/about/AboutSection'
import Contact from '@/components/contact/ContactSection'
import Projets from '@/components/projects/ProjectsSection'
import FastTravel from '@/components/FastTravel/FastTravel'

const Home = () => {
    return (
        <>
            <FastTravel />
            <Header />
            <Skills />
            <Projets />
            <About />
            <Contact />
        </>
    )
}

export default Home

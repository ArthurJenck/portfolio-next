import Header from '@/sections/Header'
import Skills from '@/sections/Skills'
import About from '@/sections/About'
import Contact from '@/sections/Contact'
import Projets from '@/sections/Projects'
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

import NavBar from '../components/NavBar'
import Header from '../sections/Header'
import Skills from '../sections/Skills'
import FastTravel from '../components/FastTravel/FastTravel'
import Projets from '../sections/Projets'
import About from './About'
import Contact from './Contact'
import Footer from '../components/Footer'

const App = () => {
    return (
        <>
            <NavBar />
            <FastTravel />
            <Header />
            <Skills />
            <Projets />
            <About />
            <Contact />
            <Footer />
        </>
    )
}

export default App

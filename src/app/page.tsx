"use client"

import NavBar from "../components/NavBar"
import Header from "../pages/Header"
import Skills from "../pages/Skills"
import FastTravel from "../components/FastTravel"
import About from "../pages/About"
import Contact from "../pages/Contact"
import Footer from "../components/Footer"
import Projets from "../pages/Projets"

const Home = () => {
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

export default Home

import ImgLink from "./ImgLink"
import "../styles/Footer.scss"

const Footer = () => {
    return (
        <footer>
            <ImgLink type="logo" />
            <p>
                Merci d'être passé, ça vous a plu ?
                <span>N'hésitez pas à me le dire !</span>
            </p>
            <div className="socials">
                <ImgLink type="linkedin" />
                <ImgLink type="github" />
            </div>
        </footer>
    )
}

export default Footer

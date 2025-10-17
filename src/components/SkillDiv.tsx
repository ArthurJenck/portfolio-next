import "../styles/SkillDiv.scss"
import Image, { StaticImageData } from "next/image"

interface SkillDivProps {
    pic: StaticImageData
    name: string
    desc: string
}

const SkillDiv = ({ pic, name, desc }: SkillDivProps) => {
    return (
        <li className="skill-div">
            <Image
                src={pic}
                alt={`Logo ${name}`}
                title={name}
                width={60}
                height={60}
            />
            <div className="skill-div__desc">
                <h4>{name}</h4>
                <p>{desc}</p>
            </div>
        </li>
    )
}

export default SkillDiv

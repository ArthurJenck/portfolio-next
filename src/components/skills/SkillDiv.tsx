import Image from 'next/image'

interface SkillDivProps {
    pic: string
    name: string
    desc: string
}

const SkillDiv = ({ pic, name, desc }: SkillDivProps) => {
    return (
        <li className="flex flex-col lg:flex-row gap-1 lg:gap-[2.5vw] items-start lg:items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
                <Image
                    src={pic}
                    alt={`Logo ${name}`}
                    title={name}
                    width={60}
                    height={60}
                    className="w-[clamp(1.5rem,3.5vw,3.5vw)] lg:w-[5vw] h-[clamp(1.5rem,3.5vw,3.5vw)] lg:h-[5vw]"
                />
                <h4 className="md:hidden font-bold text-[clamp(1.25rem,2.25vw,2.25vw)] lg:text-[1.5vw]">{name}</h4>
            </div>
            <div>
                <h4 className="hidden md:block font-bold text-[clamp(1.25rem,2.25vw,2.25vw)] lg:text-[1.5vw]">
                    {name}
                </h4>
                <p className="text-[clamp(1rem,2vw,2vw)] lg:text-[1.25vw]">{desc}</p>
            </div>
        </li>
    )
}

export default SkillDiv

import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProjectMedia {
    url: string
    type: 'image' | 'video'
}

export interface IProject extends Document {
    name: string
    subtitle?: string
    slug: string
    date: Date
    summary: string
    description: string
    stack: Types.ObjectId[]
    githubLink?: string
    webLink?: string
    cover_image: string
    medias: IProjectMedia[]
    createdAt: Date
    updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        subtitle: { type: String, required: false, default: '' },
        slug: { type: String, required: true, unique: true },
        date: { type: Date, required: true },
        summary: { type: String, required: true },
        description: { type: String, required: true },
        stack: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
        githubLink: String,
        webLink: String,
        cover_image: { type: String, required: true },
        medias: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ['image', 'video'], required: true },
            },
        ],
    },
    { timestamps: true },
)

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

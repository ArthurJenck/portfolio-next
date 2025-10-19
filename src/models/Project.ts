import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProject extends Document {
    name: string
    date: Date
    summary: string
    description: string
    stack: Types.ObjectId[]
    githubLink?: string
    webLink?: string
    image: string
    order: number
    createdAt: Date
    updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        summary: { type: String, required: true },
        description: { type: String, required: true },
        stack: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
        githubLink: String,
        webLink: String,
        image: { type: String, required: true },
        order: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
)

ProjectSchema.index({ order: 1 })

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

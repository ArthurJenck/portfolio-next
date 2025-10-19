import mongoose, { Schema, Document } from 'mongoose'

export interface ISkill extends Document {
    name: string
    icon: string
    description?: string
    order: number
    createdAt: Date
    updatedAt: Date
}

const SkillSchema = new Schema<ISkill>(
    {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        description: String,
        order: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
)

SkillSchema.index({ order: 1 })

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema)

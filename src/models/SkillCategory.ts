import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ISkillCategory extends Document {
    name: string
    truncatedName: string
    skills: Types.ObjectId[]
    order: number
    createdAt: Date
    updatedAt: Date
}

const SkillCategorySchema = new Schema<ISkillCategory>(
    {
        name: { type: String, required: true },
        truncatedName: { type: String, required: true },
        skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
        order: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
)

SkillCategorySchema.index({ order: 1 })

export default mongoose.models.SkillCategory || mongoose.model<ISkillCategory>('SkillCategory', SkillCategorySchema)

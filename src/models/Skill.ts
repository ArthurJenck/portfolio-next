import mongoose, { Schema, Document } from 'mongoose'

export interface ISkill extends Document {
  category: 'Front-end' | 'Back-end' | 'Outils'
  name: string
  icon?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const SkillSchema = new Schema<ISkill>({
  category: { 
    type: String, 
    required: true,
    enum: ['Front-end', 'Back-end', 'Outils']
  },
  name: { type: String, required: true },
  icon: String,
  description: String,
}, { timestamps: true })

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema)


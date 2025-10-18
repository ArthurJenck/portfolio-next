import mongoose, { Schema, Document } from 'mongoose'

export interface ITech extends Document {
  title: string
  icon?: string
  activeIcon?: string
  inactiveIcon?: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const TechSchema = new Schema<ITech>({
  title: { type: String, required: true },
  icon: String,
  activeIcon: String,
  inactiveIcon: String,
  order: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Tech || mongoose.model<ITech>('Tech', TechSchema)


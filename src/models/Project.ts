import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProject extends Document {
  name: string
  date: Date
  description: string
  technologies: Types.ObjectId[]
  githubLink?: string
  webLink?: string
  images: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  technologies: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
  githubLink: String,
  webLink: String,
  images: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
}, { timestamps: true })

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)


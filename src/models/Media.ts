import mongoose, { Schema, Document } from 'mongoose'

export interface IMedia extends Document {
  url: string
  filename: string
  alt?: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

const MediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  alt: String,
  mimeType: { type: String, required: true },
  filesize: { type: Number, required: true },
  width: Number,
  height: Number,
}, { timestamps: true })

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)


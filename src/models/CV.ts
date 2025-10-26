import mongoose, { Schema, Document } from 'mongoose'

export interface ICV extends Document {
    url: string
    fileName: string
    customName: string
    uploadedAt: Date
}

const CVSchema = new Schema<ICV>(
    {
        url: { type: String, required: true },
        fileName: { type: String, required: true },
        customName: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
)

export default mongoose.models.CV || mongoose.model<ICV>('CV', CVSchema)

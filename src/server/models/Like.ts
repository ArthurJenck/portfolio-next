import mongoose, { Schema, Document } from 'mongoose'

export interface ILike extends Document {
    count: number
}

const LikeSchema = new Schema<ILike>({
    count: { type: Number, required: true, default: 0 },
})

export default mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema)

import mongoose, { Schema, Document } from 'mongoose'

export interface IContactLink extends Document {
    href: string
    display_text: string
    copy_text: string
    order: number
    createdAt: Date
    updatedAt: Date
}

const ContactLinkSchema = new Schema<IContactLink>(
    {
        href: { type: String, required: true },
        display_text: { type: String, required: true },
        copy_text: { type: String, required: true },
        order: { type: Number, required: true, default: 0 },
    },
    { timestamps: true },
)

ContactLinkSchema.index({ order: 1 })

export default mongoose.models.ContactLink || mongoose.model<IContactLink>('ContactLink', ContactLinkSchema)

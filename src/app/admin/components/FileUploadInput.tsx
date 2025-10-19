'use client'

import { useInput } from 'react-admin'
import { useState } from 'react'

interface FileUploadInputProps {
    source: string
    label: string
    required?: boolean
}

export const FileUploadInput = ({ source, label, required = false }: FileUploadInputProps) => {
    const { field } = useInput({ source })
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                field.onChange(data.url)
            }
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <label>
                <strong>
                    {label}
                    {required && ' *'}
                </strong>
            </label>
            <br />
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <p>Upload en cours...</p>}
            {field.value && (
                <div style={{ marginTop: '10px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={field.value} alt="Preview" style={{ maxWidth: '200px', border: '1px solid #ccc' }} />
                </div>
            )}
            <input type="hidden" {...field} />
        </div>
    )
}

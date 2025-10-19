'use client'

import { useInput } from 'react-admin'
import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface FileUploadInputProps {
    source: string
    label: string
    required?: boolean
    accept?: string
}

export const FileUploadInput = ({ source, label, required = false, accept = 'image/*' }: FileUploadInputProps) => {
    const { field } = useInput({ source })
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadFile = async (file: File) => {
        setUploading(true)
        setError(null)

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
            } else {
                setError("Erreur lors de l'upload")
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError("Erreur lors de l'upload")
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        await uploadFile(file)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            await uploadFile(file)
        }
    }

    const handleRemove = () => {
        field.onChange(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="my-4">
            <label className="block text-sm font-medium mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {!field.value ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                        isDragging
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center gap-3">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Upload en cours...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Glissez-déposez un fichier ici ou
                                    </p>
                                    <button
                                        type="button"
                                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        Choisir un fichier
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                            {field.value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Fichier uploadé</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{field.value}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Supprimer"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <input type="hidden" {...field} />
        </div>
    )
}

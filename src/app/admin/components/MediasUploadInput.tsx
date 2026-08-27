'use client'

import { useInput } from 'react-admin'
import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Video, GripVertical, Smartphone } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const DRAG_OPACITY = 0.5

interface MediasUploadInputProps {
    source: string
    label: string
    required?: boolean
    accept?: string
    helperText?: string
}

interface Media {
    url: string
    type: 'image' | 'video'
    mobileUrl?: string
}

interface SortableMediaItemProps {
    media: Media
    index: number
    onRemove: (index: number) => void
    onAddMobileUrl: (index: number, url: string) => void
    onRemoveMobileUrl: (index: number) => void
}

const SortableMediaItem = ({ media, index, onRemove, onAddMobileUrl, onRemoveMobileUrl }: SortableMediaItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `media-${index}`,
    })
    const [uploadingMobile, setUploadingMobile] = useState(false)
    const mobileInputRef = useRef<HTMLInputElement>(null)

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? DRAG_OPACITY : 1,
    }

    const isImage = media.type === 'image'
    const isVideo = media.type === 'video'

    const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingMobile(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch('/api/upload', { method: 'POST', body: formData })
            if (response.ok) {
                const data = await response.json()
                onAddMobileUrl(index, data.url)
            }
        } finally {
            setUploadingMobile(false)
            if (mobileInputRef.current) mobileInputRef.current.value = ''
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
        >
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                    {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : isVideo ? (
                        <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {isVideo && <Video className="w-4 h-4 text-purple-500" />}
                        {isImage && <ImageIcon className="w-4 h-4 text-blue-500" />}
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {media.type === 'image' ? 'Image' : 'Vidéo'}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all mb-3">{media.url}</p>

                    {/* Mobile variant */}
                    {media.mobileUrl ? (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <Smartphone className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={media.mobileUrl} alt="Mobile preview" className="w-10 h-10 object-cover rounded" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all flex-1 min-w-0">{media.mobileUrl}</p>
                            <button
                                type="button"
                                onClick={() => onRemoveMobileUrl(index)}
                                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title="Supprimer variante mobile"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={uploadingMobile}
                            onClick={() => mobileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
                        >
                            {uploadingMobile ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Smartphone className="w-3 h-3" />
                            )}
                            {uploadingMobile ? 'Upload...' : 'Ajouter variante mobile'}
                        </button>
                    )}
                    <input
                        ref={mobileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMobileFileChange}
                        className="hidden"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Supprimer"
                >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        </div>
    )
}

export const MediasUploadInput = ({
    source,
    label,
    required = false,
    accept = 'image/*,video/*',
    helperText,
}: MediasUploadInputProps) => {
    const { field } = useInput({ source })
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const medias: Media[] = field.value || []
    const mediasRef = useRef<Media[]>(medias)
    mediasRef.current = medias

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const detectMediaType = (url: string, fileType?: string): 'image' | 'video' => {
        if (fileType?.startsWith('video/')) return 'video'
        if (fileType?.startsWith('image/')) return 'image'

        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        const lowerUrl = url.toLowerCase()
        return videoExtensions.some((ext) => lowerUrl.includes(ext)) ? 'video' : 'image'
    }

    const uploadFile = async (file: File): Promise<Media> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`)
        }

        const data = await response.json()
        return {
            url: data.url,
            type: detectMediaType(data.url, file.type),
        }
    }

    const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return

        setUploading(true)
        setError(null)

        try {
            const results = await Promise.allSettled(files.map(uploadFile))
            const uploadedMedias = results
                .filter((result): result is PromiseFulfilledResult<Media> => result.status === 'fulfilled')
                .map((result) => result.value)

            if (uploadedMedias.length > 0) {
                field.onChange([...mediasRef.current, ...uploadedMedias])
            }

            const failedUploads = results.length - uploadedMedias.length
            if (failedUploads > 0) {
                setError(
                    failedUploads === 1
                        ? "Un fichier n'a pas pu être uploadé"
                        : `${failedUploads} fichiers n'ont pas pu être uploadés`,
                )
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError("Erreur lors de l'upload")
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        await uploadFiles(Array.from(files))

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
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

        const files = e.dataTransfer.files
        if (files.length > 0) {
            await uploadFiles(Array.from(files))
        }
    }

    const handleRemove = (index: number) => {
        const newMedias = medias.filter((_, i) => i !== index)
        field.onChange(newMedias)
    }

    const handleAddMobileUrl = (index: number, url: string) => {
        const newMedias = medias.map((m, i) => (i === index ? { ...m, mobileUrl: url } : m))
        field.onChange(newMedias)
    }

    const handleRemoveMobileUrl = (index: number) => {
        const newMedias = medias.map((m, i) => {
            if (i !== index) return m
            return { url: m.url, type: m.type }
        })
        field.onChange(newMedias)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = parseInt(active.id.toString().replace('media-', ''))
            const newIndex = parseInt(over.id.toString().replace('media-', ''))

            const newMedias = arrayMove(medias, oldIndex, newIndex)
            field.onChange(newMedias)
        }
    }

    return (
        <div className="my-4">
            <label className="block text-sm font-medium mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Upload zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all mb-4 ${
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
                                    Glissez-déposez des fichiers ici ou
                                </p>
                                <button
                                    type="button"
                                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        fileInputRef.current?.click()
                                    }}
                                >
                                    Choisir des fichiers
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
                    multiple
                />
            </div>

            {/* List of medias */}
            {medias.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={medias.map((_, i) => `media-${i}`)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {medias.map((media, index) => (
                                <SortableMediaItem
                                    key={`media-${index}`}
                                    media={media}
                                    index={index}
                                    onRemove={handleRemove}
                                    onAddMobileUrl={handleAddMobileUrl}
                                    onRemoveMobileUrl={handleRemoveMobileUrl}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            {helperText && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>}

            <input type="hidden" {...field} />
        </div>
    )
}

'use client'

import { useInput } from 'react-admin'
import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Video, GripVertical } from 'lucide-react'
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
}

interface SortableMediaItemProps {
    media: Media
    index: number
    onRemove: (index: number) => void
}

const SortableMediaItem = ({ media, index, onRemove }: SortableMediaItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `media-${index}`,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const isImage = media.type === 'image'
    const isVideo = media.type === 'video'

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
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{media.url}</p>
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const detectMediaType = (url: string): 'image' | 'video' => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        const lowerUrl = url.toLowerCase()
        return videoExtensions.some((ext) => lowerUrl.includes(ext)) ? 'video' : 'image'
    }

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
                const newMedia: Media = {
                    url: data.url,
                    type: detectMediaType(data.url),
                }
                field.onChange([...medias, newMedia])
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
        const files = e.target.files
        if (!files || files.length === 0) return

        for (let i = 0; i < files.length; i++) {
            await uploadFile(files[i])
        }

        // Reset input
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
            for (let i = 0; i < files.length; i++) {
                await uploadFile(files[i])
            }
        }
    }

    const handleRemove = (index: number) => {
        const newMedias = medias.filter((_, i) => i !== index)
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

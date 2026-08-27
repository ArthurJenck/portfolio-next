'use client'

import { useInput } from 'react-admin'
import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Loader2, Music as MusicIcon } from 'lucide-react'
import { detectKey, noteNameFromRootOffset } from '@/lib/audio/detectKey'
import { SEMITONES_PER_OCTAVE } from '@/lib/audio/audio.config'

interface MusicUploadInputProps {
    source: string
    label: string
    accept?: string
    helperText?: string
}

interface ProjectMusicValue {
    url: string
    label?: string
    startAt?: number
    volume?: number
    rootOffset?: number
    creditUrl?: string
}

const ROOT_OFFSET_OPTIONS = Array.from({ length: SEMITONES_PER_OCTAVE }, (_, i) => i - SEMITONES_PER_OCTAVE / 2)

export const MusicUploadInput = ({ source, label, accept = 'audio/mpeg,audio/mp4,audio/*', helperText }: MusicUploadInputProps) => {
    const { field } = useInput({ source })
    const value = field.value as ProjectMusicValue | undefined
    const [uploading, setUploading] = useState(false)
    const [detecting, setDetecting] = useState(false)
    const [autoDetected, setAutoDetected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const update = (patch: Partial<ProjectMusicValue>) => {
        field.onChange({ ...(value ?? { url: '' }), ...patch })
    }

    const uploadFile = async (file: File) => {
        setUploading(true)
        setError(null)
        setAutoDetected(false)

        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch('/api/upload', { method: 'POST', body: formData })

            if (!response.ok) {
                setError("Erreur lors de l'upload")
                return
            }

            const data = await response.json()
            // Thread manuellement l'objet plutôt que de relire `value` : deux appels à
            // field.onChange dans la même fonction ne se voient pas re-render entre eux,
            // le second écraserait le premier avec l'ancienne valeur fermée par la closure.
            let next: ProjectMusicValue = { ...value, url: data.url }
            field.onChange(next)
            setUploading(false)

            // La détection ne bloque jamais l'upload : en cas d'échec le champ reste vide,
            // corrigeable à la main.
            setDetecting(true)
            const detected = await detectKey(file)
            if (detected) {
                next = { ...next, rootOffset: detected.rootOffset }
                field.onChange(next)
                setAutoDetected(true)
            }
        } catch (err) {
            console.error('Music upload error:', err)
            setError("Erreur lors de l'upload")
        } finally {
            setUploading(false)
            setDetecting(false)
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
        if (file) await uploadFile(file)
    }

    const handleRemove = () => {
        field.onChange(undefined)
        setAutoDetected(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const inputClass =
        'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

    return (
        <div className="my-4">
            <label className="block text-sm font-medium mb-2">{label}</label>

            {!value?.url ? (
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
                                        Glissez-déposez un mp3 ici ou
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
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <MusicIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Piste uploadée</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{value.url}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Retirer la musique"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                            Titre affiché (crédit, optionnel)
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Laisser vide pour une ambiance sans crédit (ex : Le Lac de Ronart)"
                            value={value.label ?? ''}
                            onChange={(e) => update({ label: e.target.value === '' ? undefined : e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                Démarrer à (secondes, décimales acceptées)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                className={inputClass}
                                placeholder="12.5"
                                value={value.startAt ?? ''}
                                onChange={(e) => update({ startAt: e.target.value === '' ? undefined : Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                Volume (0 à 1)
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.05}
                                className={inputClass}
                                placeholder="0.5"
                                value={value.volume ?? ''}
                                onChange={(e) => update({ volume: e.target.value === '' ? undefined : Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                            Tonalité (accorde les SFX de micro-interaction sur le morceau)
                        </label>
                        <select
                            className={inputClass}
                            value={value.rootOffset ?? ''}
                            onChange={(e) => {
                                setAutoDetected(false)
                                update({ rootOffset: e.target.value === '' ? undefined : Number(e.target.value) })
                            }}
                        >
                            <option value="">Aucune (SFX figés sur la dernière racine du drone)</option>
                            {ROOT_OFFSET_OPTIONS.map((offset) => (
                                <option key={offset} value={offset}>
                                    {noteNameFromRootOffset(offset)}
                                </option>
                            ))}
                        </select>
                        {detecting && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Détection de la tonalité...
                            </p>
                        )}
                        {autoDetected && !detecting && (
                            <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                                Détectée automatiquement — à corriger d&apos;oreille si besoin.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {helperText && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>}
        </div>
    )
}

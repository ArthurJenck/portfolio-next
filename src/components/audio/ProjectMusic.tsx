'use client'

import { useEffect } from 'react'
import { useAmbientAudio } from '@/providers/ambient-audio-context'
import type { ProjectMusic as ProjectMusicType } from '@/types/ProjectTypes'

// Rien n'est rendu : ce composant arme/désarme la piste du projet auprès du moteur
// audio. Posé dès le montage — avant tout geste utilisateur — pour qu'un deep-link
// direct sur la page arme la piste avant même que le son ne démarre (cf. boot() dans
// AudioProvider).
const ProjectMusic = ({ music }: { music?: ProjectMusicType }) => {
    const { setTrack } = useAmbientAudio()

    useEffect(() => {
        if (!music) return
        setTrack(music)
        return () => setTrack(null)
    }, [music, setTrack])

    return null
}

export default ProjectMusic

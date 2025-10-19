import { useEffect, useRef } from 'react'

type SomeFunction = (...args: unknown[]) => void
type Timer = ReturnType<typeof setTimeout>

export const useDebounce = <Func extends SomeFunction>(func: Func, delay = 500) => {
    const timer = useRef<Timer | undefined>(undefined)

    // On regarde l'état du timer pour savoir si on peut relancer la fonction
    useEffect(() => {
        return () => {
            if (!timer.current) return
            clearTimeout(timer.current)
        }
    }, [])

    // On exécute la fonction si le timer est écoulé et on le relance
    const debouncedFunction = ((...args) => {
        const newTimer = setTimeout(() => {
            func(...args)
        }, delay)
        clearTimeout(timer.current)
        timer.current = newTimer
    }) as Func

    return debouncedFunction
}

import { useEffect, useRef } from "react"

export const scrollTo = (value: number) => {
    // On scroll vers la valeur Y transmise en props
    window.scrollTo({ top: value, behavior: "smooth" })
    // "Nettoyer" l'url affichée lors du scroll to top pour ne garder que le nom de domaine
    if (value === 0) {
        history.pushState(
            "",
            document.title,
            window.location.pathname + window.location.search
        )
    }
    return true
}

export const isMobileDevice = () => {
    // On regarde si le userAgent correspond à un téléphone ou une tablette
    if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true
    } else {
        return false
    }
}

type SomeFunction = (...args: any[]) => void
type Timer = ReturnType<typeof setTimeout>

export const useDebounce = <Func extends SomeFunction>(
    func: Func,
    delay = 500
) => {
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

export function useIsMounted() {
    // Par défaut, on considère le composant comme non rendu
    const isMounted = useRef(false)

    // Si le ref détecte un composant, alors on le considère comme rendu
    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    return isMounted
}

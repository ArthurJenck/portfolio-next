export const useScroll = () => {
    const scrollTo = (value: number) => {
        // On scroll vers la valeur Y transmise en props
        window.scrollTo({ top: value, behavior: "smooth" })

        // "Nettoyer" l'url affichée lors du scroll to top pour ne garder que le nom de domaine
        if (value === 0) {
            history.pushState(
                null,
                "",
                window.location.pathname + window.location.search
            )
        }

        // Dispatcher plusieurs events pendant et après le smooth scroll
        // pour une détection plus réactive
        const dispatchEvent = () => {
            const event = new CustomEvent("scrollToComplete")
            window.dispatchEvent(event)
        }

        // Dispatcher à plusieurs moments pour capturer le changement de section
        setTimeout(dispatchEvent, 100) // Pendant le scroll
        setTimeout(dispatchEvent, 250) // Vers la fin
        setTimeout(dispatchEvent, 400) // Après le scroll

        return true
    }

    return scrollTo
}

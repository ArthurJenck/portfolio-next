export const useScroll = () => {
    const scrollTo = (value: number) => {
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

    return scrollTo
}

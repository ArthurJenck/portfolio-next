const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex-1 flex flex-col justify-center items-center pt-16 md:pt-[calc(24px+5vw)]">
            {children}
        </main>
    )
}

export default Layout

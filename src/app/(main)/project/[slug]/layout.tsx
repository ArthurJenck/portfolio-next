const Layout = ({ children }: { children: React.ReactNode }) => {
    return <main className="flex-1 pt-32 flex justify-center md:pt-[calc(12px+2.5vw)]">{children}</main>
}

export default Layout

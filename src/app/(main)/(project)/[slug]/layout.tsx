const Layout = ({ children }: { children: React.ReactNode }) => {
    return <main className="flex-1 flex justify-center pt-10 md:pt-[calc(12px+2.5vw)]">{children}</main>
}

export default Layout

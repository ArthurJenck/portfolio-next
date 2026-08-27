const DottedBackground = () => {
    return (
        <div
            className="fixed inset-0 h-svh -z-10 top-svh"
            style={{
                background: 'var(--primary)',
                backgroundImage: 'radial-gradient(circle, rgba(175, 175, 175, 0.2) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0',
            }}
        />
    )
}

export default DottedBackground

import { getPublicCv } from '@/lib/public-content'

const CV = async () => {
    const cv = await getPublicCv()

    if (!cv) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100dvh',
                    fontFamily: 'system-ui',
                }}
            >
                CV introuvable
            </div>
        )
    }

    return (
        // Le zoom n'a pas besoin d'être au-dessus de 25%
        <iframe
            src={cv.url}
            width={'100%'}
            height={'100%'}
            style={{ width: '100%', height: '100dvh', border: 'none' }}
        />
    )
}

export default CV

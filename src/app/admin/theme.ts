import { defaultTheme, defaultDarkTheme } from 'react-admin'

// Thème sombre (par défaut) - utilise les couleurs du portfolio
export const darkTheme = {
    ...defaultDarkTheme,
    palette: {
        ...defaultDarkTheme.palette,
        mode: 'dark' as const,
        primary: {
            main: '#714e97', // accent color du portfolio
            light: '#8d6aac',
            dark: '#5a3e79',
        },
        secondary: {
            main: '#fdfdfe', // white du portfolio
            light: '#ffffff',
            dark: '#e5e5e6',
        },
        background: {
            default: '#110f1e', // primary color du portfolio
            paper: '#2c253e', // secondary color du portfolio
        },
        text: {
            primary: '#fdfdfe',
            secondary: 'rgba(253, 253, 254, 0.7)',
        },
        action: {
            hover: 'rgba(113, 78, 151, 0.08)',
            selected: 'rgba(113, 78, 151, 0.16)',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        ...defaultDarkTheme.components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2c253e',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(113, 78, 151, 0.2)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(113, 78, 151, 0.15)',
                },
            },
        },
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.RaMenuItemLink-active': {
                        backgroundColor: 'rgba(113, 78, 151, 0.16)',
                        color: '#714e97',
                    },
                },
            },
        },
    },
}

// Thème clair
export const lightTheme = {
    ...defaultTheme,
    palette: {
        ...defaultTheme.palette,
        mode: 'light' as const,
        primary: {
            main: '#714e97', // accent color du portfolio
            light: '#8d6aac',
            dark: '#5a3e79',
        },
        secondary: {
            main: '#110f1e',
            light: '#2c253e',
            dark: '#0a0812',
        },
        background: {
            default: '#f5f5f7',
            paper: '#ffffff',
        },
        text: {
            primary: '#110f1e',
            secondary: 'rgba(17, 15, 30, 0.7)',
        },
        action: {
            hover: 'rgba(113, 78, 151, 0.08)',
            selected: 'rgba(113, 78, 151, 0.16)',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        ...defaultTheme.components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                },
            },
        },
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.RaMenuItemLink-active': {
                        backgroundColor: 'rgba(113, 78, 151, 0.08)',
                        color: '#714e97',
                    },
                },
            },
        },
    },
}

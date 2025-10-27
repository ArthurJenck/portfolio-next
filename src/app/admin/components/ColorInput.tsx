'use client'
import { TextInput } from 'react-admin'
import { useWatch } from 'react-hook-form'
import { Box } from '@mui/material'

interface ColorInputProps {
    source: string
    label: string
    helperText?: string
}

export const ColorInput = ({ source, label, helperText }: ColorInputProps) => {
    const color = useWatch({ name: source })

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <TextInput source={source} label={label} helperText={helperText} placeholder="#f0f0f0" sx={{ flex: 1 }} />
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color || '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    flexShrink: 0,
                    marginTop: '8px',
                }}
            />
        </Box>
    )
}

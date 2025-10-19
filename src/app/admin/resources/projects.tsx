import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceArrayField,
    SingleFieldList,
    ChipField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    DateInput,
    ReferenceArrayInput,
    SelectArrayInput,
    required,
    useRecordContext,
    useRefresh,
    FunctionField,
    useInput,
} from 'react-admin'
import { useState } from 'react'

const ReorderButtons = () => {
    const record = useRecordContext()
    const refresh = useRefresh()

    const handleReorder = async (direction: 'up' | 'down') => {
        if (!record) return

        try {
            const response = await fetch('/api/projects/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: record.id,
                    direction,
                }),
            })

            if (response.ok) {
                refresh()
            }
        } catch (error) {
            console.error('Error reordering:', error)
        }
    }

    if (!record) return null

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleReorder('up')
                }}
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                }}
            >
                ↑
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleReorder('down')
                }}
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                }}
            >
                ↓
            </button>
        </div>
    )
}

const ImageUploadInput = ({ source }: { source: string }) => {
    const { field } = useInput({ source })
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                field.onChange(data.url)
            }
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <label>
                <strong>Image du projet *</strong>
            </label>
            <br />
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <p>Upload en cours...</p>}
            {field.value && (
                <div style={{ marginTop: '10px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={field.value} alt="Preview" style={{ maxWidth: '200px', border: '1px solid #ccc' }} />
                </div>
            )}
            <input type="hidden" {...field} />
        </div>
    )
}

export const ProjectList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <DateField source="date" label="Date" />
            <ReferenceArrayField source="stack" reference="skills" label="Stack">
                <SingleFieldList>
                    <ChipField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
            <TextField source="githubLink" label="GitHub" />
            <TextField source="webLink" label="Site Web" />
            <FunctionField label="Ordre" render={() => <ReorderButtons />} />
        </Datagrid>
    </List>
)

export const ProjectEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom du projet" validate={required()} />
            <DateInput source="date" label="Date" validate={required()} />
            <TextInput
                source="summary"
                label="Résumé"
                multiline
                rows={2}
                validate={required()}
                helperText="Court résumé pour la liste"
            />
            <TextInput
                source="description"
                label="Description"
                multiline
                rows={4}
                validate={required()}
                helperText="Description détaillée pour la page du projet"
            />
            <ImageUploadInput source="image" />
            <ReferenceArrayInput source="stack" reference="skills" label="Stack">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Edit>
)

export const ProjectCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Nom du projet" validate={required()} />
            <DateInput source="date" label="Date" validate={required()} />
            <TextInput
                source="summary"
                label="Résumé"
                multiline
                rows={2}
                validate={required()}
                helperText="Court résumé pour la liste"
            />
            <TextInput
                source="description"
                label="Description"
                multiline
                rows={4}
                validate={required()}
                helperText="Description détaillée pour la page du projet"
            />
            <ImageUploadInput source="image" />
            <ReferenceArrayInput source="stack" reference="skills" label="Stack">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Create>
)

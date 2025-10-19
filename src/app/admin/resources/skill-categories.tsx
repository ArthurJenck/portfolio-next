import {
    List,
    Datagrid,
    TextField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    ReferenceArrayInput,
    SelectArrayInput,
    required,
    useRecordContext,
    useRefresh,
    FunctionField,
} from 'react-admin'

const ReorderButtons = () => {
    const record = useRecordContext()
    const refresh = useRefresh()

    const handleReorder = async (direction: 'up' | 'down') => {
        if (!record) return

        try {
            const response = await fetch('/api/skill-categories/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: record.id,
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

export const SkillCategoryList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="truncatedName" label="Nom tronqué" />
            <FunctionField label="Ordre" render={() => <ReorderButtons />} />
        </Datagrid>
    </List>
)

export const SkillCategoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom" validate={required()} />
            <TextInput
                source="truncatedName"
                label="Nom tronqué"
                validate={required()}
                helperText="Version courte pour mobile (ex: 'Front' pour 'Front-end')"
            />
            <ReferenceArrayInput source="skills" reference="skills" label="Compétences">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
        </SimpleForm>
    </Edit>
)

export const SkillCategoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Nom" validate={required()} />
            <TextInput
                source="truncatedName"
                label="Nom tronqué"
                validate={required()}
                helperText="Version courte pour mobile (ex: 'Front' pour 'Front-end')"
            />
            <ReferenceArrayInput source="skills" reference="skills" label="Compétences">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
)

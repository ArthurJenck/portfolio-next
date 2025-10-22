import { List, Datagrid, TextField, Edit, Create, SimpleForm, TextInput, required, FunctionField } from 'react-admin'
import { FileUploadInput } from '../components/FileUploadInput'
import { ReorderButtons } from '../components/ReorderButtons'

export const SkillList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="icon" label="Icône" />
            <FunctionField label="Ordre" render={() => <ReorderButtons resourceName="skills" />} />
        </Datagrid>
    </List>
)

export const SkillEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom de la compétence" validate={required()} />
            <FileUploadInput source="icon" label="Icône" required />
            <TextInput source="description" label="Description" multiline rows={3} />
        </SimpleForm>
    </Edit>
)

export const SkillCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Nom de la compétence" validate={required()} />
            <FileUploadInput source="icon" label="Icône" required />
            <TextInput source="description" label="Description" multiline rows={3} />
        </SimpleForm>
    </Create>
)

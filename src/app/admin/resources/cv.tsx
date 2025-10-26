import { List, Datagrid, TextField, DateField, Edit, Create, SimpleForm, TextInput, required } from 'react-admin'
import { CVUploadInput } from '../components/CVUploadInput'

export const CVList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="customName" label="Nom personnalisé" />
            <TextField source="fileName" label="Fichier original" />
            <DateField source="uploadedAt" label="Date d'upload" showTime />
            <TextField source="url" label="URL" />
        </Datagrid>
    </List>
)

export const CVEdit = () => (
    <Edit
        transform={(data) => ({
            ...data,
            uploadedAt: data.uploadedAt || new Date().toISOString(),
        })}
    >
        <SimpleForm>
            <TextInput
                source="customName"
                label="Nom personnalisé"
                validate={required()}
                helperText="Nom du fichier dans Vercel Blob (ex: CV_Arthur-Jenck)"
            />
            <CVUploadInput source="url" label="Fichier PDF du CV" customNameSource="customName" required />
            <TextInput source="fileName" label="Nom du fichier original" disabled />
            <DateField source="uploadedAt" label="Date d'upload" showTime />
        </SimpleForm>
    </Edit>
)

export const CVCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="customName"
                label="Nom personnalisé"
                validate={required()}
                helperText="Nom du fichier dans Vercel Blob (ex: CV_Arthur-Jenck)"
                defaultValue="CV_Arthur-Jenck"
            />
            <CVUploadInput source="url" label="Fichier PDF du CV" customNameSource="customName" required />
        </SimpleForm>
    </Create>
)

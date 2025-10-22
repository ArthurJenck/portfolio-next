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
    FunctionField,
} from 'react-admin'
import { ReorderButtons } from '../components/ReorderButtons'
import { FileUploadInput } from '../components/FileUploadInput'

export const ProjectList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="slug" label="Slug" />
            <DateField source="date" label="Date" />
            <ReferenceArrayField source="stack" reference="skills" label="Stack">
                <SingleFieldList>
                    <ChipField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
            <TextField source="githubLink" label="GitHub" />
            <TextField source="webLink" label="Site Web" />
            <FunctionField label="Ordre" render={() => <ReorderButtons resourceName="projects" />} />
        </Datagrid>
    </List>
)

export const ProjectEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom du projet" validate={required()} />
            <TextInput source="slug" label="Slug" disabled helperText="Généré automatiquement à partir du nom" />
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
            <FileUploadInput source="image" label="Image du projet" required />
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
            <FileUploadInput source="image" label="Image du projet" required />
            <ReferenceArrayInput source="stack" reference="skills" label="Stack">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Create>
)

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
    required,
} from 'react-admin'
import { FileUploadInput } from '../components/FileUploadInput'
import { MediasUploadInput } from '../components/MediasUploadInput'
import { ProjectSkillsInput } from '../components/ProjectSkillsInput'

export const ProjectList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="subtitle" label="Sous-titre" />
            <TextField source="slug" label="Slug" />
            <DateField source="date" label="Date" />
            <ReferenceArrayField source="stack" reference="skills" label="Stack">
                <SingleFieldList>
                    <ChipField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
            <TextField source="githubLink" label="GitHub" />
            <TextField source="webLink" label="Site Web" />
        </Datagrid>
    </List>
)

export const ProjectEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom du projet" validate={required()} />
            <TextInput source="subtitle" label="Sous-titre" />
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
            <FileUploadInput
                source="cover_image"
                label="Image de couverture"
                required
                helperText="Taille recommandée : 1440x810 pixels - Utilisée dans la liste des projets"
            />
            <MediasUploadInput
                source="medias"
                label="Médias du projet"
                accept="image/*,video/*"
                helperText="Images et vidéos affichées sur la page du projet (réordonnables par glisser-déposer)"
            />
            <ProjectSkillsInput source="stack" label="Stack technique" />
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Edit>
)

export const ProjectCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Nom du projet" validate={required()} />
            <TextInput source="subtitle" label="Sous-titre" />
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
            <FileUploadInput
                source="cover_image"
                label="Image de couverture"
                required
                helperText="Taille recommandée : 1440x810 pixels - Utilisée dans la liste des projets"
            />
            <MediasUploadInput
                source="medias"
                label="Médias du projet"
                accept="image/*,video/*"
                helperText="Images et vidéos affichées sur la page du projet (réordonnables par glisser-déposer)"
            />
            <ProjectSkillsInput source="stack" label="Stack technique" />
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Create>
)

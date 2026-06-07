import {
    List,
    Datagrid,
    TextField,
    DateField,
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
import { ColorInput } from '../components/ColorInput'

export const ProjectList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="subtitle" label="Sous-titre" />
            <TextField source="slug" label="Slug" />
            <DateField source="date" label="Date" />
        </Datagrid>
    </List>
)

export const ProjectEdit = () => (
    <Edit mutationMode="pessimistic">
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
                rows={6}
                validate={required()}
                helperText="Markdown pour la page projet : séparer les paragraphes par une ligne vide. Chaque paragraphe devient une colonne."
            />
            <ColorInput source="color" label="Couleur" helperText="Couleur d'accentuation du projet (ex: #f0f0f0)" />
            <FileUploadInput
                source="cover_image"
                label="Image de couverture"
                required
                helperText="Taille recommandée : 1440x810 pixels - Utilisée dans la liste des projets"
            />
            <FileUploadInput
                source="mobile_cover_image"
                label="Image de couverture (mobile)"
                helperText="Optionnel — variante portrait pour mobile (≤767px). Si absente, la cover desktop est utilisée."
            />
            <MediasUploadInput
                source="medias"
                label="Médias du projet"
                accept="image/*,video/*"
                helperText="Images et vidéos affichées sur la page du projet (réordonnables par glisser-déposer). Chaque image peut avoir une variante mobile optionnelle."
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
                rows={6}
                validate={required()}
                helperText="Markdown pour la page projet : séparer les paragraphes par une ligne vide. Chaque paragraphe devient une colonne."
            />
            <ColorInput source="color" label="Couleur" helperText="Couleur d'accentuation du projet (ex: #f0f0f0)" />
            <FileUploadInput
                source="cover_image"
                label="Image de couverture"
                required
                helperText="Taille recommandée : 1440x810 pixels - Utilisée dans la liste des projets"
            />
            <FileUploadInput
                source="mobile_cover_image"
                label="Image de couverture (mobile)"
                helperText="Optionnel — variante portrait pour mobile (≤767px). Si absente, la cover desktop est utilisée."
            />
            <MediasUploadInput
                source="medias"
                label="Médias du projet"
                accept="image/*,video/*"
                helperText="Images et vidéos affichées sur la page du projet (réordonnables par glisser-déposer). Chaque image peut avoir une variante mobile optionnelle."
            />
            <ProjectSkillsInput source="stack" label="Stack technique" />
            <TextInput source="githubLink" label="Lien GitHub" />
            <TextInput source="webLink" label="Lien du site web" />
        </SimpleForm>
    </Create>
)

import { List, Datagrid, TextField, Edit, Create, SimpleForm, TextInput, required, FunctionField } from 'react-admin'
import { ReorderButtons } from '../components/ReorderButtons'

export const ContactLinkList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="href" label="Lien" />
            <TextField source="display_text" label="Texte affiché" />
            <TextField source="copy_text" label="Texte copié" />
            <FunctionField label="Ordre" render={() => <ReorderButtons resourceName="contact-links" />} />
        </Datagrid>
    </List>
)

export const ContactLinkEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput
                source="href"
                label="Lien"
                validate={required()}
                helperText="URL ou lien (mailto:, tel:, https://)"
            />
            <TextInput
                source="display_text"
                label="Texte affiché"
                validate={required()}
                helperText="Texte visible sur le site"
            />
            <TextInput
                source="copy_text"
                label="Texte à copier"
                validate={required()}
                helperText="Texte copié dans le presse-papier"
            />
        </SimpleForm>
    </Edit>
)

export const ContactLinkCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="href"
                label="Lien"
                validate={required()}
                helperText="URL ou lien (mailto:, tel:, https://)"
            />
            <TextInput
                source="display_text"
                label="Texte affiché"
                validate={required()}
                helperText="Texte visible sur le site"
            />
            <TextInput
                source="copy_text"
                label="Texte à copier"
                validate={required()}
                helperText="Texte copié dans le presse-papier"
            />
        </SimpleForm>
    </Create>
)

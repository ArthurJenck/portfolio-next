import {
  List,
  Datagrid,
  TextField,
  UrlField,
  NumberField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  ImageField,
} from "react-admin"

export const MediaList = () => (
  <List>
    <Datagrid rowClick="edit">
      <ImageField source="url" label="Aperçu" />
      <TextField source="filename" label="Nom du fichier" />
      <TextField source="alt" label="Texte alternatif" />
      <NumberField source="filesize" label="Taille (bytes)" />
      <UrlField source="url" label="URL" />
    </Datagrid>
  </List>
)

export const MediaEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="filename" label="Nom du fichier" disabled />
      <TextInput source="url" label="URL" disabled />
      <TextInput source="alt" label="Texte alternatif" />
      <TextInput source="mimeType" label="Type MIME" disabled />
      <NumberField source="filesize" label="Taille (bytes)" />
      <ImageField source="url" label="Aperçu" />
    </SimpleForm>
  </Edit>
)

export const MediaCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="url"
        label="URL de l'image"
        helperText="Pour uploader une image, utilisez l'API /api/upload"
      />
      <TextInput source="filename" label="Nom du fichier" />
      <TextInput source="alt" label="Texte alternatif" />
      <TextInput
        source="mimeType"
        label="Type MIME"
        defaultValue="image/jpeg"
      />
      <NumberField source="filesize" label="Taille (bytes)" defaultValue={0} />
    </SimpleForm>
  </Create>
)

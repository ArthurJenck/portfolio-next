import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
} from "react-admin"

export const SkillList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="category" label="Catégorie" />
      <TextField source="name" label="Nom" />
      <TextField source="icon" label="Icône" />
    </Datagrid>
  </List>
)

export const SkillEdit = () => (
  <Edit>
    <SimpleForm>
      <SelectInput
        source="category"
        label="Catégorie"
        choices={[
          { id: "Front-end", name: "Front-end" },
          { id: "Back-end", name: "Back-end" },
          { id: "Outils", name: "Outils" },
        ]}
        validate={required()}
      />
      <TextInput
        source="name"
        label="Nom de la compétence"
        validate={required()}
      />
      <TextInput
        source="icon"
        label="Chemin de l'icône"
        helperText="/assets/icons/..."
      />
      <TextInput source="description" label="Description" multiline rows={3} />
    </SimpleForm>
  </Edit>
)

export const SkillCreate = () => (
  <Create>
    <SimpleForm>
      <SelectInput
        source="category"
        label="Catégorie"
        choices={[
          { id: "Front-end", name: "Front-end" },
          { id: "Back-end", name: "Back-end" },
          { id: "Outils", name: "Outils" },
        ]}
        validate={required()}
      />
      <TextInput
        source="name"
        label="Nom de la compétence"
        validate={required()}
      />
      <TextInput
        source="icon"
        label="Chemin de l'icône"
        helperText="/assets/icons/..."
      />
      <TextInput source="description" label="Description" multiline rows={3} />
    </SimpleForm>
  </Create>
)

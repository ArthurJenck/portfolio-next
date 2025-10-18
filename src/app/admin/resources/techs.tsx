import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
} from "react-admin"

export const TechList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Titre" />
      <NumberField source="order" label="Ordre" />
      <BooleanField source="active" label="Actif" />
      <TextField source="icon" label="Icône" />
    </Datagrid>
  </List>
)

export const TechEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput
        source="title"
        label="Titre de la technologie"
        validate={required()}
      />
      <TextInput source="icon" label="Icône" helperText="/assets/icons/..." />
      <TextInput
        source="activeIcon"
        label="Icône active"
        helperText="/assets/icons/..."
      />
      <TextInput
        source="inactiveIcon"
        label="Icône inactive"
        helperText="/assets/icons/..."
      />
      <NumberInput source="order" label="Ordre d'affichage" defaultValue={1} />
      <BooleanInput source="active" label="Actif" defaultValue={true} />
    </SimpleForm>
  </Edit>
)

export const TechCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="title"
        label="Titre de la technologie"
        validate={required()}
      />
      <TextInput source="icon" label="Icône" helperText="/assets/icons/..." />
      <TextInput
        source="activeIcon"
        label="Icône active"
        helperText="/assets/icons/..."
      />
      <TextInput
        source="inactiveIcon"
        label="Icône inactive"
        helperText="/assets/icons/..."
      />
      <NumberInput source="order" label="Ordre d'affichage" defaultValue={1} />
      <BooleanInput source="active" label="Actif" defaultValue={true} />
    </SimpleForm>
  </Create>
)

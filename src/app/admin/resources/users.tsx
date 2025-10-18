import {
  List,
  Datagrid,
  TextField,
  EmailField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  required,
  email,
} from "react-admin"

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <EmailField source="email" label="Email" />
      <TextField source="createdAt" label="Créé le" />
    </Datagrid>
  </List>
)

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput
        source="email"
        label="Email"
        validate={[required(), email()]}
      />
      <PasswordInput
        source="password"
        label="Nouveau mot de passe (laisser vide pour ne pas changer)"
      />
    </SimpleForm>
  </Edit>
)

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="email"
        label="Email"
        validate={[required(), email()]}
      />
      <PasswordInput
        source="password"
        label="Mot de passe"
        validate={required()}
      />
    </SimpleForm>
  </Create>
)

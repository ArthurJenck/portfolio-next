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
} from "react-admin"

export const ProjectList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="name" label="Nom" />
      <DateField source="date" label="Date" />
      <ReferenceArrayField
        source="technologies"
        reference="techs"
        label="Technologies"
      >
        <SingleFieldList>
          <ChipField source="title" />
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
      <DateInput source="date" label="Date" validate={required()} />
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={4}
        validate={required()}
      />
      <ReferenceArrayInput
        source="technologies"
        reference="techs"
        label="Technologies"
      >
        <SelectArrayInput optionText="title" />
      </ReferenceArrayInput>
      <TextInput source="githubLink" label="Lien GitHub" />
      <TextInput source="webLink" label="Lien du site web" />
      <ReferenceArrayInput source="images" reference="media" label="Images">
        <SelectArrayInput optionText="filename" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
)

export const ProjectCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Nom du projet" validate={required()} />
      <DateInput source="date" label="Date" validate={required()} />
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={4}
        validate={required()}
      />
      <ReferenceArrayInput
        source="technologies"
        reference="techs"
        label="Technologies"
      >
        <SelectArrayInput optionText="title" />
      </ReferenceArrayInput>
      <TextInput source="githubLink" label="Lien GitHub" />
      <TextInput source="webLink" label="Lien du site web" />
      <ReferenceArrayInput source="images" reference="media" label="Images">
        <SelectArrayInput optionText="filename" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
)

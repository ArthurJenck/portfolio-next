import { List, Datagrid, TextField, Edit, Create, SimpleForm, TextInput, required, FunctionField } from 'react-admin'
import { ReorderButtons } from '../components/ReorderButtons'
import { SkillCategorySkillsInput } from '../components/SkillCategorySkillsInput'

export const SkillCategoryList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Nom" />
            <TextField source="truncatedName" label="Nom tronqué" />
            <FunctionField label="Ordre" render={() => <ReorderButtons resourceName="skill-categories" />} />
        </Datagrid>
    </List>
)

export const SkillCategoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="name" label="Nom" validate={required()} />
            <TextInput
                source="truncatedName"
                label="Nom tronqué"
                validate={required()}
                helperText="Version courte pour mobile (ex: 'Front' pour 'Front-end')"
            />
            <SkillCategorySkillsInput source="skills" label="Compétences" />
        </SimpleForm>
    </Edit>
)

export const SkillCategoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Nom" validate={required()} />
            <TextInput
                source="truncatedName"
                label="Nom tronqué"
                validate={required()}
                helperText="Version courte pour mobile (ex: 'Front' pour 'Front-end')"
            />
            <SkillCategorySkillsInput source="skills" label="Compétences" />
        </SimpleForm>
    </Create>
)

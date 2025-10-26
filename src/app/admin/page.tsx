'use client'

import { useEffect, useState } from 'react'
import { Admin, Resource } from 'react-admin'
import { SessionProvider } from 'next-auth/react'
import dataProvider from './dataProvider'
import authProvider from './authProvider'
import { lightTheme, darkTheme } from './theme'
import './admin.css'

// Import des composants personnalisés
import { ProjectList, ProjectEdit, ProjectCreate } from './resources/projects'
import { SkillList, SkillEdit, SkillCreate } from './resources/skills'
import { SkillCategoryList, SkillCategoryEdit, SkillCategoryCreate } from './resources/skill-categories'
import { UserList, UserEdit, UserCreate } from './resources/users'
import { CVList, CVEdit, CVCreate } from './resources/cv'
import { ContactLinkList, ContactLinkEdit, ContactLinkCreate } from './resources/contact-links'
import { ProjectIcon, SkillIcon, SkillCategoryIcon, UserIcon, CVIcon, ContactLinkIcon } from './components/CustomIcons'

export default function AdminPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontFamily: 'system-ui',
                }}
            >
                Chargement de l'interface admin...
            </div>
        )
    }

    return (
        <SessionProvider>
            <Admin
                dataProvider={dataProvider}
                authProvider={authProvider}
                lightTheme={lightTheme}
                darkTheme={darkTheme}
                defaultTheme="dark"
            >
                <Resource
                    name="projects"
                    list={ProjectList}
                    edit={ProjectEdit}
                    create={ProjectCreate}
                    icon={ProjectIcon}
                    options={{ label: 'Projets' }}
                />
                <Resource
                    name="skill-categories"
                    list={SkillCategoryList}
                    edit={SkillCategoryEdit}
                    create={SkillCategoryCreate}
                    icon={SkillCategoryIcon}
                    options={{ label: 'Catégories de compétences' }}
                />
                <Resource
                    name="skills"
                    list={SkillList}
                    edit={SkillEdit}
                    create={SkillCreate}
                    icon={SkillIcon}
                    options={{ label: 'Compétences' }}
                />
                <Resource
                    name="users"
                    list={UserList}
                    edit={UserEdit}
                    create={UserCreate}
                    icon={UserIcon}
                    options={{ label: 'Utilisateurs' }}
                />
                <Resource
                    name="cv"
                    list={CVList}
                    edit={CVEdit}
                    create={CVCreate}
                    icon={CVIcon}
                    options={{ label: 'CV' }}
                />
                <Resource
                    name="contact-links"
                    list={ContactLinkList}
                    edit={ContactLinkEdit}
                    create={ContactLinkCreate}
                    icon={ContactLinkIcon}
                    options={{ label: 'Liens de contact' }}
                />
            </Admin>
        </SessionProvider>
    )
}

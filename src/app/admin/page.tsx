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
                    options={{ label: 'Projets' }}
                />
                <Resource
                    name="skill-categories"
                    list={SkillCategoryList}
                    edit={SkillCategoryEdit}
                    create={SkillCategoryCreate}
                    options={{ label: 'Catégories de compétences' }}
                />
                <Resource
                    name="skills"
                    list={SkillList}
                    edit={SkillEdit}
                    create={SkillCreate}
                    options={{ label: 'Compétences' }}
                />
                <Resource
                    name="users"
                    list={UserList}
                    edit={UserEdit}
                    create={UserCreate}
                    options={{ label: 'Utilisateurs' }}
                />
            </Admin>
        </SessionProvider>
    )
}

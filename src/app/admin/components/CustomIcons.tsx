'use client'

import { ComponentType } from 'react'
import {
    FolderOpen,
    Star,
    List,
    User,
    FileText,
    Link,
    Plus,
    Edit,
    Trash2,
    Eye,
    Save,
    X,
    Menu,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    LucideProps,
} from 'lucide-react'

// Wrapper pour rendre les icônes Lucide compatibles avec react-admin
const createLucideIcon = (Icon: ComponentType<LucideProps>) => {
    const IconComponent = (props: LucideProps) => <Icon {...props} size={20} />
    IconComponent.displayName = `Lucide${Icon.displayName || Icon.name}`
    return IconComponent
}

// Exporter les icônes pour react-admin
export const ProjectIcon = createLucideIcon(FolderOpen)
export const SkillIcon = createLucideIcon(Star)
export const SkillCategoryIcon = createLucideIcon(List)
export const UserIcon = createLucideIcon(User)
export const CVIcon = createLucideIcon(FileText)
export const ContactLinkIcon = createLucideIcon(Link)

// Icônes d'actions
export const AddIcon = createLucideIcon(Plus)
export const EditIcon = createLucideIcon(Edit)
export const DeleteIcon = createLucideIcon(Trash2)
export const ShowIcon = createLucideIcon(Eye)
export const SaveIcon = createLucideIcon(Save)
export const CancelIcon = createLucideIcon(X)

// Icônes de navigation
export const MenuIcon = createLucideIcon(Menu)
export const LogoutIcon = createLucideIcon(LogOut)
export const SettingsIcon = createLucideIcon(Settings)
export const ChevronLeftIcon = createLucideIcon(ChevronLeft)
export const ChevronRightIcon = createLucideIcon(ChevronRight)

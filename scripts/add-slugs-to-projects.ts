import connectDB from '../src/lib/mongodb'
import Project from '../src/models/Project'
import { generateSlug } from '../src/lib/utils'

async function addSlugsToProjects() {
    try {
        await connectDB()
        console.log('✅ Connecté à MongoDB')

        const projects = await Project.find({})
        console.log(`📦 ${projects.length} projet(s) trouvé(s)`)

        let updated = 0
        let skipped = 0

        for (const project of projects) {
            if (!project.slug) {
                const slug = generateSlug(project.name)

                // Vérifier si le slug existe déjà
                const existingProject = await Project.findOne({ slug, _id: { $ne: project._id } })

                if (existingProject) {
                    // Si le slug existe déjà, ajouter un suffixe
                    const timestamp = Date.now()
                    project.slug = `${slug}-${timestamp}`
                    console.log(`⚠️  Slug en conflit pour "${project.name}", utilisation de: ${project.slug}`)
                } else {
                    project.slug = slug
                    console.log(`✨ Ajout du slug "${slug}" pour "${project.name}"`)
                }

                await project.save()
                updated++
            } else {
                console.log(`⏭️  "${project.name}" a déjà un slug: ${project.slug}`)
                skipped++
            }
        }

        console.log('\n📊 Résumé:')
        console.log(`   ✅ ${updated} projet(s) mis à jour`)
        console.log(`   ⏭️  ${skipped} projet(s) ignoré(s)`)
        console.log('\n🎉 Migration terminée avec succès!')

        process.exit(0)
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error)
        process.exit(1)
    }
}

addSlugsToProjects()

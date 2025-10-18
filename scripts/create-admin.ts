import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import * as readline from "readline"
import dotenv from "dotenv"
import path from "path"

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function createAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI manquant dans .env.local")
    console.error(
      "   Assurez-vous d'avoir créé le fichier .env.local à la racine du projet"
    )
    console.error("   avec la variable MONGODB_URI=votre-connection-string")
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connecté à MongoDB")

    const email = await new Promise<string>((resolve) => {
      rl.question("Email admin: ", resolve)
    })

    const password = await new Promise<string>((resolve) => {
      rl.question("Password: ", resolve)
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    const UserSchema = new mongoose.Schema(
      {
        email: String,
        password: String,
      },
      { timestamps: true }
    )

    const User = mongoose.models.User || mongoose.model("User", UserSchema)

    await User.create({
      email,
      password: hashedPassword,
    })

    console.log("✅ Admin créé avec succès!")
    console.log(`   Email: ${email}`)
    console.log("   Vous pouvez maintenant vous connecter sur /admin")
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    rl.close()
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()

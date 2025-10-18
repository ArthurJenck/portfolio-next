import { mongooseAdapter } from "@payloadcms/db-mongodb"
import { slateEditor } from "@payloadcms/richtext-slate"
import path from "path"
import { buildConfig } from "payload"
import { fileURLToPath } from "url"

import { Users } from "./src/collections/Users"
import { Media } from "./src/collections/Media"
import { Projects } from "./src/collections/Projects"
import { Skills } from "./src/collections/Skills"
import { Techs } from "./src/collections/Techs"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: Users.slug,
    },
    collections: [Users, Media, Projects, Skills, Techs],
    editor: slateEditor({}),
    secret: process.env.PAYLOAD_SECRET || "",
    typescript: {
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },
    db: mongooseAdapter({
        url: process.env.MONGODB_URI || "",
    }),
})

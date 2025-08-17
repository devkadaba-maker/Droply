import {pgTable, text, uuid, integer, boolean, timestamp} from "drizzle-orm/pg-core"
import {relations} from "drizzle-orm"

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),


    // file and foler info
    name: text("name").notNull(), 
    path: text("path").notNull(), // /documents/project/resume.pdf
    size: integer("size").notNull(), 
    type: text("type").notNull(), //folder or file

    //storage info
    fileUrl : text("file_Url").notNull(), // url to access the file
    thumbnailUrl : text("thumbnail_Url"),
    //Ownership info
    userId: text("user_id").notNull(), 
    parentId: uuid("parent_id"), // Parent folder if null, root folder


    // file/folder flags
    isFolder: boolean("is_folder").notNull().default(false),
    isStarred: boolean("isStarred").notNull().default(false),
    isTrash: boolean("is_trash").notNull().default(false), 

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(), 
    updatedAt: timestamp("updated_at").defaultNow().notNull(),




})

/* 
parent: Each file/folder can have one parent folder
children: Each folder can have many child, files or folders
*/

export const filesRelations = relations(files, ({one, many}) => ({


    parent:one(files,{
        fields: [files.parentId],
        references: [files.id]
    }),
// relationship to chils files/folder
    children:many(files)
}))

//type def

export const File = typeof files.$inferSelect
export const NewFile = typeof files.$inferInsert
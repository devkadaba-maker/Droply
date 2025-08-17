import {auth} from "@clerk/nextjs/server"
import {db} from "@/lib/db"
import {files} from "@/lib/db/schema"
import {NextRequest} from "next/server"
import {NextResponse} from "next/server"


export async function POST(request: NextRequest){
    try{
        const {userId} = await auth()
    if(!userId){
            return NextResponse.json({error : "unauthorized"}, {status: 401})
        }
    //params request body
    const body  = await request.json()
    const {imagekit, userId: bodyUserId} = body

    if(bodyUserId!== userId){
        return NextResponse.json({error : "unauthorized"}, {status: 401})
    }
    if(!imagekit || !imagekit.url){
        return NextResponse.json({error : "Invalid file upload data"}, {status: 401})
    }

    const fileData = {
        name: imagekit.name || "Untitled",
        path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
        size: imagekit.size || 0,
        type: imagekit.fileType || "image",
        fileUrl: imagekit.url,
        thumbnailUrl: imagekit.thumbnailUrl || null,
        userId: userId,
        parentId: null, // Root level by default
        isFolder: false,
        isStarred: false,
        isTrash: false,
      };

      const [newFile] = await db.insert(files).values(fileData).returning()
    
      return NextResponse.json(newFile)

      return NextResponse.json({file: newFile}, {status: 200})

    }catch(error){
        return NextResponse.json({error: "failed to save info to db"}, {status: 500})

    

    }

}
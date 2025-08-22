// in app/api/imagekit-auth/route.ts

import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

// Initialize the ImageKit SDK with your credentials from environment variables
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function GET(request: NextRequest) {
    try {
        // This function generates the security token, signature, and expiry time
        const authenticationParameters = imagekit.getAuthenticationParameters();
        
        // Return the parameters as a JSON object
        return NextResponse.json(authenticationParameters);

    } catch (error) {
        console.error("Error generating ImageKit authentication parameters:", error);
        return NextResponse.json(
            { error: "Could not generate authentication parameters." },
            { status: 500 }
        );
    }
}
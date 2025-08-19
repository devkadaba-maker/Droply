import { ThemeProviderProps } from "next-themes";

export interface ProviderProps{
    children: React.ReactNode, 
    themeProps?: ThemeProviderProps
}
export function Providers({children, themeProps}: ProviderProps){
    return(
        <h1>
            {children}
        </h1>
    )
}
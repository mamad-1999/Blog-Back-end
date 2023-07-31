import { Types } from "mongoose"

export type IUser = {
    email: string
    password: string
    name?: string
    image?: string
    phone?: string
    biography?: string
    role: "user" | "admin" | "superAdmin"
    birthdayDate?: string
    gender?: string
    twitterProfile?: string
    linkedinProfile?: string  
    posts?: [Types.ObjectId]
}
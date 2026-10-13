import { api } from "@/settings/api";

type UploadProfilePictureDTO = {
    file: File
    role: string
    target_type: string
    object_id: string
}

export async function pingMedia() {
    return await api.v1.client.get(`/media/`)
}

export async function uploadProfilePicture(data: UploadProfilePictureDTO) {
    try {
        return await api.v1.client.post(`/media/`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    } catch (error) {
        throw error
    }
}
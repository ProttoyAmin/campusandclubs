import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/settings/api";
import { config } from "@/settings/app/config";
import { authKeys } from "@/features/auth/hooks/session.hook";

type KindUploadResponse = {
  id: string;
  file: { url: string; secure_url?: string; public_id?: string };
  role: string;
  original_file_name?: string;
};

/**
 * Upload a user avatar to the /api/v1/media/kind/ endpoint.
 * The backend attaches the uploaded Media to the current user and sets
 * role=avatar automatically (kind=user). Returns the created Media row.
 */
export function useAvatarUpload() {
  const qc = useQueryClient();
  return useMutation<KindUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("kind", "user");
      form.append("single_file", file);
      const { data } = await api.v1.client.post<KindUploadResponse>(
        config.api.v1.media.kindUpload,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      // The server wraps responses in { data: ... } via ApiResponse on most
      // endpoints but KindMediaUploadView returns the raw object. Normalize:
      const payload = (data as any).data ?? data;
      return payload as KindUploadResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.session });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}


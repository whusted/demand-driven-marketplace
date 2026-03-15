import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabaseAdmin;
}

export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  size: number,
  userId: string,
) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  if (size > MAX_IMAGE_SIZE) {
    throw new Error(`File too large: ${size} bytes (max ${MAX_IMAGE_SIZE})`);
  }

  const imageId = crypto.randomUUID();
  const ext = filename.split(".").pop() || "jpg";
  const path = `${userId}/${imageId}.${ext}`;

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin.storage
    .from("images")
    .createSignedUploadUrl(path);

  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  const publicUrl = getSupabaseAdmin().storage.from("images").getPublicUrl(path).data.publicUrl;

  return {
    uploadUrl: data.signedUrl,
    imageId,
    publicUrl,
    token: data.token,
  };
}

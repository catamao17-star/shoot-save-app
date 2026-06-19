import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';

const SESSION_VIDEOS_BUCKET = 'session-videos';

type UploadSessionVideoParams = {
  challengeId: string;
  role: 'shooter' | 'goalkeeper';
  localUri: string;
};

type UploadSessionVideoResult = {
  path: string;
};

function getExtensionFromUri(uri: string) {
  const cleanUri = uri.split('?')[0];
  const parts = cleanUri.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? 'mp4' : 'mp4';
}

function getMimeTypeFromExtension(ext: string) {
  switch (ext) {
    case 'mov':
      return 'video/quicktime';
    case 'm4v':
      return 'video/x-m4v';
    case 'webm':
      return 'video/webm';
    case 'mp4':
    default:
      return 'video/mp4';
  }
}

export async function pickVideoFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

export async function uploadSessionVideoToSupabase({
  challengeId,
  role,
  localUri,
}: UploadSessionVideoParams): Promise<UploadSessionVideoResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No authenticated user found.');
  }

  const ext = getExtensionFromUri(localUri);
  const mimeType = getMimeTypeFromExtension(ext);

  const file = new FileSystem.File(localUri);
  const arrayBuffer = await file.arrayBuffer();

  const fileName = `${role}-${challengeId}-${Date.now()}.${ext}`;
  const path = `${user.id}/${challengeId}/${fileName}`;

  const { error } = await supabase.storage
    .from(SESSION_VIDEOS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return { path };
}

export async function createSignedVideoUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SESSION_VIDEOS_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.signedUrl) {
    throw new Error('Signed URL not returned.');
  }

  return data.signedUrl;
}

export async function deleteSessionVideoFromSupabase(path: string): Promise<void> {
  const { error } = await supabase.storage.from(SESSION_VIDEOS_BUCKET).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
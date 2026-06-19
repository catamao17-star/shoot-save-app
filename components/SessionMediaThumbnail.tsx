import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer } from 'expo-video';
import { createSignedVideoUrl } from '../services/storageService';

type Props = {
  path?: string | null;
  emptyLabel: string;
};

export default function SessionMediaThumbnail({ path, emptyLabel }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [thumbnailSource, setThumbnailSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const player = useVideoPlayer(signedUrl ?? null, (instance) => {
    instance.loop = false;
    instance.muted = true;
  });

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      if (!path) {
        setSignedUrl(null);
        setThumbnailSource(null);
        return;
      }

      try {
        setIsLoading(true);

        const url = await createSignedVideoUrl(path, 3600);
        if (!isMounted) return;

        setSignedUrl(url);

        const thumbnails = await player.generateThumbnailsAsync([1]);
        if (!isMounted) return;

        setThumbnailSource(thumbnails?.[0] ?? null);
      } catch {
        if (isMounted) {
          setThumbnailSource(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadThumbnail();

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (!path) {
    return (
      <View style={[styles.box, styles.emptyBox]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.box, styles.loadingBox]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!thumbnailSource) {
    return (
      <View style={[styles.box, styles.emptyBox]}>
        <Text style={styles.emptyText}>Preview unavailable</Text>
      </View>
    );
  }

  return (
    <Image
      source={thumbnailSource}
      style={styles.image}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  box: {
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 96,
    borderRadius: 12,
    width: '100%',
  },
  emptyBox: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
});
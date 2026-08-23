import { Linking, Platform } from 'react-native';

export interface SpotifyTrackMeta {
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  spotifyUrl: string;
  spotifyUri: string;
}

export const spotifyService = {
  // Parse any pasted Spotify URL or URI
  parseSpotifyUrl(input: string): { trackId: string | null; isSpotify: boolean } {
    if (!input) return { trackId: null, isSpotify: false };
    
    // Match open.spotify.com/track/XXXXX
    const webMatch = input.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (webMatch && webMatch[1]) {
      return { trackId: webMatch[1], isSpotify: true };
    }

    // Match spotify:track:XXXXX
    const uriMatch = input.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (uriMatch && uriMatch[1]) {
      return { trackId: uriMatch[1], isSpotify: true };
    }

    return { trackId: null, isSpotify: false };
  },

  // Generate track metadata from title/artist or Spotify link
  createTrackMeta(title: string, artist: string, pastedUrl?: string): SpotifyTrackMeta {
    const parsed = pastedUrl ? this.parseSpotifyUrl(pastedUrl) : { trackId: null, isSpotify: false };
    const trackId = parsed.trackId || '4cOdK2wGLETKBW3PvgPWqT';

    const cleanTitle = title.trim() || 'Untitled Track';
    const cleanArtist = artist.trim() || 'Artist';

    const spotifyUrl = parsed.isSpotify && pastedUrl
      ? pastedUrl.split('?')[0]
      : `https://open.spotify.com/search/${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
    
    const spotifyUri = parsed.trackId ? `spotify:track:${parsed.trackId}` : `spotify:search:${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;

    // High quality album art placeholder with pastel tones
    const coverUrl = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80`;

    return {
      title: cleanTitle,
      artist: cleanArtist,
      album: 'Spotify Single',
      coverUrl,
      spotifyUrl,
      spotifyUri,
    };
  },

  // Open in Spotify app or fallback to web
  async openInSpotify(spotifyUrl?: string, spotifyUri?: string) {
    if (!spotifyUrl && !spotifyUri) return;

    const uri = spotifyUri || (spotifyUrl ? `spotify:track:${this.parseSpotifyUrl(spotifyUrl).trackId || ''}` : '');
    const webUrl = spotifyUrl || 'https://open.spotify.com';

    try {
      if (Platform.OS === 'web') {
        window.open(webUrl, '_blank');
        return;
      }

      if (uri) {
        const canOpenUri = await Linking.canOpenURL(uri);
        if (canOpenUri) {
          await Linking.openURL(uri);
          return;
        }
      }

      await Linking.openURL(webUrl);
    } catch (e) {
      if (webUrl) {
        await Linking.openURL(webUrl);
      }
    }
  },
};

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { MusicPin as MusicPinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';
import { useApp } from '../../context/AppContext';
import { spotifyService } from '../../services/spotifyService';

interface MusicPinProps {
  pin: MusicPinType;
  onPress?: () => void;
}

export const MusicPin: React.FC<MusicPinProps> = ({ pin, onPress }) => {
  const { currentlyPlayingAudioId, togglePlayAudio, audioProgress } = useApp();
  const isPlaying = currentlyPlayingAudioId === pin.id;

  const spotifyTrackId = pin.spotifyUrl
    ? spotifyService.parseSpotifyUrl(pin.spotifyUrl).trackId
    : null;

  return (
    <PaperCard
      pinId={pin.id}
      rotation={pin.rotation}
      paperTone="sky"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor || colors.tape.sky}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.musicContainer}
    >
      {/* Vinyl & Cover Header */}
      <View style={styles.topCardRow}>
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: pin.coverUrl }}
            style={styles.albumCover}
            resizeMode="cover"
          />
        </View>

        {/* Vinyl disc peek */}
        <View style={[styles.vinylDisc, isPlaying && styles.vinylSpinning]}>
          <View style={styles.vinylCenter} />
        </View>

        {/* Spotify badge */}
        <Pressable
          onPress={(e: any) => {
            e.stopPropagation?.();
            spotifyService.openInSpotify(pin.spotifyUrl, pin.spotifyUri);
          }}
          style={styles.spotifyBadge}
          hitSlop={8}
        >
          <Text style={styles.spotifyBadgeText}>Spotify</Text>
        </Pressable>
      </View>

      {/* Track Details */}
      <View style={styles.trackInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {pin.songTitle}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {pin.artist} {pin.album ? `· ${pin.album}` : ''}
        </Text>
      </View>

      {/* Spotify Embedded Web Preview Player if valid track ID */}
      {Platform.OS === 'web' && spotifyTrackId ? (
        <View style={styles.spotifyEmbedWrapper}>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: 10, border: 'none', width: '100%', height: 80 }}
          />
        </View>
      ) : (
        /* Interactive Player Controls */
        <View style={styles.playerBar}>
          <Pressable
            onPress={(e: any) => {
              e.stopPropagation?.();
              spotifyService.openInSpotify(pin.spotifyUrl, pin.spotifyUri);
            }}
            style={({ pressed }: { pressed: boolean }) => [styles.playBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.playBtnText}>{isPlaying ? 'pause' : 'play'}</Text>
          </Pressable>

          {/* Mini progress wave */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${isPlaying ? audioProgress * 100 : 0}%` },
              ]}
            />
          </View>

          {pin.duration && <Text style={styles.durationText}>{pin.duration}</Text>}
        </View>
      )}

      {/* Personal memory reflection */}
      {!!pin.personalMemoryNote && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>"{pin.personalMemoryNote}"</Text>
        </View>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  musicContainer: {
    padding: 14,
  },
  topCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  coverWrapper: {
    width: 76,
    height: 76,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#333',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  albumCover: {
    width: '100%',
    height: '100%',
  },
  vinylDisc: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1E1D1C',
    position: 'absolute',
    left: 45,
    top: 3,
    zIndex: 1,
    borderWidth: 3,
    borderColor: '#2A2825',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylSpinning: {
    transform: [{ rotate: '45deg' }],
  },
  vinylCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accents.sky,
    borderWidth: 2,
    borderColor: '#1E1D1C',
  },
  spotifyBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(29, 185, 84, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.25)',
  },
  spotifyBadgeText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#169C46',
    letterSpacing: 0.2,
  },
  trackInfo: {
    marginBottom: 10,
  },
  songTitle: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink.primary,
  },
  artistName: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  spotifyEmbedWrapper: {
    width: '100%',
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(100, 136, 178, 0.12)',
    padding: 6,
    borderRadius: 20,
  },
  playBtn: {
    minWidth: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.ink.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  playBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accents.sky,
  },
  durationText: {
    fontFamily: typography.families.mono,
    fontSize: 10,
    color: colors.ink.tertiary,
    marginRight: 4,
  },
  noteContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  noteText: {
    fontFamily: typography.families.handwritten,
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink.handwrittenFaded,
  },
});

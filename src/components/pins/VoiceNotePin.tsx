import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { VoiceNotePin as VoiceNotePinType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PaperCard } from '../common/PaperCard';
import { useApp } from '../../context/AppContext';
import { Play, Pause, Mic } from 'lucide-react-native';

interface VoiceNotePinProps {
  pin: VoiceNotePinType;
  onPress?: () => void;
}

export const VoiceNotePin: React.FC<VoiceNotePinProps> = ({ pin, onPress }) => {
  const { currentlyPlayingAudioId, togglePlayAudio, audioProgress } = useApp();
  const isPlaying = currentlyPlayingAudioId === pin.id;
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audioSource = pin.audioUrl || (pin as any).audioUri;

    if (isPlaying) {
      if (audioSource) {
        try {
          if (!audioElemRef.current) {
            audioElemRef.current = new Audio();
          }
          const audio = audioElemRef.current;
          audio.src = audioSource;
          audio.currentTime = 0;
          audio.volume = 1.0;

          audio.onended = () => {
            if (currentlyPlayingAudioId === pin.id) {
              togglePlayAudio(pin.id);
            }
          };

          audio.onerror = (e) => {
            console.warn('Audio playback error, using speech fallback:', e);
            speakTranscript();
          };

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Audio play notice, falling back to narration:', err);
              speakTranscript();
            });
          }
        } catch (e) {
          speakTranscript();
        }
      } else {
        speakTranscript();
      }
    } else {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
        audioElemRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
    };
  }, [isPlaying, pin.audioUrl, (pin as any).audioUri]);

  const speakTranscript = () => {
    const textToSpeak = pin.transcriptExcerpt || (pin as any).transcription || pin.title;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && textToSpeak) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        if (currentlyPlayingAudioId === pin.id) {
          togglePlayAudio(pin.id);
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <PaperCard
      rotation={pin.rotation}
      paperTone="lilac"
      tapeStyle={pin.tapeStyle || 'none'}
      tapeColor={pin.tapeColor || colors.tape.lavender}
      onPress={onPress}
      stickers={pin.stickers}
      style={styles.voiceContainer}
    >
      <View style={styles.headerRow}>
        <View style={styles.micBadge}>
          <Mic size={11} color={colors.brand.purpleDark} style={{ marginRight: 4 }} />
          <Text style={styles.micBadgeText}>voice memo</Text>
        </View>
        <Text style={styles.dateLabel}>{pin.recordedDate}</Text>
      </View>

      <Text style={styles.titleText}>{pin.title || 'Voice Note'}</Text>

      {/* Interactive Waveform Bar */}
      <View style={styles.waveformContainer}>
        <Pressable
          onPress={(e: any) => {
            e.stopPropagation?.();
            togglePlayAudio(pin.id, pin.durationSeconds);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.playBtn,
            isPlaying && styles.playBtnActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          {isPlaying ? (
            <Pause size={13} color="#FFFFFF" />
          ) : (
            <Play size={13} color="#FFFFFF" style={{ marginLeft: 2 }} />
          )}
          <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </Pressable>

        <View style={styles.barsRow}>
          {(pin.waveform && pin.waveform.length > 0
            ? pin.waveform
            : [0.3, 0.6, 0.8, 0.9, 0.6, 0.4, 0.7, 0.8, 0.5, 0.3]
          ).map((amp, index) => {
            const barProgress = index / (pin.waveform?.length || 10);
            const isPassed = isPlaying && barProgress <= audioProgress;
            const barHeight = Math.max(8, amp * 28);

            return (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: barHeight,
                    backgroundColor: isPassed
                      ? colors.brand.purple
                      : isPlaying
                      ? colors.ink.primary
                      : colors.ink.faded,
                  },
                ]}
              />
            );
          })}
        </View>

        <Text style={styles.secondsText}>{pin.durationSeconds || 27}s</Text>
      </View>

      {Boolean(pin.transcriptExcerpt) && (
        <Text style={styles.transcriptText}>{pin.transcriptExcerpt}</Text>
      )}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  voiceContainer: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  micBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
  },
  micBadgeText: {
    fontFamily: typography.families.sans,
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.brand.purpleDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
  },
  titleText: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(152, 132, 186, 0.08)',
    padding: 8,
    borderRadius: 12,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.purple,
    paddingHorizontal: 10,
  },
  playBtnActive: {
    backgroundColor: '#1E1B24',
  },
  playBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    height: 30,
  },
  waveformBar: {
    flex: 1,
    borderRadius: 2,
  },
  secondsText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    fontWeight: '600',
  },
  transcriptText: {
    fontFamily: typography.families.serif,
    fontSize: 13,
    color: colors.ink.secondary,
    marginTop: 10,
    lineHeight: 18,
  },
});

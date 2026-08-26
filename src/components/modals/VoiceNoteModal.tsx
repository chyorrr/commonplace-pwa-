import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ChevronLeft, Square, Play, Pause, Mic, Check, FileText, ListTodo, Sparkles, Volume2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { speechAudioService } from '../../services/speechAndAudio';

interface VoiceNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VoiceNoteModal: React.FC<VoiceNoteModalProps> = ({ visible, onClose }) => {
  const { addPin, addToDesk, activeBoardId } = useApp();
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveWaveform, setLiveWaveform] = useState<number[]>([0.2, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRecording(true);
      setSeconds(0);
      setTranscript('');
      setLiveWaveform([0.2, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3]);
      setRecordedAudioUrl(undefined);
      setIsPlayingAudio(false);
      setIsEditingTranscript(false);

      speechAudioService.startRecording(
        (text) => {
          if (text) {
            setTranscript(text);
          }
        },
        (wf) => {
          if (wf && wf.length > 0) {
            setLiveWaveform(wf.slice(-26));
          }
        },
        (sec) => {
          setSeconds(sec);
        }
      );
    } else {
      speechAudioService.stopRecording(transcript);
      speechAudioService.stopAudio();
      setIsPlayingAudio(false);
    }

    return () => {
      speechAudioService.stopRecording('');
      speechAudioService.stopAudio();
    };
  }, [visible]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      const res = await speechAudioService.stopRecording(transcript);
      if (res.audioUrl) {
        setRecordedAudioUrl(res.audioUrl);
      }
      if (res.waveform) {
        setLiveWaveform(res.waveform);
      }
      if (res.transcript && !transcript) {
        setTranscript(res.transcript);
      }
    } else {
      setIsRecording(true);
      speechAudioService.stopAudio();
      setIsPlayingAudio(false);
      speechAudioService.startRecording(
        (text) => text && setTranscript(text),
        (wf) => wf && setLiveWaveform(wf.slice(-26)),
        (sec) => setSeconds(sec)
      );
    }
  };

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      speechAudioService.stopAudio();
      setIsPlayingAudio(false);
    } else if (recordedAudioUrl) {
      setIsPlayingAudio(true);
      speechAudioService.playAudio(recordedAudioUrl, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleKeepAsAudio = async () => {
    let finalAudioUrl = recordedAudioUrl;
    let finalWaveform = liveWaveform;
    let finalDuration = Math.max(1, seconds);
    let finalTranscript = transcript.trim();

    if (isRecording) {
      const res = await speechAudioService.stopRecording(transcript);
      finalAudioUrl = res.audioUrl;
      finalWaveform = res.waveform;
      finalDuration = res.durationSeconds;
      if (res.transcript) finalTranscript = res.transcript.trim();
    }

    const pinData = {
      type: 'voicenote' as const,
      title: 'Voice Memo',
      recordedDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: finalDuration,
      audioUrl: finalAudioUrl,
      waveform: finalWaveform.length > 4 ? finalWaveform : [0.3, 0.6, 0.8, 0.9, 0.6, 0.4, 0.7, 0.8, 0.5, 0.3],
      transcriptExcerpt: finalTranscript || 'Recorded voice memo.',
      transcription: finalTranscript || 'Recorded voice memo.',
      tapeStyle: 'none' as const,
    };

    if (activeBoardId) {
      addPin(activeBoardId, pinData as any);
    } else {
      addToDesk(pinData as any);
    }
    onClose();
  };

  const handleConvertToText = async () => {
    let finalTranscript = transcript.trim();

    if (isRecording) {
      const res = await speechAudioService.stopRecording(transcript);
      if (res.transcript) finalTranscript = res.transcript.trim();
    }

    const textBody = finalTranscript || 'Thoughts and reflections recorded from voice.';

    const pinData = {
      type: 'text' as const,
      title: 'Voice Memo',
      body: textBody,
      fontStyle: 'handwriting' as const,
      paperTone: 'peach' as const,
      tapeStyle: 'top-center' as const,
      tapeColor: 'rgba(245, 158, 11, 0.82)',
      authorNote: `Transcribed on ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    };

    if (activeBoardId) {
      addPin(activeBoardId, pinData as any);
    } else {
      addToDesk(pinData as any);
    }
    onClose();
  };

  const handleConvertToChecklist = async () => {
    let finalTranscript = transcript.trim();

    if (isRecording) {
      const res = await speechAudioService.stopRecording(transcript);
      if (res.transcript) finalTranscript = res.transcript.trim();
    }

    const textToSplit = finalTranscript || 'Checklist item 1\nChecklist item 2';
    // Split by newlines, commas, or periods
    const rawItems = textToSplit
      .split(/[\n,;]|\band\b/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const items = (rawItems.length > 0 ? rawItems : [textToSplit]).map((text, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      text,
      completed: false,
    }));

    const pinData = {
      type: 'checklist' as const,
      title: 'Voice Checklist',
      items,
      paperTone: 'butter' as const,
      tapeStyle: 'top-center' as const,
    };

    if (activeBoardId) {
      addPin(activeBoardId, pinData as any);
    } else {
      addToDesk(pinData as any);
    }
    onClose();
  };

  const displayMins = Math.floor(seconds / 60);
  const displaySecs = seconds % 60;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} style={styles.backBtn} hitSlop={12}>
              <ChevronLeft size={24} color={colors.ink.primary} />
            </Pressable>

            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>Voice Memo & Transcription</Text>
              <View style={styles.statusIndicatorRow}>
                <View style={[styles.statusDot, isRecording && styles.statusDotRecording]} />
                <Text style={styles.headerSubtitle}>
                  {isRecording ? 'Listening & Transcribing live...' : 'Recording paused'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
            {/* Top Waveform Visualizer Card */}
            <View style={styles.waveformCard}>
              <Text style={styles.timerText}>
                {`00:${displayMins < 10 ? '0' : ''}${displayMins}:${displaySecs < 10 ? '0' : ''}${displaySecs}`}
              </Text>

              {/* Dynamic Live Waveform */}
              <View style={styles.waveformRow}>
                {liveWaveform.map((amp, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.waveBar,
                      {
                        height: Math.max(6, amp * 52),
                        backgroundColor: isRecording ? colors.brand.purple : '#A78BFA',
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Record / Pause and Playback Controls */}
              <View style={styles.controlsRow}>
                <Pressable
                  onPress={handleToggleRecording}
                  style={({ pressed }) => [
                    styles.stopRecordCircle,
                    !isRecording && styles.recordCircleResume,
                    pressed && styles.btnPressed,
                  ]}
                  hitSlop={8}
                >
                  {isRecording ? (
                    <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Mic size={20} color="#FFFFFF" />
                  )}
                </Pressable>

                {!isRecording && recordedAudioUrl && (
                  <Pressable
                    onPress={handleTogglePlayAudio}
                    style={({ pressed }) => [styles.playAudioBtn, pressed && { opacity: 0.8 }]}
                    hitSlop={8}
                  >
                    {isPlayingAudio ? <Pause size={14} color="#7C3AED" /> : <Play size={14} color="#7C3AED" fill="#7C3AED" />}
                    <Text style={styles.playAudioBtnText}>{isPlayingAudio ? 'Pause Audio' : 'Preview Audio'}</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Real-time Live Speech Transcription Card */}
            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <View style={styles.transcriptionBadge}>
                  <Sparkles size={13} color={colors.brand.purple} />
                  <Text style={styles.transcriptTitle}>Live Text Transcription</Text>
                </View>
                <Pressable
                  onPress={() => setIsEditingTranscript(!isEditingTranscript)}
                  style={styles.editToggleBtn}
                  hitSlop={8}
                >
                  <Text style={styles.editText}>{isEditingTranscript ? 'Done' : 'Edit Text'}</Text>
                </Pressable>
              </View>

              <View style={styles.transcriptCard}>
                {isEditingTranscript ? (
                  <TextInput
                    value={transcript}
                    onChangeText={setTranscript}
                    multiline
                    style={styles.transcriptInput}
                    placeholder="Type or edit spoken transcription..."
                    placeholderTextColor={colors.ink.faded}
                    autoFocus
                  />
                ) : (
                  <Text style={[styles.transcriptText, !transcript && styles.transcriptPlaceholder]}>
                    {transcript || (isRecording ? 'Speak now — your voice will appear here as text in real time...' : 'No speech recorded yet. Tap mic or edit text above.')}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Conversion Buttons */}
          <View style={styles.bottomActions}>
            <Text style={styles.bottomSectionLabel}>Save or Convert As:</Text>
            
            <View style={styles.bottomButtonsGrid}>
              {/* 1. Convert directly to Written Text Note */}
              <Pressable
                onPress={handleConvertToText}
                style={({ pressed }) => [styles.actionBtnPrimary, pressed && { opacity: 0.88 }]}
              >
                <FileText size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Convert to Note</Text>
              </Pressable>

              {/* 2. Convert directly to Checklist */}
              <Pressable
                onPress={handleConvertToChecklist}
                style={({ pressed }) => [styles.actionBtnSecondary, pressed && { opacity: 0.88 }]}
              >
                <ListTodo size={15} color={colors.brand.purpleDark} />
                <Text style={styles.actionBtnSecondaryText}>To Checklist</Text>
              </Pressable>

              {/* 3. Keep Audio Pin */}
              <Pressable
                onPress={handleKeepAsAudio}
                style={({ pressed }) => [styles.actionBtnTertiary, pressed && { opacity: 0.88 }]}
              >
                <Volume2 size={15} color={colors.ink.secondary} />
                <Text style={styles.actionBtnTertiaryText}>Audio Memo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    paddingTop: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-top, 20px))' : 20) as any,
    paddingBottom: (Platform.OS === 'web' ? 'max(20px, env(safe-area-inset-bottom, 20px))' : 20) as any,
    paddingLeft: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-left, 14px))' : 14) as any,
    paddingRight: (Platform.OS === 'web' ? 'max(14px, env(safe-area-inset-right, 14px))' : 14) as any,
  },
  container: {
    width: '100%',
    maxWidth: 460,
    height: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.ink.faded,
  },
  statusDotRecording: {
    backgroundColor: '#EF4444',
  },
  headerSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  waveformCard: {
    backgroundColor: '#F8F6FD',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    marginBottom: 16,
  },
  timerText: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    fontWeight: '800',
    color: colors.brand.purpleDark,
    marginBottom: 12,
    letterSpacing: 1,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 56,
    width: '100%',
    marginBottom: 14,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopRecordCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordCircleResume: {
    backgroundColor: colors.brand.purple,
    shadowColor: colors.brand.purple,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  playAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE8FF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  playAudioBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  transcriptSection: {
    marginBottom: 16,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transcriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcriptTitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.brand.purpleDark,
  },
  editToggleBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  editText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.purple,
  },
  transcriptCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    minHeight: 140,
    maxHeight: 220,
  },
  transcriptText: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink.primary,
  },
  transcriptPlaceholder: {
    color: colors.ink.faded,
    fontStyle: 'italic',
  },
  transcriptInput: {
    fontFamily: typography.families.serif,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink.primary,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  bottomActions: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  bottomSectionLabel: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.ink.tertiary,
    marginBottom: 8,
  },
  bottomButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  actionBtnPrimaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#EDE8FF',
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnSecondaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  actionBtnTertiary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnTertiaryText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
});

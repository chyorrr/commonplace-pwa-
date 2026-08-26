import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { 
  ChevronLeft, 
  Square, 
  Play, 
  Pause, 
  Mic, 
  Check, 
  FileText, 
  ListTodo, 
  Volume2, 
  Globe, 
  AlertCircle 
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { speechAudioService } from '../../services/speechAndAudio';
import { transcriptionService } from '../../services/transcriptionService';

interface VoiceNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VoiceNoteModal: React.FC<VoiceNoteModalProps> = ({ visible, onClose }) => {
  const { addPin, addToDesk, activeBoardId } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [hasStartedEver, setHasStartedEver] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveWaveform, setLiveWaveform] = useState<number[]>([0.2, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isTranscribingWithAI, setIsTranscribingWithAI] = useState(false);

  const supportedLanguages = speechAudioService.getSupportedLanguages();

  useEffect(() => {
    if (visible) {
      setIsRecording(false);
      setHasStartedEver(false);
      setSeconds(0);
      setTranscript('');
      setLiveWaveform([0.2, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3]);
      setRecordedAudioUrl(undefined);
      setIsPlayingAudio(false);
      setIsEditingTranscript(false);
      setErrorMessage(null);
      setIsTranscribingWithAI(false);
    } else {
      speechAudioService.stopRecording(transcript);
      speechAudioService.stopAudio();
      setIsPlayingAudio(false);
      setIsTranscribingWithAI(false);
    }

    return () => {
      speechAudioService.stopRecording('');
      speechAudioService.stopAudio();
    };
  }, [visible]);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setIsRecording(true);
    setHasStartedEver(true);
    speechAudioService.stopAudio();
    setIsPlayingAudio(false);

    try {
      await speechAudioService.startRecording(
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
        },
        (err) => {
          setErrorMessage(err);
        },
        selectedLanguage
      );
    } catch (e: any) {
      setErrorMessage(e?.message || 'Could not start recording. Please check browser microphone permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const res = await speechAudioService.stopRecording(transcript);
    if (res.audioUrl) {
      setRecordedAudioUrl(res.audioUrl);
    }
    if (res.waveform) {
      setLiveWaveform(res.waveform);
    }

    let initialTranscript = (res.transcript || transcript || '').trim();
    if (initialTranscript) {
      setTranscript(initialTranscript);
    }

    // If audio was captured, run AI Whisper / post-transcription pipeline
    if (res.audioUrl) {
      setIsTranscribingWithAI(true);
      try {
        const langCode = selectedLanguage.split('-')[0];
        const aiResult = await transcriptionService.transcribeAudioBlob(
          res.audioUrl,
          initialTranscript,
          langCode
        );
        if (aiResult.transcript && aiResult.transcript.trim()) {
          setTranscript(aiResult.transcript.trim());
        }
      } catch (err) {
        console.warn('AI Transcription Notice:', err);
      } finally {
        setIsTranscribingWithAI(false);
      }
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
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
                <View
                  style={[
                    styles.statusDot,
                    isRecording
                      ? styles.statusDotRecording
                      : hasStartedEver
                      ? styles.statusDotPaused
                      : styles.statusDotReady,
                  ]}
                />
                <Text style={styles.headerSubtitle}>
                  {isRecording
                    ? 'Listening & Transcribing live...'
                    : hasStartedEver
                    ? 'Recording paused'
                    : 'Ready to Record'}
                </Text>
              </View>
            </View>

            {/* Language Selector Pill */}
            <Pressable
              onPress={() => setIsLangMenuOpen(!isLangMenuOpen)}
              style={styles.langPill}
              hitSlop={6}
            >
              <Globe size={13} color={colors.brand.purple} />
              <Text style={styles.langPillText}>
                {supportedLanguages.find((l) => l.code === selectedLanguage)?.label.split(' ')[0] || 'English'}
              </Text>
            </Pressable>
          </View>

          {/* Language Selection Bar */}
          {isLangMenuOpen && (
            <View style={styles.langMenuDropdown}>
              <Text style={styles.langMenuHeading}>Spoken Language for Transcription:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
                {supportedLanguages.map((l) => (
                  <Pressable
                    key={l.code}
                    onPress={() => {
                      setSelectedLanguage(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    style={[
                      styles.langChip,
                      selectedLanguage === l.code && styles.langChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langChipText,
                        selectedLanguage === l.code && styles.langChipTextActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Error / Permission Notice */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={15} color="#B91C1C" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

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
                        backgroundColor: isRecording ? colors.brand.purple : '#C4B5FD',
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Prominent Record / Pause and Playback Controls */}
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
                    <Square size={18} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Mic size={24} color="#FFFFFF" />
                  )}
                </Pressable>

                {!isRecording && recordedAudioUrl && (
                  <Pressable
                    onPress={handleTogglePlayAudio}
                    style={({ pressed }) => [styles.playAudioBtn, pressed && { opacity: 0.8 }]}
                    hitSlop={8}
                  >
                    {isPlayingAudio ? (
                      <Pause size={15} color="#7C3AED" />
                    ) : (
                      <Play size={15} color="#7C3AED" fill="#7C3AED" />
                    )}
                    <Text style={styles.playAudioBtnText}>
                      {isPlayingAudio ? 'Pause Preview' : 'Preview Audio'}
                    </Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.tapPromptText}>
                {isRecording
                  ? 'Tap red square to stop recording'
                  : hasStartedEver
                  ? 'Tap microphone to resume or speak more'
                  : 'Tap the purple microphone to start recording & transcribing'}
              </Text>
            </View>

            {/* Real-time Live Speech Transcription Card */}
            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <View style={styles.transcriptionBadge}>
                  <View style={[styles.statusDot, isRecording ? styles.statusDotRecording : styles.statusDotReady]} />
                  <Text style={styles.transcriptTitle}>Live Spoken Transcription</Text>
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
                {/* Cool small in-box live audio equalizer & recording pill */}
                {isRecording && (
                  <View style={styles.inBoxLiveBadge}>
                    <View style={styles.inBoxLivePill}>
                      <View style={styles.livePulseDot} />
                      <View style={styles.miniEqualizerRow}>
                        {liveWaveform.slice(-7).map((amp, i) => (
                          <View
                            key={i}
                            style={[
                              styles.miniEqualizerBar,
                              { height: Math.max(4, Math.round(amp * 16)) },
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={styles.inBoxLiveText}>Listening...</Text>
                    </View>
                  </View>
                )}

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
                    {isTranscribingWithAI
                      ? 'Transcribing audio... please wait a moment...'
                      : transcript ||
                        (isRecording
                          ? 'Listening... Speak into your microphone and words will appear here!'
                          : hasStartedEver
                          ? 'No speech recognized yet. You can tap Edit above to type, or tap the microphone to record again.'
                          : 'Tap the purple microphone above to speak. Your words will transcribe here.')}
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
  },
  statusDotReady: {
    backgroundColor: colors.brand.purple,
  },
  statusDotPaused: {
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
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#EDE8FF',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  langPillText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  langMenuDropdown: {
    backgroundColor: '#F8F6FD',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.1)',
  },
  langMenuHeading: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.ink.tertiary,
    marginBottom: 6,
  },
  langScroll: {
    gap: 6,
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  langChipActive: {
    backgroundColor: colors.brand.purple,
    borderColor: colors.brand.purple,
  },
  langChipText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: '#B91C1C',
    fontWeight: '600',
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
    marginBottom: 10,
    letterSpacing: 1,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 54,
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
    gap: 14,
  },
  stopRecordCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    paddingVertical: 10,
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
  tapPromptText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 10,
    textAlign: 'center',
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
    minHeight: 130,
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
    minHeight: 100,
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
  inBoxLiveBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
  },
  inBoxLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  miniEqualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 16,
  },
  miniEqualizerBar: {
    width: 2.5,
    backgroundColor: colors.brand.purple,
    borderRadius: 1.5,
  },
  inBoxLiveText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.purpleDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

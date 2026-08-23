import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ChevronLeft, Square, Play, Pause, Mic, Check } from 'lucide-react-native';
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
  const [transcript, setTranscript] = useState('Speaking your thoughts and reflections...');
  const [liveWaveform, setLiveWaveform] = useState<number[]>([0.3, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | undefined>(undefined);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRecording(true);
      setSeconds(0);
      setTranscript('Listening to your thoughts and voice notes...');
      setLiveWaveform([0.2, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3]);
      setRecordedAudioUrl(undefined);

      speechAudioService.startRecording(
        (text) => {
          if (text.trim()) {
            setTranscript(text);
          }
        },
        (wf) => {
          if (wf && wf.length > 0) {
            setLiveWaveform(wf.slice(-24));
          }
        },
        (sec) => {
          setSeconds(sec);
        }
      );
    } else {
      speechAudioService.stopRecording(transcript);
    }

    return () => {
      speechAudioService.stopRecording('');
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
    } else {
      setIsRecording(true);
      speechAudioService.startRecording(
        (text) => text.trim() && setTranscript(text),
        (wf) => wf && setLiveWaveform(wf.slice(-24)),
        (sec) => setSeconds(sec)
      );
    }
  };

  const handleKeepAsAudio = async () => {
    let finalAudioUrl = recordedAudioUrl;
    let finalWaveform = liveWaveform;
    let finalDuration = Math.max(1, seconds);

    if (isRecording) {
      const res = await speechAudioService.stopRecording(transcript);
      finalAudioUrl = res.audioUrl;
      finalWaveform = res.waveform;
      finalDuration = res.durationSeconds;
    }

    const pinData = {
      type: 'voicenote' as const,
      title: 'Voice Memo',
      recordedDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: finalDuration,
      audioUrl: finalAudioUrl,
      waveform: finalWaveform.length > 4 ? finalWaveform : [0.3, 0.6, 0.8, 0.9, 0.6, 0.4, 0.7, 0.8, 0.5, 0.3],
      transcriptExcerpt: transcript || 'Recorded voice note.',
      tapeStyle: 'none' as const,
    };

    if (activeBoardId) {
      addPin(activeBoardId, pinData);
    } else {
      addToDesk(pinData);
    }
    onClose();
  };

  const handleConvertToText = async () => {
    if (isRecording) {
      await speechAudioService.stopRecording(transcript);
    }

    const pinData = {
      type: 'text' as const,
      title: 'Voice Memo Transcript',
      body: transcript || 'Thoughts and reflections recorded from voice.',
      fontStyle: 'handwriting' as const,
      paperTone: 'peach' as const,
      tapeStyle: 'top-center' as const,
      tapeColor: 'rgba(245, 158, 11, 0.82)',
    };

    if (activeBoardId) {
      addPin(activeBoardId, pinData);
    } else {
      addToDesk(pinData);
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
            <Pressable onPress={onClose} style={styles.backBtn} hitSlop={10}>
              <ChevronLeft size={24} color={colors.ink.primary} />
            </Pressable>

            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>Voice Memo</Text>
              <Text style={styles.headerSubtitle}>
                {isRecording ? '● Recording live...' : 'Recording paused'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
            {/* Top Card: Waveform Player */}
            <View style={styles.waveformCard}>
              <Text style={styles.timerText}>
                {`00:${displayMins < 10 ? '0' : ''}${displayMins}:${displaySecs < 10 ? '0' : ''}${displaySecs}`}
              </Text>

              {/* Dynamic Waveform Visual */}
              <View style={styles.waveformRow}>
                {liveWaveform.map((amp, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.waveBar,
                      {
                        height: Math.max(8, amp * 54),
                        backgroundColor: isRecording ? colors.brand.purple : '#C4B5FD',
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Record / Pause Toggle Button */}
              <Pressable
                onPress={handleToggleRecording}
                style={({ pressed }) => [styles.stopRecordCircle, pressed && styles.btnPressed]}
              >
                {isRecording ? (
                  <Square size={18} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Mic size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            {/* Transcript Card */}
            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <Text style={styles.transcriptTitle}>Speech Transcript</Text>
                <Pressable onPress={() => setIsEditingTranscript(!isEditingTranscript)} hitSlop={8}>
                  <Text style={styles.editText}>{isEditingTranscript ? 'Done' : 'Edit'}</Text>
                </Pressable>
              </View>

              <View style={styles.transcriptCard}>
                {isEditingTranscript ? (
                  <TextInput
                    value={transcript}
                    onChangeText={setTranscript}
                    multiline
                    style={styles.transcriptInput}
                    placeholder="Type or edit transcript..."
                    placeholderTextColor={colors.ink.faded}
                  />
                ) : (
                  <Text style={styles.transcriptText}>{transcript}</Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomButtonsRow}>
            <Pressable onPress={handleKeepAsAudio} style={styles.keepAudioBtn}>
              <Text style={styles.keepAudioText}>Keep as Audio Memo</Text>
            </Pressable>

            <Pressable onPress={handleConvertToText} style={styles.convertTextBtn}>
              <Text style={styles.convertTextText}>Convert to Note</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 460,
    height: '88%',
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  headerSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.brand.purpleDark,
    marginTop: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  waveformCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 16,
  },
  timerText: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    fontWeight: '700',
    color: colors.brand.purpleDark,
    marginBottom: 14,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
    width: '100%',
    marginBottom: 16,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
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
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  transcriptSection: {
    marginBottom: 16,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptTitle: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink.secondary,
    textTransform: 'uppercase',
  },
  editText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.purple,
  },
  transcriptCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  transcriptText: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    color: colors.ink.primary,
    lineHeight: 20,
  },
  transcriptInput: {
    fontFamily: typography.families.serif,
    fontSize: 14,
    color: colors.ink.primary,
    minHeight: 80,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  keepAudioBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepAudioText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  convertTextBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convertTextText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
});

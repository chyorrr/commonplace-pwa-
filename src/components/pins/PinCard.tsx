import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Pin } from '../../types';
import { PhotoPin } from './PhotoPin';
import { TextPin } from './TextPin';
import { ThoughtPin } from './ThoughtPin';
import { ChecklistPin } from './ChecklistPin';
import { QuotePin } from './QuotePin';
import { MusicPin } from './MusicPin';
import { VoiceNotePin } from './VoiceNotePin';
import { LinkPin } from './LinkPin';
import { CollagePin } from './CollagePin';
import { JournalPin } from './JournalPin';
import { useApp } from '../../context/AppContext';
import { Heart } from 'lucide-react-native';

interface PinCardProps {
  pin: Pin;
  onPress?: () => void;
  showFavoriteBadge?: boolean;
}

export const PinCard: React.FC<PinCardProps> = ({
  pin,
  onPress,
}) => {
  const { setActivePinDetail, toggleFavoritePin } = useApp();
  const lastTapRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  // Heart pop animation for double click / double tap
  const [showHeartPop, setShowHeartPop] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const triggerHeartAnimation = () => {
    setShowHeartPop(true);
    heartScale.setValue(0.4);
    heartOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.35,
        friction: 3,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 650,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeartPop(false);
    });
  };

  const handleCardPress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 260;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      // Double tap / double click -> Toggle Favorite & Show Heart Pop
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastTapRef.current = 0;
      toggleFavoritePin(pin.id);
      triggerHeartAnimation();
    } else {
      lastTapRef.current = now;
      timerRef.current = setTimeout(() => {
        // Single tap / click -> Open detail modal instantly
        lastTapRef.current = 0;
        if (onPress) {
          onPress();
        } else {
          setActivePinDetail(pin);
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const renderContent = () => {
    switch (pin.type) {
      case 'photo':
        return <PhotoPin pin={pin} onPress={handleCardPress} />;
      case 'text':
        return <TextPin pin={pin} onPress={handleCardPress} />;
      case 'thought':
        return <ThoughtPin pin={pin} onPress={handleCardPress} />;
      case 'checklist':
        return <ChecklistPin pin={pin} onPress={handleCardPress} />;
      case 'quote':
        return <QuotePin pin={pin} onPress={handleCardPress} />;
      case 'music':
        return <MusicPin pin={pin} onPress={handleCardPress} />;
      case 'voicenote':
        return <VoiceNotePin pin={pin} onPress={handleCardPress} />;
      case 'link':
        return <LinkPin pin={pin} onPress={handleCardPress} />;
      case 'collage':
        return <CollagePin pin={pin} onPress={handleCardPress} />;
      case 'journal':
        return <JournalPin pin={pin} onPress={handleCardPress} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardWrapper}>
      {renderContent()}

      {/* Discrete Favorite Indicator Heart (No text) */}
      {Boolean(pin.isFavorite) && (
        <View style={styles.favHeartIcon} pointerEvents="none">
          <Heart size={14} color="#E11D48" fill="#E11D48" />
        </View>
      )}

      {/* Animated Heart Pop on Double-Click / Double-Tap */}
      {showHeartPop && (
        <Animated.View
          style={[
            styles.heartPopWrapper,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.heartPopCircle}>
            <Heart size={38} color="#E11D48" fill="#E11D48" />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  favHeartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  heartPopWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  heartPopCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

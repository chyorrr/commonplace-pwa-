import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { Tape } from './Tape';
import { AttachedSticker } from '../../types';
import { useApp } from '../../context/AppContext';

export interface PaperCardProps {
  children: React.ReactNode;
  style?: any;
  rotation?: number;
  paperTone?: 'lilac' | 'peach' | 'butter' | 'sage' | 'sky' | 'blush' | 'matcha' | 'vanilla' | 'cream' | 'linen' | 'cotton' | 'parchment' | 'kraft' | 'darkPaper';
  tapeStyle?: 'top-center' | 'top-corners' | 'diagonal-left' | 'none';
  tapeColor?: string;
  onPress?: () => void;
  isLifted?: boolean;
  stickers?: AttachedSticker[];
  borderStyle?: 'subtle' | 'deckle' | 'none';
  pinId?: string;
}

interface DraggableStickerProps {
  sticker: AttachedSticker;
  imageUrl: string;
  cardRef: React.RefObject<any>;
  pinId?: string;
  onStickerMove: (stickerId: string, xPercent: number, yPercent: number) => void;
}

const DraggableSticker: React.FC<DraggableStickerProps> = ({
  sticker,
  imageUrl,
  cardRef,
  pinId,
  onStickerMove,
}) => {
  const [pos, setPos] = useState({ x: sticker.xPercent, y: sticker.yPercent });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const currentPosRef = useRef({ x: sticker.xPercent, y: sticker.yPercent });

  // Sync with prop updates when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPos({ x: sticker.xPercent, y: sticker.yPercent });
      currentPosRef.current = { x: sticker.xPercent, y: sticker.yPercent };
    }
  }, [sticker.xPercent, sticker.yPercent, isDragging]);

  const baseSize =
    sticker.sizePreset === 'sm'
      ? 32
      : sticker.sizePreset === 'lg'
      ? 64
      : sticker.sizePreset === 'xl'
      ? 84
      : 48;
  const finalDim = Math.round(baseSize * (sticker.scale || 1));

  const handlePointerDown = (e: any) => {
    e.stopPropagation?.();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: currentPosRef.current.x,
      initY: currentPosRef.current.y,
    };

    const handlePointerMove = (moveEvent: any) => {
      if (!dragStartRef.current || !cardRef.current) return;
      const curX = moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX;
      const curY = moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY;
      if (curX === undefined || curY === undefined) return;

      const cardEl = cardRef.current;
      const rect = cardEl.getBoundingClientRect ? cardEl.getBoundingClientRect() : null;
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const dx = ((curX - dragStartRef.current.startX) / rect.width) * 100;
      const dy = ((curY - dragStartRef.current.startY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(85, Math.round((dragStartRef.current.initX + dx) * 10) / 10));
      const newY = Math.max(0, Math.min(85, Math.round((dragStartRef.current.initY + dy) * 10) / 10));

      currentPosRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      }

      if (onStickerMove) {
        onStickerMove(sticker.id, currentPosRef.current.x, currentPosRef.current.y);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          position: 'absolute',
          width: finalDim,
          height: finalDim,
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: `rotate(${sticker.rotation || 0}deg) scale(${isDragging ? 1.15 : 1})`,
          zIndex: isDragging ? 100 : 30,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          filter: isDragging ? 'drop-shadow(0 8px 14px rgba(45, 27, 78, 0.35))' : 'none',
        }}
      >
        <View
          style={[
            styles.dieCutContourWrap,
            sticker.contourStyle === 'glow' && styles.contourGlow,
            sticker.contourStyle === 'stamp' && styles.contourStamp,
            sticker.contourStyle === 'badge' && styles.contourBadge,
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.stickerImg}
            resizeMode="cover"
          />
        </View>
      </div>
    );
  }

  // React Native Native Fallback
  return (
    <Pressable
      onPress={(e) => e.stopPropagation?.()}
      style={[
        styles.placedSticker,
        {
          width: finalDim,
          height: finalDim,
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: [{ rotate: `${sticker.rotation || 0}deg` }],
        },
      ]}
    >
      <View
        style={[
          styles.dieCutContourWrap,
          sticker.contourStyle === 'glow' && styles.contourGlow,
          sticker.contourStyle === 'stamp' && styles.contourStamp,
          sticker.contourStyle === 'badge' && styles.contourBadge,
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.stickerImg}
          resizeMode="cover"
        />
      </View>
    </Pressable>
  );
};

export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  style,
  rotation = 0,
  paperTone = 'lilac',
  tapeStyle = 'none',
  tapeColor,
  onPress,
  isLifted = false,
  stickers = [],
  borderStyle = 'subtle',
  pinId,
}) => {
  const { stickers: stickerLibrary, updateStickerPosition } = useApp();
  const cardContainerRef = useRef<any>(null);

  const getBackgroundColor = () => {
    switch (paperTone) {
      case 'lilac':
        return colors.paper.lilac;
      case 'peach':
      case 'parchment':
        return colors.paper.peach;
      case 'butter':
        return colors.paper.butter;
      case 'sage':
        return colors.paper.sage;
      case 'sky':
      case 'linen':
        return colors.paper.sky;
      case 'blush':
        return colors.paper.blush;
      case 'matcha':
        return colors.paper.matcha;
      case 'vanilla':
      case 'cream':
        return colors.paper.vanilla;
      case 'darkPaper':
        return colors.paper.dark;
      default:
        return colors.paper.lilac;
    }
  };

  const getStickerImage = (stickerId: string) => {
    return stickerLibrary.find((s) => s.id === stickerId)?.imageUrl;
  };

  const handleStickerMove = (stickerAttachmentId: string, xPercent: number, yPercent: number) => {
    if (pinId && updateStickerPosition) {
      updateStickerPosition(pinId, stickerAttachmentId, xPercent, yPercent);
    }
  };

  return (
    <Pressable
      ref={cardContainerRef}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: getBackgroundColor(),
          transform: [
            { rotate: `${rotation}deg` },
            { scale: pressed ? 0.985 : 1 },
          ],
        },
        isLifted ? shadows.paperLifted : shadows.paperCard,
        borderStyle === 'subtle' && styles.subtleBorder,
        borderStyle === 'deckle' && styles.deckleBorder,
        style,
      ]}
    >
      {/* Tape attachment if present */}
      {tapeStyle && tapeStyle !== 'none' && (
        <Tape variant={tapeStyle} tapeColor={tapeColor} />
      )}

      {/* Card Content */}
      <View style={styles.innerContent}>{children}</View>

      {/* User placed stickers with interactive press & hold movement */}
      {stickers.map((st) => {
        const url = getStickerImage(st.stickerId);
        if (!url) return null;

        return (
          <DraggableSticker
            key={st.id}
            sticker={st}
            imageUrl={url}
            cardRef={cardContainerRef}
            pinId={pinId}
            onStickerMove={handleStickerMove}
          />
        );
      })}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    position: 'relative',
    overflow: 'visible',
    marginVertical: 6,
  },
  subtleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.045)',
  },
  deckleBorder: {
    borderWidth: 1,
    borderColor: 'rgba(152, 132, 186, 0.15)',
  },
  innerContent: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  placedSticker: {
    position: 'absolute',
    zIndex: 30,
  },
  dieCutContourWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  contourGlow: {
    borderColor: '#F472B6',
    borderWidth: 2,
    shadowColor: '#EC4899',
    shadowOpacity: 0.35,
  },
  contourStamp: {
    borderColor: '#D97706',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: 8,
  },
  contourBadge: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  stickerImg: {
    width: '100%',
    height: '100%',
  },
});

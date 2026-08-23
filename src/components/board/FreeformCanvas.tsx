import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Board, FreeformTransform, Pin } from '../../types';
import { PinCard } from '../pins/PinCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { useApp } from '../../context/AppContext';
import { RotateCw, RotateCcw, ArrowUpToLine, Check, ZoomIn, ZoomOut, Maximize2, Printer } from 'lucide-react-native';
import { BoardExportModal } from '../modals/BoardExportModal';

interface FreeformCanvasProps {
  board: Board;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({ board }) => {
  const { updatePinPosition, setActivePinDetail } = useApp();
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialPinPos, setInitialPinPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Maximum zIndex in layout
  const getMaxZIndex = () => {
    let max = 1;
    Object.values(board.freeformLayout || {}).forEach((t) => {
      if (t.zIndex > max) max = t.zIndex;
    });
    return max;
  };

  const getPinTransform = (pin: Pin, index: number): FreeformTransform => {
    if (board.freeformLayout && board.freeformLayout[pin.id]) {
      return board.freeformLayout[pin.id];
    }
    // Staggered layout
    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      x: col === 0 ? 20 : 310,
      y: row * 310 + 20,
      zIndex: index + 1,
      rotation: pin.rotation || (index % 2 === 0 ? -1.5 : 1.2),
      scale: 1,
    };
  };

  // Drag Handlers
  const handlePointerDown = (e: any, pinId: string) => {
    e.stopPropagation?.();
    const pin = board.pins.find((p) => p.id === pinId);
    if (!pin) return;

    const currentTransform = getPinTransform(pin, board.pins.indexOf(pin));
    setSelectedPinId(pinId);
    setDraggingPinId(pinId);
    setDragStartPos({ x: e.clientX || e.pageX, y: e.clientY || e.pageY });
    setInitialPinPos({ x: currentTransform.x, y: currentTransform.y });

    updatePinPosition(board.id, pinId, {
      zIndex: getMaxZIndex() + 1,
    });
  };

  const handlePointerMove = (e: any) => {
    if (!draggingPinId || !dragStartPos || !initialPinPos) return;
    const clientX = e.clientX || e.pageX;
    const clientY = e.clientY || e.pageY;
    const dx = (clientX - dragStartPos.x) / zoomScale;
    const dy = (clientY - dragStartPos.y) / zoomScale;

    const newX = Math.max(10, Math.min(640, initialPinPos.x + dx));
    const newY = Math.max(10, Math.min(2400, initialPinPos.y + dy));

    updatePinPosition(board.id, draggingPinId, {
      x: newX,
      y: newY,
    });
  };

  const handlePointerUp = () => {
    setDraggingPinId(null);
    setDragStartPos(null);
    setInitialPinPos(null);
  };

  const rotateSelectedPin = (direction: 'cw' | 'ccw') => {
    if (!selectedPinId) return;
    const pin = board.pins.find((p) => p.id === selectedPinId);
    if (!pin) return;
    const current = getPinTransform(pin, board.pins.indexOf(pin));
    const delta = direction === 'cw' ? 3 : -3;
    updatePinPosition(board.id, selectedPinId, {
      rotation: +(current.rotation + delta).toFixed(1),
    });
  };

  const bringToTop = () => {
    if (!selectedPinId) return;
    updatePinPosition(board.id, selectedPinId, {
      zIndex: getMaxZIndex() + 1,
    });
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      setZoomScale(1);
    } else if (direction === 'in') {
      setZoomScale((prev) => Math.min(1.4, +(prev + 0.15).toFixed(2)));
    } else {
      setZoomScale((prev) => Math.max(0.7, +(prev - 0.15).toFixed(2)));
    }
  };

  return (
    <View
      style={styles.container}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Editorial helper bar with Zoom and Export controls */}
      <View style={styles.deskHelperBar}>
        <View style={styles.leftControls}>
          <Text style={styles.deskHelperText}>
            freeform desk canvas
          </Text>

          {/* Zoom Controls */}
          <View style={styles.zoomPill}>
            <Pressable
              onPress={() => handleZoom('out')}
              style={({ pressed }: { pressed: boolean }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}
            >
              <ZoomOut size={12} color={colors.ink.primary} />
            </Pressable>
            <Pressable onPress={() => handleZoom('reset')}>
              <Text style={styles.zoomLevelText}>{Math.round(zoomScale * 100)}%</Text>
            </Pressable>
            <Pressable
              onPress={() => handleZoom('in')}
              style={({ pressed }: { pressed: boolean }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}
            >
              <ZoomIn size={12} color={colors.ink.primary} />
            </Pressable>
          </View>
        </View>

        {/* Selected Item Controls / Export */}
        <View style={styles.rightControls}>
          <Pressable
            onPress={() => setIsExportOpen(true)}
            style={({ pressed }: { pressed: boolean }) => [styles.exportBtn, pressed && { opacity: 0.7 }]}
          >
            <Printer size={12} color={colors.ink.primary} />
            <Text style={styles.exportBtnText}>export</Text>
          </Pressable>

          {selectedPinId && (
            <View style={styles.selectedControls}>
              <Pressable
                onPress={() => rotateSelectedPin('ccw')}
                style={({ pressed }: { pressed: boolean }) => [styles.ctrlBtn, pressed && { opacity: 0.7 }]}
              >
                <RotateCcw size={12} color={colors.ink.primary} />
              </Pressable>

              <Pressable
                onPress={() => rotateSelectedPin('cw')}
                style={({ pressed }: { pressed: boolean }) => [styles.ctrlBtn, pressed && { opacity: 0.7 }]}
              >
                <RotateCw size={12} color={colors.ink.primary} />
              </Pressable>

              <Pressable
                onPress={bringToTop}
                style={({ pressed }: { pressed: boolean }) => [styles.ctrlBtn, pressed && { opacity: 0.7 }]}
              >
                <ArrowUpToLine size={12} color={colors.ink.primary} />
              </Pressable>

              <Pressable
                onPress={() => setSelectedPinId(null)}
                style={({ pressed }: { pressed: boolean }) => [styles.doneCtrlBtn, pressed && { opacity: 0.7 }]}
              >
                <Check size={12} color="#FFF" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Freeform Canvas Scroll Area */}
      <ScrollView
        style={styles.canvasScroll}
        contentContainerStyle={styles.canvasContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <ScrollView
          style={styles.canvasScrollVertical}
          contentContainerStyle={styles.canvasVerticalContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={[
              styles.deskSurface,
              {
                transform: [{ scale: zoomScale }],
                transformOrigin: 'top left',
              },
            ]}
            onPress={() => setSelectedPinId(null)}
          >
            {board.pins.map((pin, index) => {
              const transform = getPinTransform(pin, index);
              const isSelected = selectedPinId === pin.id;
              const isDragging = draggingPinId === pin.id;

              return (
                <View
                  key={pin.id}
                  onPointerDown={(e: any) => handlePointerDown(e, pin.id)}
                  style={[
                    styles.draggablePinItem,
                    {
                      left: transform.x,
                      top: transform.y,
                      zIndex: transform.zIndex + (isDragging ? 100 : 0),
                      transform: [
                        { rotate: `${transform.rotation}deg` },
                        { scale: isDragging ? 1.025 : 1 },
                      ],
                    },
                    isDragging ? shadows.deskFloating : shadows.paperLifted,
                    isSelected && styles.selectedBorder,
                  ]}
                >
                  <PinCard
                    pin={pin}
                    showFavoriteBadge={false}
                    onPress={() => {
                      if (selectedPinId === pin.id) {
                        setActivePinDetail(pin);
                      } else {
                        setSelectedPinId(pin.id);
                      }
                    }}
                  />
                </View>
              );
            })}
          </Pressable>
        </ScrollView>
      </ScrollView>

      {/* Export / Printable Scrapbook Sheet Modal */}
      <BoardExportModal
        visible={isExportOpen}
        board={board}
        onClose={() => setIsExportOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  deskHelperBar: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deskHelperText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
    fontWeight: '500',
  },
  zoomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  zoomBtn: {
    padding: 2,
  },
  zoomLevelText: {
    fontFamily: typography.families.mono,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  exportBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.primary,
    fontWeight: '500',
  },
  selectedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctrlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  doneCtrlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContent: {
    minWidth: 700,
  },
  canvasScrollVertical: {
    flex: 1,
  },
  canvasVerticalContent: {
    minHeight: 1600,
    paddingBottom: 120,
  },
  deskSurface: {
    width: 700,
    height: 1600,
    position: 'relative',
  },
  draggablePinItem: {
    position: 'absolute',
    width: 265,
    cursor: 'pointer',
    userSelect: 'none',
  },
  selectedBorder: {
    outlineWidth: 2,
    outlineStyle: 'dashed',
    outlineColor: colors.accents.lavender,
    borderRadius: 6,
  },
});

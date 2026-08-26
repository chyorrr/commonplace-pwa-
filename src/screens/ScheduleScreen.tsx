import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown, 
  MoreVertical, 
  Plus, 
  Check, 
  Bell, 
  BellRing, 
  Clock, 
  Calendar,
  Calendar as CalendarIcon, 
  CheckSquare,
  Trash2, 
  X 
} from 'lucide-react-native';
import { reminderService } from '../services/reminderService';
import { ReminderItem } from '../types';

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ScheduleScreen: React.FC = () => {
  const { 
    reminders, 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    toggleReminderStatus, 
    setActiveTab 
  } = useApp();

  // Active Year and Month State
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-11
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);

  // Selected Date string (YYYY-MM-DD synced to current device day)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateStr);
  const ribbonScrollRef = React.useRef<any>(null);

  // Auto-sync to current device date whenever Schedule tab is active
  React.useEffect(() => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setSelectedDateStr(getTodayDateStr());

    // Scroll to center today's date capsule in the ribbon
    const dayIndex = today.getDate() - 1;
    setTimeout(() => {
      if (ribbonScrollRef.current) {
        ribbonScrollRef.current.scrollTo?.({ x: Math.max(0, dayIndex * 54 - 120), animated: true });
      }
    }, 200);
  }, []);

  // Modal State for New Task / Reminder
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal task');
  const [newStartTime, setNewStartTime] = useState('10:00 AM');
  const [newEndTime, setNewEndTime] = useState('12:00 PM');
  const [newColor, setNewColor] = useState('#D4F5C9');
  const [enableNotification, setEnableNotification] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate to previous/next month
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Generate all days in the currently selected month
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(selectedYear, selectedMonth, dayNum);
      const mm = String(selectedMonth + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      const dateStr = `${selectedYear}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ dateStr, dayNum, dayName });
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // Filter tasks for selected date
  const filteredTasks = useMemo(() => {
    return reminders.filter((r) => r.date === selectedDateStr || !r.date);
  }, [reminders, selectedDateStr]);

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;

    if (enableNotification) {
      await reminderService.requestNotificationPermission();
    }

    addReminder({
      title: newTitle.trim(),
      category: newCategory,
      date: selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'upcoming',
      progressPercent: 0,
      color: newColor,
      notificationEnabled: enableNotification,
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const handleTestNotification = async () => {
    const granted = await reminderService.requestNotificationPermission();
    if (granted) {
      reminderService.sendTestNotification();
    } else {
      alert('Please enable notification permissions in your device or browser settings to receive reminder alerts!');
    }
  };

  const pastelColors = [
    { name: 'Matcha Mint', hex: '#D4F5C9' },
    { name: 'Sky Cyan', hex: '#CBEBFB' },
    { name: 'Lilac Lavender', hex: '#E5DCFC' },
    { name: 'Buttercup', hex: '#FEF0C3' },
    { name: 'Rose Peach', hex: '#FFE4D6' },
  ];

  const categories = ['Client project', 'Family task', 'Company task', 'Personal task', 'Journal & Study', 'Health'];

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => setActiveTab('home')} style={styles.iconBtn} hitSlop={8}>
          <ChevronLeft size={22} color={colors.ink.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>My Schedule</Text>

        <Pressable onPress={handleTestNotification} style={styles.testBellBtn} hitSlop={8}>
          <BellRing size={18} color={colors.brand.purple} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollCanvas} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Month Selector & Date Capsule Ribbon */}
        <View style={styles.calendarSection}>
          {/* Month Stepper & Popover Header */}
          <View style={styles.monthHeaderRow}>
            <Pressable
              onPress={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              style={styles.monthTitleBtn}
              hitSlop={6}
            >
              <Text style={styles.monthText}>{monthNames[selectedMonth]} {selectedYear}</Text>
              <ChevronDown size={16} color={colors.ink.secondary} />
            </Pressable>

            <View style={styles.stepperArrowsRow}>
              <Pressable onPress={handlePrevMonth} style={styles.stepperBtn} hitSlop={6}>
                <ChevronLeft size={16} color={colors.ink.primary} />
              </Pressable>
              <Pressable onPress={handleNextMonth} style={styles.stepperBtn} hitSlop={6}>
                <ChevronRight size={16} color={colors.ink.primary} />
              </Pressable>
            </View>
          </View>

          {/* Month Selector Grid Popover */}
          {isMonthPickerOpen && (
            <View style={styles.monthGridPopover}>
              {monthNames.map((m, idx) => {
                const isCurrent = selectedMonth === idx;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setSelectedMonth(idx);
                      setIsMonthPickerOpen(false);
                    }}
                    style={[styles.monthGridItem, isCurrent && styles.monthGridItemActive]}
                  >
                    <Text style={[styles.monthGridText, isCurrent && styles.monthGridTextActive]}>
                      {m.substring(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Horizontal Day Capsules */}
          <ScrollView
            ref={ribbonScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRibbon}
          >
            {monthDays.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;
              return (
                <Pressable
                  key={day.dateStr}
                  onPress={() => setSelectedDateStr(day.dateStr)}
                  style={[styles.dateCapsule, isSelected && styles.dateCapsuleActive]}
                >
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>{day.dayNum}</Text>
                  <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{day.dayName}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Timeline with Fluid Notched Task Cards */}
        <View style={styles.timelineSection}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyTasksCard}>
              <Calendar size={24} color={colors.brand.purple} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTasksTitle}>No Tasks for {selectedDateStr}</Text>
              <Text style={styles.emptyTasksSub}>Tap "+ New Reminder" below to schedule your tasks and events.</Text>
            </View>
          ) : (
            filteredTasks.map((task, index) => {
              const isCompleted = task.status === 'completed';

              return (
                <View key={task.id} style={styles.timelineRow}>
                  {/* Left Column: Time & Dotted Line */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeTextStart}>{task.startTime}</Text>
                    <View style={styles.dottedConnector} />
                    {task.endTime && <Text style={styles.timeTextEnd}>{task.endTime}</Text>}
                  </View>

                  {/* Right Column: Fluid Cut-Out Pastel Card */}
                  <View style={[styles.taskCard, { backgroundColor: task.color || '#E5DCFC' }]}>
                    {/* Top Notch Tab for Status */}
                    <View style={styles.cardTopNotch}>
                      <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
                        <Text style={styles.statusBadgeText}>
                          {isCompleted ? 'Completed' : task.status === 'running' ? 'In Progress' : 'Upcoming'}
                        </Text>
                      </View>

                      <View style={styles.progressRow}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${task.progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{task.progressPercent}%</Text>
                      </View>
                    </View>

                    {/* Card Content Row */}
                    <View style={styles.cardMainRow}>
                      {/* Left Check / Category Icon */}
                      <Pressable
                        onPress={() => toggleReminderStatus(task.id)}
                        style={[styles.taskIconSquare, isCompleted && styles.taskIconSquareDone]}
                        hitSlop={6}
                      >
                        {isCompleted ? (
                          <Check size={16} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <CheckSquare size={16} color={colors.ink.primary} />
                        )}
                      </Pressable>

                      {/* Title & Category */}
                      <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}>
                          {task.title}
                        </Text>
                        <Text style={styles.taskCategory}>{task.category}</Text>
                      </View>

                      {/* Actions */}
                      <Pressable onPress={() => deleteReminder(task.id)} style={styles.deleteBtn} hitSlop={8}>
                        <Trash2 size={16} color="rgba(0, 0, 0, 0.4)" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Add Task Button */}
      <View style={styles.floatingDock}>
        <Pressable
          onPress={() => setIsAddModalOpen(true)}
          style={({ pressed }) => [styles.addTaskFab, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.addTaskFabText}>New Reminder</Text>
        </Pressable>
      </View>

      {/* Add Task Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Reminder</Text>
              <Pressable onPress={() => setIsAddModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color={colors.ink.primary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Task Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Design Review, Family Dinner..."
                  placeholderTextColor={colors.ink.faded}
                  style={styles.textInput}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[styles.catChip, newCategory === cat && styles.catChipActive]}
                    >
                      <Text style={[styles.catChipText, newCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Time Row */}
              <View style={styles.twoColRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                    placeholder="10:00 AM"
                    placeholderTextColor={colors.ink.faded}
                    style={styles.textInput}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                    placeholder="12:00 PM"
                    placeholderTextColor={colors.ink.faded}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Pastel Theme Color */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Theme Color</Text>
                <View style={styles.colorPickerRow}>
                  {pastelColors.map((c) => (
                    <Pressable
                      key={c.hex}
                      onPress={() => setNewColor(c.hex)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c.hex },
                        newColor === c.hex && styles.colorCircleSelected,
                      ]}
                    >
                      {newColor === c.hex && <Check size={14} color={colors.ink.primary} />}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Browser Notification Toggle */}
              <Pressable
                onPress={() => setEnableNotification(!enableNotification)}
                style={styles.notificationToggleRow}
              >
                <View style={styles.notifToggleTextGroup}>
                  <Text style={styles.notifToggleTitle}>Browser Notifications</Text>
                  <Text style={styles.notifToggleSub}>Sends push alert when reminder time arrives</Text>
                </View>
                <View style={[styles.togglePill, enableNotification && styles.togglePillActive]}>
                  <View style={[styles.toggleDot, enableNotification && styles.toggleDotActive]} />
                </View>
              </Pressable>

              {/* Submit Button */}
              <Pressable onPress={handleCreateTask} style={styles.createTaskBtn}>
                <Text style={styles.createTaskBtnText}>Add to Schedule</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink.primary,
    letterSpacing: -0.3,
  },
  testBellBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#EDE8FA',
  },
  scrollCanvas: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90,
  },
  calendarSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontFamily: typography.families.heading,
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink.primary,
  },
  stepperArrowsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridPopover: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  monthGridItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  monthGridItemActive: {
    backgroundColor: colors.brand.purple,
  },
  monthGridText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  monthGridTextActive: {
    color: '#FFFFFF',
  },
  dateRibbon: {
    gap: 10,
  },
  dateCapsule: {
    width: 50,
    height: 74,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateCapsuleActive: {
    backgroundColor: '#D4F5C9', // match reference active green
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dayNumber: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  dayNumberActive: {
    color: '#064E3B',
  },
  dayName: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.tertiary,
  },
  dayNameActive: {
    color: '#065F46',
  },
  timelineSection: {
    gap: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeColumn: {
    width: 62,
    alignItems: 'center',
    paddingTop: 8,
  },
  timeTextStart: {
    fontFamily: typography.families.mono,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  dottedConnector: {
    width: 1.5,
    height: 48,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    marginVertical: 4,
  },
  timeTextEnd: {
    fontFamily: typography.families.mono,
    fontSize: 10,
    color: colors.ink.tertiary,
  },
  taskCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    paddingTop: 10,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    position: 'relative',
  },
  cardTopNotch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  statusBadgeCompleted: {
    backgroundColor: '#065F46',
  },
  statusBadgeText: {
    fontFamily: typography.families.sans,
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarBg: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.ink.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: typography.families.mono,
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  taskIconSquareDone: {
    backgroundColor: '#065F46',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink.primary,
    lineHeight: 18,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskCategory: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyTasksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  emptyTasksTitle: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink.primary,
    marginBottom: 4,
  },
  emptyTasksSub: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.tertiary,
    textAlign: 'center',
  },
  floatingDock: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 50,
  },
  addTaskFab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.purple,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  addTaskFabText: {
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 24, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.ink.tertiary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: typography.families.sans,
    fontSize: 14,
    color: colors.ink.primary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  catChipsRow: {
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  catChipActive: {
    backgroundColor: colors.brand.purple,
  },
  catChipText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: colors.brand.purple,
  },
  notificationToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  notifToggleTextGroup: {
    flex: 1,
  },
  notifToggleTitle: {
    fontFamily: typography.families.heading,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  notifToggleSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  togglePill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  togglePillActive: {
    backgroundColor: colors.brand.purple,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  createTaskBtn: {
    backgroundColor: colors.brand.purple,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  createTaskBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Props = {
  visible: boolean;
  value: Date | null;
  /** Month shown when there is no value yet. */
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  onClose: () => void;
  onSelect: (date: Date) => void;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function DatePickerModal({
  visible,
  value,
  initialDate,
  minDate,
  maxDate,
  title = "Select Date",
  onClose,
  onSelect,
}: Props) {
  const base = value || initialDate || maxDate || new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());
  const [showYears, setShowYears] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setShowYears(false);
  }, [visible]);

  const minYear = minDate?.getFullYear() ?? 1900;
  const maxYear = maxDate?.getFullYear() ?? new Date().getFullYear() + 10;
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear]
  );

  const days = useMemo(() => {
    const leading = new Date(viewYear, viewMonth, 1).getDay();
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, i) => i + 1),
    ];
  }, [viewYear, viewMonth]);

  const isDisabled = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    return (minDate && date < startOfDay(minDate)) || (maxDate && date > startOfDay(maxDate));
  };

  const canGoPrev = viewYear > minYear || (viewYear === minYear && viewMonth > (minDate?.getMonth() ?? 0));
  const canGoNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < (maxDate?.getMonth() ?? 11));

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isSelected = (day: number) =>
    value?.getFullYear() === viewYear && value?.getMonth() === viewMonth && value?.getDate() === day;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.card} activeOpacity={1}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.nav}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} disabled={!canGoPrev || showYears} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={canGoPrev && !showYears ? COLORS.text : COLORS.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.monthYear} onPress={() => setShowYears(!showYears)}>
              <ThemedText style={styles.monthYearText}>
                {MONTHS[viewMonth]} {viewYear}
              </ThemedText>
              <Ionicons name={showYears ? "chevron-up" : "chevron-down"} size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => shiftMonth(1)} disabled={!canGoNext || showYears} hitSlop={10}>
              <Ionicons name="chevron-forward" size={22} color={canGoNext && !showYears ? COLORS.text : COLORS.border} />
            </TouchableOpacity>
          </View>

          {showYears ? (
            <FlatList
              style={styles.yearList}
              data={years}
              numColumns={4}
              keyExtractor={(year) => String(year)}
              initialScrollIndex={Math.max(0, Math.floor(years.indexOf(viewYear) / 4) - 2) * 4}
              getItemLayout={(_, index) => ({ length: 44, offset: 44 * Math.floor(index / 4), index })}
              renderItem={({ item: year }) => (
                <TouchableOpacity
                  style={[styles.yearCell, year === viewYear && styles.selected]}
                  onPress={() => {
                    setViewYear(year);
                    setShowYears(false);
                  }}
                >
                  <ThemedText style={[styles.cellText, year === viewYear && styles.selectedText]}>
                    {year}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          ) : (
            <>
              <View style={styles.row}>
                {WEEKDAYS.map((day) => (
                  <ThemedText key={day} style={[styles.cell, styles.weekday]}>
                    {day}
                  </ThemedText>
                ))}
              </View>
              <View style={styles.row}>
                {days.map((day, index) =>
                  day === null ? (
                    <View key={`empty-${index}`} style={styles.cell} />
                  ) : (
                    <TouchableOpacity
                      key={day}
                      style={[styles.cell, styles.dayCell, isSelected(day) && styles.selected]}
                      disabled={isDisabled(day)}
                      onPress={() => {
                        onSelect(new Date(viewYear, viewMonth, day));
                        onClose();
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.cellText,
                          isDisabled(day) && styles.disabledText,
                          isSelected(day) && styles.selectedText,
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  monthYear: { flexDirection: "row", alignItems: "center", gap: 4 },
  monthYearText: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
  row: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, height: 40, textAlign: "center", textAlignVertical: "center" },
  weekday: { fontSize: 12, fontWeight: "600", color: COLORS.gray, lineHeight: 40 },
  dayCell: { justifyContent: "center", alignItems: "center", borderRadius: 20 },
  cellText: { fontSize: 14, color: COLORS.text },
  selected: { backgroundColor: COLORS.primary },
  selectedText: { color: COLORS.white, fontWeight: "700" },
  disabledText: { color: COLORS.border },
  yearList: { maxHeight: 264 },
  yearCell: { width: "25%", height: 44, justifyContent: "center", alignItems: "center", borderRadius: 22 },
});

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ViewStyle,
  useColorScheme,
  useWindowDimensions
} from "react-native";

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { NOTES, Note } from "./data/Notesdata";
import { darkColors, lightColors } from "./data/colorsData";

const NOTE_COLORS = ["#EA7A53", "#EABB42", "#A8D672", "#99B7DA"];

const getRandomNoteColor = () => NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

export default function Index() {
  const [notes, setNotes] = useState<Note[]>(() =>
    NOTES.map((note) => ({
      ...note,
      accent: getRandomNoteColor(),
    }))
  );
  const [searchValue, setSearchValue] = useState("");
  const [focusedInput, setFocusedInput] = useState("");
  const { width } = useWindowDimensions();
  const systemColorScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<"list" | "editor">("list");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const isdarkMode = themeOverride ?? systemColorScheme === "dark";
  const isTablet = width >= 720;
  const colors = isdarkMode ? darkColors : lightColors;
  const themeStyles = useMemo(() => createThemeStyles(colors), [colors]);

  const filteredNotes = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((note) =>
      `${note.title} ${note.preview} ${note.timestamp}`.toLowerCase().includes(query)
    );
  }, [notes, searchValue]);

  const openNewNoteEditor = () => {
    setNoteTitle("");
    setNoteBody("");
    setFocusedInput("");
    setActiveView("editor");
  };

  const handleSaveNote = () => {
    const now = new Date();
    const trimmedTitle = noteTitle.trim();
    const trimmedBody = noteBody.trim();
    const newNote: Note = {
      id: `${now.getTime()}`,
      title: trimmedTitle || "Untitled note",
      preview: trimmedBody || "Start writing your new idea here.",
      timestamp: now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      accent: getRandomNoteColor(),
    };

    setNotes((currentNotes) => [newNote, ...currentNotes]);
    setActiveView("list");
  };

  const responsiveStyles = useMemo(() => StyleSheet.create({
    screenShell: {
      maxWidth: isTablet ? 1040 : 560,
      paddingHorizontal: isTablet ? 32 : 18,
    },
    editorShell: {
      flexGrow: 1,
      maxWidth: isTablet ? 1040 : "100%",
      paddingHorizontal: isTablet ? 32 : 0,
      width: "100%",
    },
  }),
    [isTablet]
  );

  const serachWrapperStyle: StyleProp<ViewStyle> = StyleSheet.flatten([
    styles.serachWrapper,
    themeStyles.inputSurface,
    focusedInput === "search" && themeStyles.focusedInputWrapper,
  ]);

  const titleInputStyle = StyleSheet.flatten([
    styles.titleInput,
    themeStyles.editorInput,
    focusedInput === "title" && themeStyles.focusedInputWrapper,
  ]);

  const bodyInputStyle = StyleSheet.flatten([
    styles.bodyInput,
    themeStyles.editorInput,
    focusedInput === "body" && themeStyles.focusedInputWrapper,
  ]);

  const screenStyles: StyleProp<ViewStyle> = StyleSheet.compose(
    styles.container,
    themeStyles.appBackground,
  );

  const noteCardTitleStyle = isdarkMode ? styles.noteTextLight : themeStyles.primaryText;
  const noteCardPreviewStyle = isdarkMode ? styles.noteTextLight : themeStyles.secondaryText;
  const noteCardMetaStyle = isdarkMode ? styles.noteTextLight : themeStyles.mutedText;

  const renderNoteCard = ({ item }: { item: Note }) => (
    <Pressable
      onPress={() => {
        setNoteTitle(item.title);
        setNoteBody(item.preview);
        setActiveView("editor");
      }}
      style={({ pressed }) => [
        styles.noteCard,
        themeStyles.card,
        { backgroundColor: item.accent },
        styles.noteCardShadow,
        isTablet && styles.tabletCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.noteCardContent}>
        <View style={styles.noteCardHeader}>
          <Text style={[styles.noteTitle, noteCardTitleStyle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={isdarkMode ? "#FFFFFF" : colors.mutedText} />
        </View>
        <Text style={[styles.notePreview, noteCardPreviewStyle]} numberOfLines={2}>
          {item.preview}
        </Text>
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={14} color={isdarkMode ? "#FFFFFF" : colors.mutedText} />
          <Text style={[styles.timestamp, noteCardMetaStyle]}>{item.timestamp}</Text>
        </View>
      </View>
    </Pressable>
  )

  const renderEditorScreen = () => (
    <SafeAreaView style={screenStyles}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={styles.keyboardView}
      >
        <FlatList
          style={styles.editorList}
          data={[{ id: 'editor' }]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.editorScroll, responsiveStyles.editorShell]}
          renderItem={() => (
            <View style={styles.editorLayout}>
              <View style={[styles.editorTopBar, themeStyles.editorPanel]}>
                <Pressable
                  onPress={() => setActiveView("list")}
                  style={({ pressed }) => [
                    styles.iconButton,
                    themeStyles.inputSurface,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="arrow-back" size={22} color={colors.primaryText} />
                </Pressable>

                <View style={styles.editorTopCopy}>
                  <Text style={[styles.editorKicker, themeStyles.mutedText]}>Writing area</Text>
                  <Text style={[styles.editorHeroTitle, themeStyles.primaryText]}>New note</Text>
                </View>

                <Pressable
                  onPress={handleSaveNote}
                  style={({ pressed }) => [
                    styles.saveButton,
                    themeStyles.saveButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="checkmark" size={19} color={colors.buttonText} />
                  <Text style={[styles.saveButtonText, themeStyles.addNoteButtonText]}>Save</Text>
                </Pressable>
              </View>

              <View style={styles.editorMetaRow}>
                <View style={[styles.editorPill, themeStyles.inputSurface]}>
                  <Ionicons name="calendar-outline" size={15} color={colors.mutedText} />
                  <Text style={[styles.editorPillText, themeStyles.mutedText]}>
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={[styles.editorPill, themeStyles.inputSurface]}>
                  <Ionicons name="create-outline" size={15} color={colors.mutedText} />
                  <Text style={[styles.editorPillText, themeStyles.mutedText]}>
                    {noteBody.trim().length} chars
                  </Text>
                </View>
              </View>

              <View style={[styles.editorForm, themeStyles.editorPanel]}>
                <Text style={[styles.fieldLabel, themeStyles.mutedText]}>Title</Text>
                <TextInput
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  placeholder="Note title"
                  placeholderTextColor={colors.placeholder}
                  style={titleInputStyle}
                  onFocus={() => setFocusedInput("title")}
                  onBlur={() => setFocusedInput("")}
                />

                <Text style={[styles.fieldLabel, themeStyles.mutedText]}>Content</Text>
                <TextInput
                  value={noteBody}
                  onChangeText={setNoteBody}
                  placeholder="Start writing your thoughts..."
                  placeholderTextColor={colors.placeholder}
                  style={bodyInputStyle}
                  multiline
                  textAlignVertical="top"
                  onFocus={() => setFocusedInput("body")}
                  onBlur={() => setFocusedInput("")}
                />
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderHomeScreen = () => (
    <SafeAreaView style={screenStyles}>
      {/* Header Section */}
      <View style={[styles.screenShell, responsiveStyles.screenShell]}>
        <View style={styles.headerSection}>
          <View>
            <Text style={[styles.title, isdarkMode ? styles.titleLight : themeStyles.primaryText]}>My Notes</Text>
          </View>

          <View style={styles.themeToggle}>
            <Ionicons name={isdarkMode ? "moon" : "sunny"} size={18} color={colors.primaryText} />
            <Switch
              value={isdarkMode}
              onValueChange={setThemeOverride}
              thumbColor={isdarkMode ? "#F8FAFC" : "#FFFFFF"}
              trackColor={{ false: "FFD6E8", true: "#00D7FF" }}
            />
          </View>
        </View>

        {/* hero section */}
        <View style={[styles.heroPanel, themeStyles.heroPanel]}>
          <View>
            <Text style={[styles.heroTitle, isdarkMode ? styles.titleLight : themeStyles.primaryText]}>Store every idea and late night thoughts</Text>
          </View>
          <View style={[styles.herobadges]}>
            <Text style={styles.heroBadgePink}>K</Text>
            <Text style={styles.heroBadgeCyan}>01</Text>
          </View>
        </View>

        {/* Add new note button */}
        <Pressable
          onPress={openNewNoteEditor}
          style={({ pressed }) => [styles.addNoteButton, themeStyles.addNoteButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={22} color={colors.buttonText} />
          <Text style={[styles.addNoteButtonText, themeStyles.addNoteButtonText]}>New note</Text>
        </Pressable>

        {/* Search box */}
        <View style={serachWrapperStyle}>
          <Ionicons name="search-outline" size={21} color={isdarkMode ? "#ffffff" : colors.mutedText} />
          <TextInput
            placeholder="Search notes by title"
            value={searchValue}
            onChangeText={setSearchValue}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, themeStyles.primaryText]}
            onFocus={() => setFocusedInput("search")}
            onBlur={() => setFocusedInput("")}
          />
        </View>

        {/* List of notes */}
        <FlatList
          key={isTablet ? "tablet-list" : "phone-list"}
          data={filteredNotes}
          renderItem={renderNoteCard}
          keyExtractor={(item) => item.id}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? styles.tabletColumn : undefined}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, themeStyles.primaryText]}>All notes</Text>
              <Text style={[styles.countText, themeStyles.mutedText]}>
                {filteredNotes.length} notes
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={[styles.emptyState, themeStyles.card]}>
              <Ionicons name="document-text-outline" size={32} color={colors.mutedText} />
              <Text style={[styles.emptyTitle, themeStyles.primaryText]}>No notes found</Text>
              <Text style={[styles.emptyState, themeStyles.secondaryText]}>
                Try another search term.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );

  return activeView === "editor" ? renderEditorScreen() : renderHomeScreen();
}

const createThemeStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    appBackground: {
      backgroundColor: colors.appBackground,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    heroPanel: {
      backgroundColor: colors.heroPanel,
      borderColor: colors.border,
      shadowColor: colors.heroShadow,
    },
    inputSurface: {
      backgroundColor: colors.inputSurface,
      borderColor: colors.border,
    },
    editorPanel: {
      backgroundColor: colors.heroPanel,
      borderColor: colors.border,
    },
    addNoteButton: {
      backgroundColor: colors.buttonSurface,
      borderColor: colors.border,
    },
    addNoteButtonText: {
      color: colors.buttonText,
    },
    saveButton: {
      backgroundColor: colors.buttonSurface,
      borderColor: colors.border,
    },
    focusedInputWrapper: {
      borderColor: colors.focusBorder,
    },
    editorInput: {
      backgroundColor: colors.inputSurface,
      borderColor: colors.border,
      color: colors.primaryText,
    },
    primaryText: {
      color: colors.primaryText,
    },
    secondaryText: {
      color: colors.secondaryText,
    },
    mutedText: {
      color: colors.mutedText,
    },
    hotText: {
      color: colors.hotText,
    },
    glassButton: {
      backgroundColor: "rgba(15, 23, 42, 0.38)",
      borderColor: "rgba(255, 255, 255, 0.28)",
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  screenShell: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    paddingTop: 16,
  },
  headerSection: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
  },
  themeToggle: {
    alignItems: "center",
    flexDirection: 'row',
    gap: 8,
  },
  heroPanel: {
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#FF2F8F",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 0,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  titleLight: {
    color: "#ffffff",
  },
  noteTextLight: {
    color: "#ffffff",
  },
  herobadges: {
    alignItems: "flex-end",
    gap: 8
  },
  heroBadgePink: {
    backgroundColor: "#FF2F8F",
    borderColor: "#201235",
    borderRadius: 6,
    borderWidth: 2,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 5,
    transform: [{ rotate: "4deg" }],
  },
  heroBadgeCyan: {
    backgroundColor: "#00D7FF",
    borderColor: "#201235",
    borderRadius: 6,
    borderWidth: 2,
    color: "#201235",
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: "-5deg" }],
  },
  addNoteButton: {
    alignItems: "center",
    backgroundColor: "#BEBCF2",
    borderColor: "#201235",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 14,
    paddingVertical: 14,
  },
  addNoteButtonText: {
    color: "#23192a",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.78
  },
  serachWrapper: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12
  },
  focusedInputWrapper: {
    borderColor: "#00d7ff",
    borderWidth: 2,
  },
  notesList: {
    gap: 12,
    paddingBottom: 28,
  },
  tabletColumn: {
    gap: 12,
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 14,
  },
  noteCard: {
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    minHeight: 128,
    overflow: "hidden",
    width: "100%",
  },
  noteCardShadow: {
    shadowColor: "#201235",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 0,
    elevation: 3,
  },
  tabletCard: {
    flex: 1,
  },
  noteCardContent: {
    flex: 1,
    padding: 16,
  },
  noteCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  notePreview: {
    fontSize: 14,
    lineHeight: 21,
  },
  timestampRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "700",
  },
  keyboardView: {
    flex: 1,
    width: "90%",
  },
  editorList: {
    flex: 1,
    width: "100%",
  },
  editorScroll: {
    alignSelf: "center",
    flexGrow: 1,
    paddingBottom: 0,
    width: "100%",
  },
  editorLayout: {
    flex: 1,
    gap: 10,
  },
  editorTopBar: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 12,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  editorTopCopy: {
    flex: 1,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  editorKicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  editorHeroTitle: {
    fontSize: 24,
    fontWeight: "900",
  },
  editorMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  editorPill: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  editorPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  editorForm: {
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    gap: 10,
    padding: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  titleInput: {
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: "800",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  bodyInput: {
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
});

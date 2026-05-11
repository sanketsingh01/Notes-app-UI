export type Note = {
    id: string;
    title: string;
    preview: string;
    timestamp: string;
    accent: string;
}

const currentDate = new Date();
const months: { [key: number]: string } = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
}
const timestamp: string = `${currentDate.getDate()}/${months[currentDate.getMonth()]}/${currentDate.getFullYear()}`;

export const NOTES: Note[] = [
    {
        id: "1",
        title: "Product ideas",
        preview:
            "Collect the strongest mobile UI ideas, note the main flows, and sketch the first simple version.",
        timestamp: timestamp,
        accent: "#EA7A53",
    },
    {
        id: "2",
        title: "React Native practice",
        preview:
            "Revise FlatList, TextInput, KeyboardAvoidingView, Pressable states, and responsive layout basics.",
        timestamp: timestamp,
        accent: "#EABB42",
    },
    {
        id: "3",
        title: "Weekend reading",
        preview:
            "Finish the design systems article and save notes about spacing, contrast, and typography.",
        timestamp: timestamp,
        accent: "#A8D672",
    },
    {
        id: "4",
        title: "Assignment checklist",
        preview:
            "Dark mode support, search filter, editor inputs, image header, and clean StyleSheet-based styling.",
        timestamp: timestamp,
        accent: "#99B7DA",
    },
    {
        id: "5",
        title: "Daily journal",
        preview:
            "Short reflection on what worked today, what felt difficult, and what to improve tomorrow.",
        timestamp: timestamp,
        accent: "#EA7A53",
    },
]

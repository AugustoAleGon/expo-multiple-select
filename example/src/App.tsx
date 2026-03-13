import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import MultiSelect from 'expo-multiple-select';

// --- Legacy-compatible usage (plain objects with _id/name) ---

const languages = [
  { _id: 'js', name: 'JavaScript' },
  { _id: 'ts', name: 'TypeScript' },
  { _id: 'py', name: 'Python' },
  { _id: 'go', name: 'Go' },
  { _id: 'rs', name: 'Rust' },
  { _id: 'rb', name: 'Ruby' },
  { _id: 'java', name: 'Java' },
  { _id: 'kt', name: 'Kotlin' },
];

// --- Typed usage with custom keys ---

interface Country {
  code: string;
  label: string;
  disabled?: boolean;
}

const countries: Country[] = [
  { code: 'us', label: 'United States' },
  { code: 'uk', label: 'United Kingdom' },
  { code: 'de', label: 'Germany' },
  { code: 'jp', label: 'Japan' },
  { code: 'br', label: 'Brazil' },
  { code: 'xx', label: 'Atlantis', disabled: true },
];

// --- Custom icon override usage ---

function CustomIcon({
  name,
  size = 20,
  color = '#000',
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const symbols: Record<string, string> = {
    'magnify': '\u{1F50D}',
    'close-circle': '\u{274C}',
    'check': '\u{2705}',
    'menu-down': '\u{25BC}',
    'menu-right': '\u{25B6}',
    'arrow-left': '\u{25C0}',
  };
  return <Text style={{ fontSize: size, color }}>{symbols[name] ?? name}</Text>;
}

export default function App() {
  const [selectedLanguages, setSelectedLanguages] = useState<
    (string | number)[]
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<(string | number)[]>(
    []
  );
  const [selectedWithIcons, setSelectedWithIcons] = useState<
    (string | number)[]
  >([]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>expo-multiple-select</Text>

        {/* Legacy-compatible multi-select */}
        <Text style={styles.heading}>Multi-select (legacy-compatible)</Text>
        <MultiSelect
          items={languages}
          selectedItems={selectedLanguages}
          onSelectedItemsChange={setSelectedLanguages}
          selectText="Pick languages"
          selectedText="chosen"
          searchInputPlaceholderText="Search languages..."
          submitButtonText="Done"
          tagBorderColor="#3498db"
          tagTextColor="#3498db"
          selectedItemIconColor="#3498db"
        />

        {/* Typed single-select with custom keys */}
        <Text style={styles.heading}>Single-select (typed, custom keys)</Text>
        <MultiSelect<Country>
          items={countries}
          selectedItems={selectedCountry}
          onSelectedItemsChange={setSelectedCountry}
          uniqueKey="code"
          displayKey="label"
          single
          selectText="Pick a country"
          searchInputPlaceholderText="Search countries..."
        />

        {/* Custom icon override */}
        <Text style={styles.heading}>Custom icon override</Text>
        <MultiSelect
          items={languages}
          selectedItems={selectedWithIcons}
          onSelectedItemsChange={setSelectedWithIcons}
          selectText="Pick with custom icons"
          renderIcon={(props) => (
            <CustomIcon
              name={props.name}
              size={props.size}
              color={props.color}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#333',
  },
});

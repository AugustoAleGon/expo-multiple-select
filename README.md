# expo-react-native-multiple-select

A multi-select component for React Native and Expo, rewritten in TypeScript. Inspired by [react-native-multiple-select](https://github.com/toystars/react-native-multiple-select).

## Installation

```sh
npm install expo-react-native-multiple-select
```

### Expo projects

No extra setup needed. The component uses `@expo/vector-icons` for icons, which is included in the Expo SDK.

### Bare React Native projects

Install `react-native-vector-icons` as a fallback:

```sh
npm install react-native-vector-icons
```

Follow the [react-native-vector-icons installation guide](https://github.com/oblador/react-native-vector-icons#installation) for native linking.

### Custom icons

You can skip both icon libraries entirely by providing your own icons via `IconComponent` or `renderIcon`. See [Custom Icons](#custom-icons) below.

## Usage

### Basic multi-select

```tsx
import { useState } from 'react';
import MultiSelect from 'expo-react-native-multiple-select';

const items = [
  { _id: '1', name: 'JavaScript' },
  { _id: '2', name: 'TypeScript' },
  { _id: '3', name: 'Python' },
  { _id: '4', name: 'Go' },
];

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <MultiSelect
      items={items}
      selectedItems={selected}
      onSelectedItemsChange={setSelected}
      selectText="Pick languages"
      searchInputPlaceholderText="Search languages..."
      submitButtonText="Done"
    />
  );
}
```

### Single select

```tsx
<MultiSelect
  items={items}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  single
  selectText="Pick one"
/>
```

### Typed usage with custom keys

```tsx
interface Fruit {
  id: string;
  label: string;
  disabled?: boolean;
}

const fruits: Fruit[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry', disabled: true },
];

<MultiSelect<Fruit>
  items={fruits}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  uniqueKey="id"
  displayKey="label"
/>
```

### Custom icons

Override all icons with a component:

```tsx
import { Ionicons } from '@expo/vector-icons';

<MultiSelect
  items={items}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  IconComponent={Ionicons}
/>
```

Or use a render function for full control:

```tsx
<MultiSelect
  items={items}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  renderIcon={({ name, size, color, style }) => (
    <MyCustomIcon name={name} size={size} color={color} style={style} />
  )}
/>
```

Override only the search icon:

```tsx
<MultiSelect
  items={items}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  searchIcon={<Ionicons name="search" size={20} color="#999" />}
/>
```

### Imperative methods via ref

```tsx
import { useRef } from 'react';
import MultiSelect from 'expo-react-native-multiple-select';
import type { MultiSelectHandle } from 'expo-react-native-multiple-select';

function MyComponent() {
  const ref = useRef<MultiSelectHandle>(null);

  return (
    <>
      <MultiSelect
        ref={ref}
        items={items}
        selectedItems={selected}
        onSelectedItemsChange={setSelected}
      />
      <Button title="Clear all" onPress={() => ref.current?._removeAllItems()} />
      <Button title="Toggle" onPress={() => ref.current?._toggleSelector()} />
    </>
  );
}
```

### Add new items inline

```tsx
<MultiSelect
  items={items}
  selectedItems={selected}
  onSelectedItemsChange={setSelected}
  canAddItems
  onAddItem={(updatedItems) => {
    // updatedItems includes the newly created item
    setItems(updatedItems);
  }}
/>
```

## Props

### Core

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | **required** | Array of item objects |
| `selectedItems` | `(string \| number)[]` | `[]` | Array of selected item keys |
| `onSelectedItemsChange` | `(items: (string \| number)[]) => void` | **required** | Called when selection changes |
| `uniqueKey` | `string` | `'_id'` | Property name used as unique identifier |
| `displayKey` | `string` | `'name'` | Property name used for display text |
| `single` | `boolean` | `false` | Single-select mode |

### Text

| Prop | Type | Default |
|------|------|---------|
| `selectText` | `string` | `'Select'` |
| `selectedText` | `string` | `'selected'` |
| `searchInputPlaceholderText` | `string` | `'Search'` |
| `submitButtonText` | `string` | `'Submit'` |
| `noItemsText` | `string` | `'No items to display.'` |

### Appearance

| Prop | Type | Default |
|------|------|---------|
| `fontSize` | `number` | `14` |
| `itemFontSize` | `number` | `16` |
| `textColor` | `string` | `'#525966'` |
| `tagBorderColor` | `string` | `'#00A5FF'` |
| `tagTextColor` | `string` | `'#00A5FF'` |
| `tagRemoveIconColor` | `string` | `'#C62828'` |
| `selectedItemTextColor` | `string` | `'#00A5FF'` |
| `selectedItemIconColor` | `string` | `'#00A5FF'` |
| `itemTextColor` | `string` | `'#525966'` |
| `submitButtonColor` | `string` | `'#CCC'` |

### Fonts

| Prop | Type | Default |
|------|------|---------|
| `fontFamily` | `string` | `''` |
| `altFontFamily` | `string` | `''` |
| `selectedItemFontFamily` | `string` | `''` |
| `itemFontFamily` | `string` | `''` |

### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fixedHeight` | `boolean` | `false` | Fixed 250px dropdown height |
| `hideTags` | `boolean` | `false` | Hide selected item tags |
| `hideSubmitButton` | `boolean` | `false` | Hide submit button |
| `hideDropdown` | `boolean` | `false` | Hide back arrow icon |
| `removeSelected` | `boolean` | `false` | Hide already-selected items from list |

### Search & Add

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `canAddItems` | `boolean` | `false` | Allow adding new items via search |
| `onAddItem` | `(items: T[]) => void` | -- | Called with updated items array |
| `onChangeInput` | `(text: string) => void` | -- | Called when search input changes |
| `filterMethod` | `'partial' \| 'full'` | `'partial'` | Search filter strategy |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onClearSelector` | `() => void` | Called when selector closes via back arrow |
| `onToggleList` | `() => void` | Called when selector opens or closes |

### Icons

| Prop | Type | Description |
|------|------|-------------|
| `searchIcon` | `ReactNode` | Custom search icon (overrides all other icon resolution for search only) |
| `IconComponent` | `ComponentType<IconAdapterProps>` | Custom icon component for all icons |
| `renderIcon` | `(props: IconAdapterProps) => ReactNode` | Render function for all icons |

Icon resolution precedence: `searchIcon` (search only) > `renderIcon` > `IconComponent` > `@expo/vector-icons` > `react-native-vector-icons`.

### Style overrides

| Prop | Type |
|------|------|
| `tagContainerStyle` | `StyleProp<ViewStyle>` |
| `styleMainWrapper` | `StyleProp<ViewStyle>` |
| `styleSelectorContainer` | `StyleProp<ViewStyle>` |
| `styleInputGroup` | `StyleProp<ViewStyle>` |
| `styleItemsContainer` | `StyleProp<ViewStyle>` |
| `styleListContainer` | `StyleProp<ViewStyle>` |
| `styleDropdownMenu` | `StyleProp<ViewStyle>` |
| `styleDropdownMenuSubsection` | `StyleProp<ViewStyle>` |
| `styleRowList` | `StyleProp<ViewStyle>` |
| `styleTextDropdown` | `StyleProp<TextStyle>` |
| `styleTextDropdownSelected` | `StyleProp<TextStyle>` |
| `styleTextTag` | `StyleProp<TextStyle>` |
| `styleIndicator` | `StyleProp<TextStyle>` |
| `searchInputStyle` | `StyleProp<TextStyle>` |

### Input passthrough

| Prop | Type | Description |
|------|------|-------------|
| `textInputProps` | `Partial<TextInputProps>` | Extra props for the search TextInput |
| `flatListProps` | `Partial<FlatListProps<T>>` | Extra props for the items FlatList |

## Ref methods

| Method | Description |
|--------|-------------|
| `_removeAllItems()` | Clear all selected items |
| `_removeItem(item)` | Remove a specific item from selection |
| `_toggleSelector()` | Open or close the dropdown |
| `getSelectedItemsExt(items?)` | Returns a React element rendering selected item tags |

## Migration from react-native-multiple-select

This package is a TypeScript rewrite of `react-native-multiple-select`. All legacy props and behaviors are preserved.

**What changed:**

- Default icon library is `@expo/vector-icons` instead of `react-native-vector-icons`
- Written in TypeScript with full type definitions
- Functional component instead of class component
- New `IconComponent` and `renderIcon` props for custom icon overrides
- Generic type support: `MultiSelect<T>` for typed item objects
- No lodash dependency

**What stayed the same:**

- All prop names and default values
- `uniqueKey` / `displayKey` pattern
- Single-select and multi-select behavior
- Search, filter, and add-item flows
- Style override props
- Ref methods (`_removeAllItems`, `_removeItem`, `_toggleSelector`, `getSelectedItemsExt`)

**Minimal migration:**

```diff
- import MultiSelect from 'react-native-multiple-select';
+ import MultiSelect from 'expo-react-native-multiple-select';
```

If you were using `react-native-vector-icons` directly and are now on Expo, no other changes are needed -- icons resolve automatically.

## Exports

```tsx
// Default export
import MultiSelect from 'expo-react-native-multiple-select';

// Named type exports
import type {
  MultiSelectProps,
  MultiSelectHandle,
  ItemType,
  IconAdapterProps,
  RenderIconFn,
} from 'expo-react-native-multiple-select';

// Color pack (for matching component theme)
import { colorPack } from 'expo-react-native-multiple-select';
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

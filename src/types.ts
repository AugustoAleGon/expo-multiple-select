import type { ReactNode, ReactElement, ComponentType } from 'react';
import type {
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  FlatListProps as RNFlatListProps,
} from 'react-native';

export type ItemType = Record<string, any>;

export interface IconAdapterProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export type RenderIconFn = (props: IconAdapterProps) => ReactNode;

export interface MultiSelectProps<T extends ItemType = ItemType> {
  // Core
  items: T[];
  selectedItems?: Array<string | number>;
  onSelectedItemsChange: (items: Array<string | number>) => void;
  uniqueKey?: keyof T & string;
  displayKey?: keyof T & string;
  single?: boolean;

  // Text
  selectText?: string;
  selectedText?: string;
  searchInputPlaceholderText?: string;
  submitButtonText?: string;
  noItemsText?: string;

  // Appearance
  fontSize?: number;
  itemFontSize?: number;
  textColor?: string;
  tagBorderColor?: string;
  tagTextColor?: string;
  tagRemoveIconColor?: string;
  selectedItemTextColor?: string;
  selectedItemIconColor?: string;
  itemTextColor?: string;
  submitButtonColor?: string;

  // Fonts
  fontFamily?: string;
  altFontFamily?: string;
  selectedItemFontFamily?: string;
  itemFontFamily?: string;

  // Layout
  fixedHeight?: boolean;
  hideTags?: boolean;
  hideSubmitButton?: boolean;
  hideDropdown?: boolean;
  removeSelected?: boolean;

  // Search & Add
  canAddItems?: boolean;
  onAddItem?: (items: T[]) => void;
  onChangeInput?: (searchTerm: string) => void;
  filterMethod?: 'partial' | 'full';

  // Callbacks
  onClearSelector?: () => void;
  onToggleList?: () => void;

  // Icons
  searchIcon?: ReactNode;
  IconComponent?: ComponentType<IconAdapterProps>;
  renderIcon?: RenderIconFn;

  // Style overrides
  tagContainerStyle?: StyleProp<ViewStyle>;
  styleMainWrapper?: StyleProp<ViewStyle>;
  styleSelectorContainer?: StyleProp<ViewStyle>;
  styleInputGroup?: StyleProp<ViewStyle>;
  styleItemsContainer?: StyleProp<ViewStyle>;
  styleListContainer?: StyleProp<ViewStyle>;
  styleDropdownMenu?: StyleProp<ViewStyle>;
  styleDropdownMenuSubsection?: StyleProp<ViewStyle>;
  styleRowList?: StyleProp<ViewStyle>;
  styleTextDropdown?: StyleProp<TextStyle>;
  styleTextDropdownSelected?: StyleProp<TextStyle>;
  styleTextTag?: StyleProp<TextStyle>;
  styleIndicator?: StyleProp<TextStyle>;

  // Input props
  textInputProps?: Partial<TextInputProps>;
  flatListProps?: Partial<RNFlatListProps<T>>;
  searchInputStyle?: StyleProp<TextStyle>;
}

export interface MultiSelectHandle {
  _removeAllItems: () => void;
  _removeItem: (item: ItemType) => void;
  _toggleSelector: () => void;
  getSelectedItemsExt: (
    optionalSelectedItems?: Array<string | number>
  ) => ReactElement;
}

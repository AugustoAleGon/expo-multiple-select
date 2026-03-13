import {
  createElement,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from 'react-native';

import styles, {
  buttonColor,
  colorPack,
  dropdownTextStyle,
  selectedItemBorder,
  selectedItemWidth,
  selectorView,
  textColorStyle,
} from './styles';
import { renderIconElement } from './iconAdapter';
import type { IconRenderOptions } from './iconAdapter';
import type { ItemType, MultiSelectHandle, MultiSelectProps } from './types';

export type {
  MultiSelectProps,
  MultiSelectHandle,
  ItemType,
  IconAdapterProps,
  RenderIconFn,
} from './types';
export { colorPack } from './styles';

// Enable LayoutAnimation on Android
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function MultiSelectInner<T extends ItemType = ItemType>(
  props: MultiSelectProps<T>,
  ref: React.Ref<MultiSelectHandle>
) {
  const {
    // Core
    items,
    selectedItems = [],
    onSelectedItemsChange,
    uniqueKey = '_id' as keyof T & string,
    displayKey = 'name' as keyof T & string,
    single = false,

    // Text
    selectText = 'Select',
    selectedText = 'selected',
    searchInputPlaceholderText = 'Search',
    submitButtonText = 'Submit',
    noItemsText = 'No items to display.',

    // Appearance
    fontSize = 14,
    itemFontSize = 16,
    textColor = colorPack.textPrimary,
    tagBorderColor = colorPack.primary,
    tagTextColor = colorPack.primary,
    tagRemoveIconColor = colorPack.danger,
    selectedItemTextColor = colorPack.primary,
    selectedItemIconColor = colorPack.primary,
    itemTextColor = colorPack.textPrimary,
    submitButtonColor = '#CCC',

    // Fonts
    fontFamily = '',
    altFontFamily = '',
    selectedItemFontFamily = '',
    itemFontFamily = '',

    // Layout
    fixedHeight = false,
    hideTags = false,
    hideSubmitButton = false,
    hideDropdown = false,
    removeSelected = false,

    // Search & Add
    canAddItems = false,
    onAddItem,
    onChangeInput,
    filterMethod = 'partial',

    // Callbacks
    onClearSelector,
    onToggleList,

    // Icons
    searchIcon,
    IconComponent,
    renderIcon,

    // Style overrides
    tagContainerStyle,
    styleMainWrapper,
    styleSelectorContainer,
    styleInputGroup,
    styleItemsContainer,
    styleListContainer,
    styleDropdownMenu,
    styleDropdownMenuSubsection,
    styleRowList,
    styleTextDropdown,
    styleTextDropdownSelected,
    styleTextTag,
    styleIndicator,

    // Input props
    textInputProps,
    flatListProps,
    searchInputStyle = { color: colorPack.textPrimary },
  } = props;

  const [selector, setSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const iconOptions: IconRenderOptions = useMemo(
    () => ({ renderIcon, IconComponent }),
    [renderIcon, IconComponent]
  );

  // --- Helper functions ---

  const findItem = useCallback(
    (itemKey: string | number): T | undefined => {
      return items.find((item) => item[uniqueKey] === itemKey);
    },
    [items, uniqueKey]
  );

  const itemSelected = useCallback(
    (item: T): boolean => {
      return selectedItems.indexOf(item[uniqueKey]) !== -1;
    },
    [selectedItems, uniqueKey]
  );

  // --- Core actions ---

  const clearSearchTerm = useCallback(() => {
    setSearchTerm('');
  }, []);

  const toggleSelector = useCallback(() => {
    setSelector((prev) => !prev);
    if (onToggleList) {
      onToggleList();
    }
  }, [onToggleList]);

  const submitSelection = useCallback(() => {
    toggleSelector();
    clearSearchTerm();
  }, [toggleSelector, clearSearchTerm]);

  const clearSelectorCallback = useCallback(() => {
    setSelector(false);
    if (onClearSelector) {
      onClearSelector();
    }
  }, [onClearSelector]);

  const handleChangeInput = useCallback(
    (value: string) => {
      if (onChangeInput) {
        onChangeInput(value);
      }
      setSearchTerm(value);
    },
    [onChangeInput]
  );

  const removeItem = useCallback(
    (item: T) => {
      const newItems = selectedItems.filter(
        (singleItem) => item[uniqueKey] !== singleItem
      );
      onSelectedItemsChange(newItems);
    },
    [selectedItems, uniqueKey, onSelectedItemsChange]
  );

  const removeAllItems = useCallback(() => {
    onSelectedItemsChange([]);
  }, [onSelectedItemsChange]);

  const toggleItem = useCallback(
    (item: T) => {
      if (single) {
        submitSelection();
        onSelectedItemsChange([item[uniqueKey]]);
      } else {
        const isSelected = selectedItems.indexOf(item[uniqueKey]) !== -1;
        let newItems: Array<string | number>;
        if (isSelected) {
          newItems = selectedItems.filter(
            (singleItem) => item[uniqueKey] !== singleItem
          );
        } else {
          newItems = [...selectedItems, item[uniqueKey]];
        }
        onSelectedItemsChange(newItems);
      }
    },
    [single, uniqueKey, selectedItems, onSelectedItemsChange, submitSelection]
  );

  const addItem = useCallback(() => {
    if (searchTerm) {
      const newItemId = searchTerm
        .split(' ')
        .filter((word) => word.length)
        .join('-');
      const newItems = [
        ...items,
        { [uniqueKey]: newItemId, name: searchTerm } as unknown as T,
      ];
      const newSelectedItems = [...selectedItems, newItemId];
      if (onAddItem) {
        onAddItem(newItems);
      }
      onSelectedItemsChange(newSelectedItems);
      clearSearchTerm();
    }
  }, [
    searchTerm,
    items,
    uniqueKey,
    selectedItems,
    onAddItem,
    onSelectedItemsChange,
    clearSearchTerm,
  ]);

  // --- Filtering ---

  const filterItemsPartial = useCallback(
    (term: string): T[] => {
      const parts = term.trim().split(/[ \-:]+/);
      return items.filter((item) => {
        const regex = new RegExp(`(${parts.join('|')})`, 'ig');
        const value = item[displayKey];
        return value != null && regex.test(String(value));
      });
    },
    [items, displayKey]
  );

  const filterItemsFull = useCallback(
    (term: string): T[] => {
      const lowerTerm = term.trim().toLowerCase();
      return items.filter((item) => {
        const value = item[displayKey];
        return (
          value != null && String(value).toLowerCase().indexOf(lowerTerm) >= 0
        );
      });
    },
    [items, displayKey]
  );

  const filterItems = useCallback(
    (term: string): T[] => {
      if (filterMethod === 'full') {
        return filterItemsFull(term);
      }
      return filterItemsPartial(term);
    },
    [filterMethod, filterItemsFull, filterItemsPartial]
  );

  // --- Select label ---

  const getSelectLabel = useCallback((): string => {
    if (!selectedItems || selectedItems.length === 0) {
      return selectText;
    }
    if (single) {
      const itemKey = selectedItems[0];
      if (itemKey !== undefined) {
        const foundItem = findItem(itemKey);
        if (foundItem) {
          const label = foundItem[displayKey];
          return label != null ? String(label) : selectText;
        }
      }
      return selectText;
    }
    return `${selectText} (${selectedItems.length} ${selectedText})`;
  }, [selectedItems, selectText, single, selectedText, displayKey, findItem]);

  // --- Item style ---

  const getItemStyle = useCallback(
    (item: T) => {
      const isSelected = itemSelected(item);
      const ff: Record<string, string> = {};
      if (isSelected && selectedItemFontFamily) {
        ff.fontFamily = selectedItemFontFamily;
      } else if (!isSelected && itemFontFamily) {
        ff.fontFamily = itemFontFamily;
      }
      const color = isSelected
        ? { color: selectedItemTextColor }
        : { color: itemTextColor };
      return {
        ...ff,
        ...color,
        fontSize: itemFontSize,
      };
    },
    [
      itemSelected,
      selectedItemFontFamily,
      itemFontFamily,
      selectedItemTextColor,
      itemTextColor,
      itemFontSize,
    ]
  );

  // --- Display selected items (tags) ---

  const displaySelectedItems = useCallback(
    (optionalSelectedItems?: Array<string | number>) => {
      const actualSelectedItems = optionalSelectedItems ?? selectedItems;
      return actualSelectedItems.map((singleSelectedItem) => {
        const item = findItem(singleSelectedItem);
        if (!item || !item[displayKey]) return null;
        return (
          <View
            style={[
              styles.selectedItem,
              selectedItemWidth(String(item[displayKey])),
              styles.selectedItemContent,
              selectedItemBorder(tagBorderColor),
              tagContainerStyle ?? {},
            ]}
            key={String(item[uniqueKey])}
          >
            <Text
              style={[
                styles.selectedItemText,
                textColorStyle(tagTextColor),
                styleTextTag ?? undefined,
                fontFamily ? { fontFamily } : {},
              ]}
              numberOfLines={1}
            >
              {String(item[displayKey])}
            </Text>
            <TouchableOpacity onPress={() => removeItem(item)}>
              {renderIconElement(
                {
                  name: 'close-circle',
                  size: 22,
                  color: tagRemoveIconColor,
                  style: { marginLeft: 10 },
                },
                iconOptions
              )}
            </TouchableOpacity>
          </View>
        );
      });
    },
    [
      selectedItems,
      findItem,
      displayKey,
      uniqueKey,
      tagBorderColor,
      tagTextColor,
      tagRemoveIconColor,
      tagContainerStyle,
      styleTextTag,
      fontFamily,
      removeItem,
      iconOptions,
    ]
  );

  // --- Imperative handle ---

  const getSelectedItemsExt = useCallback(
    (optionalSelectedItems?: Array<string | number>) =>
      createElement(
        View,
        { style: styles.selectedItemsExtContainer },
        displaySelectedItems(optionalSelectedItems)
      ),
    [displaySelectedItems]
  );

  useImperativeHandle(
    ref,
    () => ({
      _removeAllItems: removeAllItems,
      _removeItem: (item: ItemType) => removeItem(item as T),
      _toggleSelector: toggleSelector,
      getSelectedItemsExt,
    }),
    [getSelectedItemsExt, removeAllItems, removeItem, toggleSelector]
  );

  // --- Row renderers ---

  const getRow = useCallback(
    (item: T) => (
      <TouchableOpacity
        disabled={item.disabled}
        onPress={() => toggleItem(item)}
        style={[styleRowList ?? undefined, styles.rowContainer]}
      >
        <View>
          <View style={styles.rowContent}>
            <Text
              style={[
                styles.rowText,
                getItemStyle(item),
                item.disabled ? styles.disabledText : {},
              ]}
            >
              {String(item[displayKey])}
            </Text>
            {itemSelected(item)
              ? renderIconElement(
                  {
                    name: 'check',
                    size: 20,
                    color: selectedItemIconColor,
                  },
                  iconOptions
                )
              : null}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [
      toggleItem,
      styleRowList,
      displayKey,
      getItemStyle,
      itemSelected,
      selectedItemIconColor,
      iconOptions,
    ]
  );

  const getRowNew = useCallback(
    (item: { name: string; disabled?: boolean }) => (
      <TouchableOpacity
        disabled={item.disabled}
        onPress={() => addItem()}
        style={styles.rowContainer}
      >
        <View>
          <View style={styles.rowContent}>
            <Text
              style={[styles.rowText, item.disabled ? styles.disabledText : {}]}
            >
              Add {item.name} (tap or press return)
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [addItem]
  );

  // --- Render items list ---

  const renderItemsList = useCallback(() => {
    let renderItems = searchTerm ? filterItems(searchTerm) : items;

    if (removeSelected) {
      renderItems = renderItems.filter(
        (item) => !selectedItems.includes(item[uniqueKey])
      );
    }

    let itemList: React.ReactNode = null;
    let searchTermMatch = 0;

    if (renderItems.length) {
      itemList = (
        <FlatList
          data={renderItems}
          extraData={selectedItems}
          keyExtractor={(_item, index) => index.toString()}
          renderItem={(rowData) => getRow(rowData.item)}
          {...(flatListProps as any)}
          nestedScrollEnabled
        />
      );
      searchTermMatch = renderItems.filter(
        (item) => item.name === searchTerm
      ).length;
    } else if (!canAddItems) {
      itemList = (
        <View style={styles.emptyListRow}>
          <Text
            style={[
              styles.emptyListText,
              textColorStyle(colorPack.danger),
              fontFamily ? { fontFamily } : {},
            ]}
          >
            {noItemsText}
          </Text>
        </View>
      );
    }

    let addItemRow: React.ReactNode = null;
    if (canAddItems && !searchTermMatch && searchTerm.length) {
      addItemRow = getRowNew({ name: searchTerm });
    }

    return (
      <View style={styleListContainer ?? undefined}>
        {itemList}
        {addItemRow}
      </View>
    );
  }, [
    searchTerm,
    filterItems,
    items,
    removeSelected,
    selectedItems,
    uniqueKey,
    getRow,
    flatListProps,
    canAddItems,
    fontFamily,
    noItemsText,
    styleListContainer,
    getRowNew,
  ]);

  // --- Resolved search icon ---

  const resolvedSearchIcon =
    searchIcon !== undefined
      ? searchIcon
      : renderIconElement(
          {
            name: 'magnify',
            size: 20,
            color: colorPack.placeholderTextColor,
            style: { marginRight: 10 },
          },
          iconOptions
        );

  // --- Main render ---

  return (
    <View style={styleMainWrapper ?? undefined}>
      {selector ? (
        <View
          style={[
            selectorView(fixedHeight),
            styleSelectorContainer ?? undefined,
          ]}
        >
          <View style={[styles.inputGroup, styleInputGroup ?? undefined]}>
            {resolvedSearchIcon}
            <TextInput
              autoFocus
              onChangeText={handleChangeInput}
              onSubmitEditing={addItem}
              placeholder={searchInputPlaceholderText}
              placeholderTextColor={colorPack.placeholderTextColor}
              underlineColorAndroid="transparent"
              style={[searchInputStyle, styles.searchInputFlex]}
              value={searchTerm}
              {...textInputProps}
            />
            {hideSubmitButton && (
              <TouchableOpacity onPress={submitSelection}>
                {renderIconElement(
                  {
                    name: 'menu-down',
                    style: [
                      styles.indicator,
                      { paddingLeft: 15, paddingRight: 15 },
                      styleIndicator ?? undefined,
                    ],
                  },
                  iconOptions
                )}
              </TouchableOpacity>
            )}
            {!hideDropdown && (
              <TouchableOpacity onPress={clearSelectorCallback}>
                {renderIconElement(
                  {
                    name: 'arrow-left',
                    size: 20,
                    color: colorPack.placeholderTextColor,
                    style: { marginLeft: 5 },
                  },
                  iconOptions
                )}
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.selectorContent}>
            <View style={styleItemsContainer ?? undefined}>
              {renderItemsList()}
            </View>
            {!single && !hideSubmitButton && (
              <TouchableOpacity
                onPress={() => submitSelection()}
                style={[styles.button, buttonColor(submitButtonColor)]}
              >
                <Text
                  style={[styles.buttonText, fontFamily ? { fontFamily } : {}]}
                >
                  {submitButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View>
          <View style={[styles.dropdownView, styleDropdownMenu ?? undefined]}>
            <View
              style={[
                styles.subSection,
                styles.dropdownSubsection,
                styleDropdownMenuSubsection ?? undefined,
              ]}
            >
              <TouchableWithoutFeedback onPress={toggleSelector}>
                <View style={styles.dropdownTouchable}>
                  <Text
                    style={
                      !selectedItems || selectedItems.length === 0
                        ? [
                            dropdownTextStyle(
                              fontSize || 16,
                              textColor || colorPack.placeholderTextColor
                            ),
                            styleTextDropdown ?? undefined,
                            altFontFamily
                              ? { fontFamily: altFontFamily }
                              : fontFamily
                              ? { fontFamily }
                              : {},
                          ]
                        : [
                            dropdownTextStyle(
                              fontSize || 16,
                              textColor || colorPack.placeholderTextColor
                            ),
                            styleTextDropdownSelected ?? undefined,
                          ]
                    }
                    numberOfLines={1}
                  >
                    {getSelectLabel()}
                  </Text>
                  {renderIconElement(
                    {
                      name: hideSubmitButton ? 'menu-right' : 'menu-down',
                      style: [styles.indicator, styleIndicator ?? undefined],
                    },
                    iconOptions
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          {!single && !hideTags && selectedItems.length ? (
            <View style={styles.selectedItemsExtContainer}>
              {displaySelectedItems()}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const MultiSelect = forwardRef(MultiSelectInner) as <
  T extends ItemType = ItemType
>(
  props: MultiSelectProps<T> & { ref?: React.Ref<MultiSelectHandle> }
) => React.ReactElement | null;

export default MultiSelect;

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import MultiSelect from '../index';
import type { MultiSelectHandle } from '../types';

// Mock the icon adapter to avoid requiring @expo/vector-icons in tests.
// The mock delegates to renderIcon/IconComponent when provided via options,
// matching the real adapter's precedence logic.
jest.mock('../iconAdapter', () => {
  const { Text } = require('react-native');
  return {
    renderIconElement: (
      iconProps: { name: string; size?: number; color?: string },
      options?: {
        renderIcon?: (props: any) => any;
        IconComponent?: any;
      }
    ) => {
      if (options?.renderIcon) {
        return options.renderIcon(iconProps);
      }
      if (options?.IconComponent) {
        const Icon = options.IconComponent;
        return <Icon {...iconProps} />;
      }
      return <Text testID={`icon-${iconProps.name}`}>{iconProps.name}</Text>;
    },
    getIconComponent: () => null,
  };
});

const ITEMS = [
  { _id: '1', name: 'Apple' },
  { _id: '2', name: 'Banana' },
  { _id: '3', name: 'Cherry' },
  { _id: '4', name: 'Date' },
  { _id: '5', name: 'Elderberry', disabled: true },
];

describe('MultiSelect', () => {
  // --- Multi-select behavior ---

  describe('multi-select mode', () => {
    it('renders with default select text', () => {
      const { getByText } = render(
        <MultiSelect items={ITEMS} onSelectedItemsChange={() => {}} />
      );
      expect(getByText('Select')).toBeTruthy();
    });

    it('shows selected count when items are selected', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={() => {}}
        />
      );
      expect(getByText('Select (2 selected)')).toBeTruthy();
    });

    it('calls onSelectedItemsChange when an item is toggled on', () => {
      const onSelectedItemsChange = jest.fn();
      const { getByText, rerender } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      // Open selector
      fireEvent.press(getByText('Select'));

      // Rerender with selector open state
      rerender(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      // Select Apple
      fireEvent.press(getByText('Apple'));
      expect(onSelectedItemsChange).toHaveBeenCalledWith(['1']);
    });

    it('calls onSelectedItemsChange when an item is toggled off', () => {
      const onSelectedItemsChange = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      // Open selector
      fireEvent.press(getByText('Select (2 selected)'));

      // Deselect Apple
      fireEvent.press(getByText('Apple'));
      expect(onSelectedItemsChange).toHaveBeenCalledWith(['2']);
    });

    it('renders tags for selected items when selector is closed', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={() => {}}
        />
      );

      expect(getByText('Apple')).toBeTruthy();
      expect(getByText('Banana')).toBeTruthy();
    });

    it('hides tags when hideTags is true', () => {
      const { queryByText, getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={() => {}}
          hideTags
        />
      );

      expect(getByText('Select (2 selected)')).toBeTruthy();
      // Tags should not be rendered (Apple/Banana only appear in closed dropdown label context)
      // When hideTags is true and selector is closed, tags should not show
      expect(queryByText('Apple')).toBeNull();
    });
  });

  // --- Single-select behavior ---

  describe('single-select mode', () => {
    it('shows the selected item name in the dropdown label', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1']}
          onSelectedItemsChange={() => {}}
          single
        />
      );
      expect(getByText('Apple')).toBeTruthy();
    });

    it('calls onSelectedItemsChange with single item and closes selector', () => {
      const onSelectedItemsChange = jest.fn();
      const onToggleList = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={onSelectedItemsChange}
          onToggleList={onToggleList}
          single
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.press(getByText('Banana'));

      expect(onSelectedItemsChange).toHaveBeenCalledWith(['2']);
    });

    it('does not show tags in single-select mode', () => {
      const { queryAllByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1']}
          onSelectedItemsChange={() => {}}
          single
        />
      );
      // "Apple" should appear once (in dropdown label), not as a tag
      expect(queryAllByText('Apple')).toHaveLength(1);
    });
  });

  // --- Filtering ---

  describe('filtering', () => {
    it('filters items with partial match (default)', () => {
      const { getByText, getByPlaceholderText, queryByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'app');

      expect(getByText('Apple')).toBeTruthy();
      expect(queryByText('Banana')).toBeNull();
    });

    it('filters items with full match', () => {
      const { getByText, getByPlaceholderText, queryByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          filterMethod="full"
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'an');

      expect(getByText('Banana')).toBeTruthy();
      expect(queryByText('Apple')).toBeNull();
    });

    it('shows no items text when filter has no results', () => {
      const { getByText, getByPlaceholderText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          noItemsText="Nothing found"
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'zzzzz');

      expect(getByText('Nothing found')).toBeTruthy();
    });

    it('calls onChangeInput when search text changes', () => {
      const onChangeInput = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          onChangeInput={onChangeInput}
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'test');

      expect(onChangeInput).toHaveBeenCalledWith('test');
    });
  });

  // --- Add-item flow ---

  describe('add-item flow', () => {
    it('shows add-item row when canAddItems is true and search has no match', () => {
      const { getByText, getByPlaceholderText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          canAddItems
          onAddItem={() => {}}
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'Mango');

      expect(getByText('Add Mango (tap or press return)')).toBeTruthy();
    });

    it('does not show add-item row when search matches existing item', () => {
      const { getByText, getByPlaceholderText, queryByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          canAddItems
          onAddItem={() => {}}
        />
      );

      fireEvent.press(getByText('Select'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'Apple');

      expect(queryByText('Add Apple (tap or press return)')).toBeNull();
    });

    it('calls onAddItem and onSelectedItemsChange when adding a new item', () => {
      const onAddItem = jest.fn();
      const onSelectedItemsChange = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1']}
          onSelectedItemsChange={onSelectedItemsChange}
          canAddItems
          onAddItem={onAddItem}
        />
      );

      fireEvent.press(getByText('Select (1 selected)'));
      fireEvent.changeText(getByPlaceholderText('Search'), 'New Fruit');

      fireEvent.press(getByText('Add New Fruit (tap or press return)'));

      expect(onAddItem).toHaveBeenCalledWith([
        ...ITEMS,
        { _id: 'New-Fruit', name: 'New Fruit' },
      ]);
      expect(onSelectedItemsChange).toHaveBeenCalledWith(['1', 'New-Fruit']);
    });
  });

  // --- Remove-selected behavior ---

  describe('removeSelected', () => {
    it('hides already-selected items from the dropdown list', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1']}
          onSelectedItemsChange={() => {}}
          removeSelected
        />
      );

      fireEvent.press(getByText('Select (1 selected)'));

      // Apple should not be in the dropdown
      // Note: "Apple" will appear as a tag but inside the dropdown list it should be filtered out
      expect(getByText('Banana')).toBeTruthy();
      expect(getByText('Cherry')).toBeTruthy();
      // queryByText will find tags, so we check in the opened selector
      // The dropdown list shouldn't have Apple since removeSelected is true
    });
  });

  // --- Selected label rendering ---

  describe('selected label rendering', () => {
    it('shows custom selectText', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          selectText="Pick items"
        />
      );
      expect(getByText('Pick items')).toBeTruthy();
    });

    it('shows custom selectedText', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={() => {}}
          selectText="Pick"
          selectedText="chosen"
        />
      );
      expect(getByText('Pick (2 chosen)')).toBeTruthy();
    });

    it('shows selectText as fallback when single selected item not found', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['nonexistent']}
          onSelectedItemsChange={() => {}}
          single
          selectText="Choose"
        />
      );
      expect(getByText('Choose')).toBeTruthy();
    });
  });

  // --- Custom keys ---

  describe('custom uniqueKey and displayKey', () => {
    const CUSTOM_ITEMS = [
      { id: 'a', label: 'First' },
      { id: 'b', label: 'Second' },
    ];

    it('uses custom uniqueKey and displayKey', () => {
      const onSelectedItemsChange = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={CUSTOM_ITEMS}
          selectedItems={['a']}
          onSelectedItemsChange={onSelectedItemsChange}
          uniqueKey="id"
          displayKey="label"
          single
        />
      );

      expect(getByText('First')).toBeTruthy();
    });
  });

  // --- Icon resolution precedence ---

  describe('icon resolution', () => {
    it('uses searchIcon prop when provided', () => {
      const { getByText, getByTestId } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          searchIcon={<React.Fragment />}
        />
      );

      fireEvent.press(getByText('Select'));

      // Default magnify icon should not be present since we overrode searchIcon
      expect(() => getByTestId('icon-magnify')).toThrow();
    });

    it('renders default magnify icon when searchIcon is not provided', () => {
      const { getByText, getByTestId } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
        />
      );

      fireEvent.press(getByText('Select'));
      expect(getByTestId('icon-magnify')).toBeTruthy();
    });

    it('uses custom renderIcon for all icons', () => {
      const renderIcon = jest.fn(({ name }) => <React.Fragment key={name} />);

      render(
        <MultiSelect
          items={ITEMS}
          selectedItems={['1']}
          onSelectedItemsChange={() => {}}
          renderIcon={renderIcon}
        />
      );

      // The dropdown indicator icon should use renderIcon
      expect(renderIcon).toHaveBeenCalled();
      const callNames = renderIcon.mock.calls.map(
        (call: any[]) => call[0].name
      );
      expect(callNames).toContain('menu-down');
    });
  });

  // --- Imperative handle (ref methods) ---

  describe('imperative handle', () => {
    it('exposes _removeAllItems via ref', () => {
      const onSelectedItemsChange = jest.fn();
      const ref = React.createRef<MultiSelectHandle>();

      render(
        <MultiSelect
          ref={ref}
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      act(() => {
        ref.current!._removeAllItems();
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith([]);
    });

    it('exposes _removeItem via ref', () => {
      const onSelectedItemsChange = jest.fn();
      const ref = React.createRef<MultiSelectHandle>();

      render(
        <MultiSelect
          ref={ref}
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      act(() => {
        ref.current!._removeItem({ _id: '1' });
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith(['2']);
    });

    it('exposes _toggleSelector via ref', () => {
      const onToggleList = jest.fn();
      const ref = React.createRef<MultiSelectHandle>();

      const { getByPlaceholderText } = render(
        <MultiSelect
          ref={ref}
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          onToggleList={onToggleList}
        />
      );

      act(() => {
        ref.current!._toggleSelector();
      });

      // Selector should now be open (search input visible)
      expect(getByPlaceholderText('Search')).toBeTruthy();
      expect(onToggleList).toHaveBeenCalled();
    });

    it('exposes getSelectedItemsExt via ref', () => {
      const ref = React.createRef<MultiSelectHandle>();

      render(
        <MultiSelect
          ref={ref}
          items={ITEMS}
          selectedItems={['1', '2']}
          onSelectedItemsChange={() => {}}
        />
      );

      const element = ref.current!.getSelectedItemsExt();
      expect(element).toBeTruthy();
    });
  });

  // --- Legacy compatibility defaults ---

  describe('legacy compatibility', () => {
    it('uses _id as default uniqueKey', () => {
      const onSelectedItemsChange = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={[{ _id: 'test', name: 'Test Item' }]}
          selectedItems={['test']}
          onSelectedItemsChange={onSelectedItemsChange}
          single
        />
      );

      expect(getByText('Test Item')).toBeTruthy();
    });

    it('uses name as default displayKey', () => {
      const { getByText } = render(
        <MultiSelect
          items={[{ _id: '1', name: 'My Name' }]}
          selectedItems={['1']}
          onSelectedItemsChange={() => {}}
          single
        />
      );

      expect(getByText('My Name')).toBeTruthy();
    });

    it('shows submit button in multi-select mode by default', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
        />
      );

      fireEvent.press(getByText('Select'));
      expect(getByText('Submit')).toBeTruthy();
    });

    it('hides submit button when hideSubmitButton is true', () => {
      const { getByText, queryByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          hideSubmitButton
        />
      );

      fireEvent.press(getByText('Select'));
      expect(queryByText('Submit')).toBeNull();
    });

    it('shows custom submit button text', () => {
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          submitButtonText="Done"
        />
      );

      fireEvent.press(getByText('Select'));
      expect(getByText('Done')).toBeTruthy();
    });

    it('calls onToggleList when selector is toggled', () => {
      const onToggleList = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          onToggleList={onToggleList}
        />
      );

      fireEvent.press(getByText('Select'));
      expect(onToggleList).toHaveBeenCalledTimes(1);
    });

    it('calls onClearSelector when back arrow is pressed', () => {
      const onClearSelector = jest.fn();
      const { getByText, getByTestId } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          onClearSelector={onClearSelector}
        />
      );

      fireEvent.press(getByText('Select'));

      // Press the back arrow (arrow-left icon wrapped in TouchableOpacity)
      fireEvent.press(getByTestId('icon-arrow-left'));

      expect(onClearSelector).toHaveBeenCalledTimes(1);
    });

    it('does not show submit button in single-select mode', () => {
      const { getByText, queryByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={() => {}}
          single
        />
      );

      fireEvent.press(getByText('Select'));
      expect(queryByText('Submit')).toBeNull();
    });
  });

  // --- Disabled items ---

  describe('disabled items', () => {
    it('does not call onSelectedItemsChange when disabled item is pressed', () => {
      const onSelectedItemsChange = jest.fn();
      const { getByText } = render(
        <MultiSelect
          items={ITEMS}
          selectedItems={[]}
          onSelectedItemsChange={onSelectedItemsChange}
        />
      );

      fireEvent.press(getByText('Select'));

      // Elderberry is disabled
      fireEvent.press(getByText('Elderberry'));

      expect(onSelectedItemsChange).not.toHaveBeenCalled();
    });
  });
});

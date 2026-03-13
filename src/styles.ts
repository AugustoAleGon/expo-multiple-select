/*!
 * expo-react-native-multiple-select
 * MIT Licensed
 */

import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

export const colorPack = {
  primary: '#00A5FF',
  primaryDark: '#215191',
  light: '#FFF',
  textPrimary: '#525966',
  placeholderTextColor: '#A9A9A9',
  danger: '#C62828',
  borderColor: '#e9e9e9',
  backgroundColor: '#b1b1b1',
} as const;

const staticStyles = StyleSheet.create({
  footerWrapper: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  footerWrapperNC: {
    width: 320,
    flexDirection: 'column',
  },
  subSection: {
    backgroundColor: colorPack.light,
    borderBottomWidth: 1,
    borderColor: colorPack.borderColor,
    paddingLeft: 0,
    paddingRight: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyButton: {
    height: 40,
    borderRadius: 5,
    elevation: 0,
    backgroundColor: colorPack.backgroundColor,
  },
  indicator: {
    fontSize: 30,
    color: colorPack.placeholderTextColor,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingTop: 3,
    paddingRight: 3,
    paddingBottom: 3,
    margin: 3,
    borderRadius: 20,
    borderWidth: 2,
  },
  button: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colorPack.light,
    fontSize: 14,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    backgroundColor: colorPack.light,
  },
  dropdownView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 10,
  },
  selectedItemsExtContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedItemContent: {
    justifyContent: 'center',
    height: 40,
  },
  selectedItemText: {
    flex: 1,
    fontSize: 15,
  },
  rowContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  disabledText: {
    color: 'grey',
  },
  emptyListRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyListText: {
    flex: 1,
    marginTop: 20,
    textAlign: 'center',
  },
  searchInputFlex: {
    flex: 1,
  },
  selectorContent: {
    flexDirection: 'column',
    backgroundColor: '#fafafa',
  },
  dropdownSubsection: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  dropdownTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export function selectedItemWidth(label: string): ViewStyle {
  return {
    width: label.length * 8 + 60,
  };
}

export function selectedItemBorder(borderColor: string): ViewStyle {
  return {
    borderColor,
  };
}

export function textColorStyle(color: string): TextStyle {
  return {
    color,
  };
}

export function buttonColor(backgroundColor: string): ViewStyle {
  return {
    backgroundColor,
  };
}

export function dropdownTextStyle(fontSize: number, color: string): TextStyle {
  return {
    flex: 1,
    fontSize,
    color,
  };
}

export function selectorView(fixedHeight: boolean): ViewStyle {
  if (fixedHeight) {
    return {
      flexDirection: 'column',
      marginBottom: 10,
      elevation: 2,
      height: 250,
    };
  }
  return {
    flexDirection: 'column',
    marginBottom: 10,
    elevation: 2,
  };
}

export default staticStyles;

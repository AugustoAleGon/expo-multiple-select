import type { ReactNode, ComponentType } from 'react';
import type { IconAdapterProps, RenderIconFn } from './types';

type IconComponentType = ComponentType<IconAdapterProps>;

let _resolvedIcon: IconComponentType | null | undefined;

function resolveIconComponent(): IconComponentType | null {
  if (_resolvedIcon !== undefined) return _resolvedIcon;

  let resolved: IconComponentType | null = null;
  try {
    const mod = require('@expo/vector-icons/MaterialCommunityIcons');
    resolved = mod?.default ?? mod;
  } catch {
    try {
      const mod = require('react-native-vector-icons/MaterialCommunityIcons');
      resolved = mod?.default ?? mod;
    } catch {
      resolved = null;
    }
  }

  _resolvedIcon = resolved;
  return resolved;
}

export function getIconComponent(): IconComponentType | null {
  return resolveIconComponent();
}

export interface IconRenderOptions {
  renderIcon?: RenderIconFn;
  IconComponent?: IconComponentType;
}

export function renderIconElement(
  iconProps: IconAdapterProps,
  options?: IconRenderOptions
): ReactNode {
  if (options?.renderIcon) {
    return options.renderIcon(iconProps);
  }

  const Component = options?.IconComponent ?? resolveIconComponent();
  if (!Component) {
    return null;
  }

  return <Component {...iconProps} />;
}

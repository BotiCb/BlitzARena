import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { NEON_COLOR } from '~/utils/constants/constants';

/**
 * A React Native component that renders a crosshair/target shape.
 *
 * Props:
 * - color: Stroke color for circles and lines
 * - size: Width and height of the SVG container (optional, default 200)
 */
export const Scope = ({ color = NEON_COLOR, size = 200 }) => {
  // We use a 100x100 viewBox and scale up via the `size` prop.
  const outerRadius = 35;
  const innerRadius = 15;
  const strokeWidth = 2;
  const center = 50;

  return (
    <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }] }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Inner circle */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Top line */}
        <Line
          x1={center}
          y1={0}
          x2={center}
          y2={100}
          stroke={color}
          strokeWidth={strokeWidth}
        />

        {/* Left line */}
        <Line
          x1={0}
          y1={center}
          x2={100}
          y2={center}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
};

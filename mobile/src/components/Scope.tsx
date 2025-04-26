import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  Filter,
  FeFlood,
  FeComposite,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Circle,
  Line,
} from 'react-native-svg';

/**
 * A React Native component that renders a glowing neon crosshair/target shape.
 *
 * Props:
 * - color: Stroke and glow color (default '#00f')
 * - size: Width and height of the SVG container (optional, default 200)
 * - glowIntensity: Gaussian blur stdDeviation for glow (optional, default 4)
 */
export const Scope = ({ color = '#00f', size = 200, glowIntensity = 4 }) => {
  const outerRadius = 45;
  const innerRadius = 25;
  const strokeWidth = 2;
  const center = 50;
  const lineLength = 5;

  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <FeFlood floodColor={color} floodOpacity="1" result="flood" />
            <FeComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
            <FeGaussianBlur in="mask" stdDeviation={glowIntensity} result="blurred" />
            <FeMerge>
              <FeMergeNode in="blurred" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        {/* Outer circle with glow */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          filter="url(#glow)"
        />

        {/* Inner circle with glow */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          filter="url(#glow)"
        />

        {/* Radial lines with glow */}
        <Line
          x1={center}
          y1={0}
          x2={center}
          y2={lineLength}
          stroke={color}
          strokeWidth={strokeWidth}
          filter="url(#glow)"
        />
        <Line
          x1={center}
          y1={100 - lineLength}
          x2={center}
          y2={100}
          stroke={color}
          strokeWidth={strokeWidth}
          filter="url(#glow)"
        />
        <Line
          x1={0}
          y1={center}
          x2={lineLength}
          y2={center}
          stroke={color}
          strokeWidth={strokeWidth}
          filter="url(#glow)"
        />
        <Line
          x1={100 - lineLength}
          y1={center}
          x2={100}
          y2={center}
          stroke={color}
          strokeWidth={strokeWidth}
          filter="url(#glow)"
        />
      </Svg>
    </View>
  );
};


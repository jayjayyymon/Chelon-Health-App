import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { waterSummary } from '@/data/mock-data';

type WaterChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
};

export const WaterChart: React.FC<WaterChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true
}) => {
  const glasses = waterSummary.glasses;
  if (glasses.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>No water data</Text>
      </View>
    );
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxAmount = Math.max(...glasses.map(g => g.amountMl));
  const barWidth = chartWidth / glasses.length * 0.6; // 60% of the slot, leaving 40% for gaps
  const barSpacing = (chartWidth / glasses.length - barWidth) / 2;

  return (
    <View style={[styles.container, { width, height }]}>
      {showLabel && (
        <Text style={styles.chartTitle}>Water Intake Today</Text>
      )}
      <Svg width={width} height={height}>
        {glasses.map((glass, index) => {
          const barHeight = (glass.amountMl / maxAmount) * chartHeight;
          const x = padding + index * (chartWidth / glasses.length) + barSpacing;
          const y = padding + chartHeight - barHeight;

          return (
            <React.Fragment key={glass.id}>
              <SvgRect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#4ECDC4"
              />
              {/* Optional: show amount on top of bar */}
              {barHeight > 20 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#333"
                  fontSize={10}
                >
                  {glass.amountMl}ml
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
        {/* Show total today */}
        <SvgText
          x={width - 10}
          y={20}
          textAnchor="end"
          fill="#333"
          fontSize={12}
        >
          {waterSummary.todayL}L / {waterSummary.goalL}L
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  noData: {
    fontSize: 14,
    color: '#999',
  },
});
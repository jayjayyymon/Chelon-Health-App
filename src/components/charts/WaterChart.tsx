import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Rect as SvgRect, Svg, Text as SvgText } from 'react-native-svg';

import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';
import { getLocalDateKey } from '@/utils/dietStorage';

type WaterChartProps = {
  width?: number;
  height?: number;
  showLabel?: boolean;
  showValue?: boolean;
  lineColor?: string;
  textColor?: string;
};

export const WaterChart: React.FC<WaterChartProps> = ({
  width = 150,
  height = 100,
  showLabel = true,
  showValue = true,
  lineColor = '#4ECDC4',
  textColor = '#333',
}) => {
  const { waterGlasses } = useHealthData();
  const { profile } = useProfile();
  const todayKey = getLocalDateKey();
  const todayGlasses = waterGlasses.filter(glass => (glass.dateKey ?? todayKey) === todayKey);
  const safeWidth = Math.max(180, width);
  const safeHeight = Math.max(120, height);
  const padding = Math.min(24, Math.max(16, Math.floor(Math.min(safeWidth, safeHeight) / 6)));
  const chartWidth = Math.max(1, safeWidth - padding * 2);
  const chartHeight = Math.max(1, safeHeight - padding * 2);

  if (todayGlasses.length === 0) {
    return (
      <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
        <Text style={[styles.noData, { color: textColor }]}>No water data yet</Text>
      </View>
    );
  }

  const totalMl = todayGlasses.reduce((sum, glass) => sum + glass.amountMl, 0);
  const goalMl = Math.max(profile.dailyWaterGoalL * 1000, 1);
  const maxScale = Math.max(goalMl, ...todayGlasses.map(glass => glass.amountMl));
  const slotWidth = chartWidth / todayGlasses.length;
  const barWidth = Math.max(14, Math.min(38, slotWidth * 0.58));
  const totalL = totalMl / 1000;

  return (
    <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
      {showLabel ? <Text style={[styles.chartTitle, { color: textColor }]}>Water intake</Text> : null}
      <Svg width={safeWidth} height={safeHeight}>
        <SvgRect x={padding} y={padding + chartHeight - 1} width={chartWidth} height={1} fill={textColor} opacity={0.35} />
        {todayGlasses.map((glass, index) => {
          const barHeight = Math.max(4, (glass.amountMl / maxScale) * chartHeight);
          const x = padding + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = padding + chartHeight - barHeight;
          return (
            <React.Fragment key={glass.id}>
              <SvgRect x={x} y={y} width={barWidth} height={barHeight} rx={5} fill={lineColor} />
              <SvgText
                x={x + barWidth / 2}
                y={Math.max(14, y - 10)}
                textAnchor="middle"
                fill={textColor}
                fontSize={10}
                fontWeight="700">
                {glass.amountMl} ml
              </SvgText>
            </React.Fragment>
          );
        })}
        {showValue ? (
          <SvgText x={safeWidth / 2} y={safeHeight - 3} textAnchor="middle" fill={textColor} fontSize={12}>
            Total: {totalL.toFixed(1)} L / {profile.dailyWaterGoalL} L
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  chartTitle: { alignSelf: 'center', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  noData: { fontSize: 14, textAlign: 'center' },
});

import React from 'react';
import { View, Text } from 'react-native';

interface BarChartProps {
  data: { day: string; value: number; isHighlight?: boolean }[];
}

const BarChart = ({ data }: BarChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <View className="flex-row items-end justify-between h-32 px-4 py-4 bg-yellow-50 rounded-2xl border border-black/5">
      {data.map((item, index) => (
        <View key={index} className="items-center">
          {item.isHighlight && (
            <View className="bg-orange-500 rounded-full px-2 py-0.5 mb-1">
              <Text className="text-white text-xs font-bold">${item.value}</Text>
            </View>
          )}
          <View
            className={`w-3 rounded-t-lg ${item.isHighlight ? 'bg-orange-500' : 'bg-slate-900'}`}
            style={{ height: (item.value / (maxValue * 1.2)) * 80 }}
          />
          <Text className="text-xs text-slate-500 mt-2">{item.day}</Text>
        </View>
      ))}
    </View>
  );
};

export default BarChart;

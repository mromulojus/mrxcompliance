import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface LoginFrequencyChartProps {
  data: Array<{
    day: string;
    logins: number;
  }>;
}

export function LoginFrequencyChart({ data }: LoginFrequencyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequência de Logins por Dia da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            logins: {
              label: 'Logins',
              color: 'hsl(var(--primary))'
            }
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false}
              fontSize={12}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="logins" 
              fill="var(--color-logins)" 
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
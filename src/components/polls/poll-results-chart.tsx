"use client";

import type { PollResult } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PollResultsChartProps {
  results: PollResult[];
  totalVotes: number;
}

export default function PollResultsChart({ results, totalVotes }: PollResultsChartProps) {
  if (!results || results.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No votes cast yet.</p>;
  }
  
  const chartData = results.map(result => ({
    name: result.text,
    votes: result.votes,
    percentage: totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(1) : 0,
  }));

  const chartConfig = {
    votes: {
      label: "Votes",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Poll Results</CardTitle>
        <CardDescription>Total Votes: {totalVotes}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-video">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={100} interval={0} tick={{fontSize: 12}} />
              <Tooltip
                content={<ChartTooltipContent 
                  formatter={(value, name, props) => (
                    <div>
                      <p className="font-medium">{props.payload.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {value} votes ({props.payload.percentage}%)
                      </p>
                    </div>
                  )}
                />}
              />
              <Legend />
              <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-6 space-y-2">
          {results.map(result => (
            <div key={result.id} className="text-sm">
              <div className="flex justify-between font-medium">
                <span>{result.text}</span>
                <span>{result.votes} votes ({totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

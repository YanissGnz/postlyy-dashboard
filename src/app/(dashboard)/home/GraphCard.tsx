import React, { useMemo } from "react";
import ReactApexChart, { BaseOptionChart } from "@/components/ui/chart";
import { merge } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";

export default function GraphCard({
  title,
  i,
  handleRemoveCard,
}: {
  title: string;
  query: string;
  i: string;
  handleRemoveCard: (i: string) => () => void;
}) {
  const chartOptions = useMemo(() => {
    return merge(BaseOptionChart(), {
      labels: [
        "01/01/2023",
        "02/01/2023",
        "03/01/2023",
        "04/01/2023",
        "05/01/2023",
        "06/01/2023",
        "07/01/2023",
        "08/01/2023",
        "09/01/2023",
        "10/01/2023",
        "11/01/2023",
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y: number) => {
            if (typeof y !== "undefined") {
              return `${y.toFixed(0)}`;
            }
            return y;
          },
        },
      },
    });
  }, []);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <Iconify icon="eva:more-vertical-fill" className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleRemoveCard(i)}>
              <>
                <Iconify
                  icon="solar:trash-bin-2-bold"
                  className="mr-2 text-destructive"
                  fontSize={18}
                />
                Remove
              </>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 p-1">
        <ReactApexChart
          type="line"
          series={[
            {
              name: "Desktops",
              data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
            },
          ]}
          options={chartOptions}
          height="100%"
          width="100%"
        />
      </CardContent>
    </Card>
  );
}

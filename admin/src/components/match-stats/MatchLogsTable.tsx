"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { onLogUpdate } from "@/lib/eventEmitter";
import { deleteMatchLog, fetchMatchLogs } from "@/actions/results";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import { ensureArray, ensureNumber } from "@/lib/normalize";

interface Player {
  id: string;
  name: string;
}

interface LogEntry {
  id: string;
  fixture_id: string;
  type: "Goal" | "Card" | "Substitution";
  player_id: string;
  action: string;
  details: string;
  time: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  player: Player;
}

interface LogsResponse {
  logs: {
    current_page: number;
    data: LogEntry[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

interface MatchLogsTableProps {
  fixtureId: string;
}

export default function MatchLogsTable({ fixtureId }: MatchLogsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: logsData,
    isLoading,
    error: logsError,
  } = useQuery({
    queryKey: ["matchLogs", fixtureId, currentPage],
    queryFn: async (): Promise<LogsResponse> => {
      const res = await fetchMatchLogs(fixtureId, currentPage);
      if ("error" in res) throw new Error(res.error);
      return res as unknown as LogsResponse;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (logId: string) => deleteMatchLog(logId),
    onSuccess: (response) => {
      if ("error" in response) {
        toast.error(String(response.error));
      } else {
        toast.success(
          String(response.message ?? "Log deleted successfully")
        );
        queryClient.invalidateQueries({ queryKey: ["matchLogs", fixtureId] });
      }
    },
    onError: (error: unknown) => {
      console.error("Error deleting log:", error);
      let errorMessage = "Failed to delete log";
      if (error instanceof Error) {
        errorMessage =
          error.message.includes("API Error") && error.message.includes("405")
            ? "Delete operation not supported by the server (405 Method Not Allowed)"
            : error.message;
      }
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    const unsubscribe = onLogUpdate((updatedFixtureId: string) => {
      if (updatedFixtureId === fixtureId) {
        queryClient.invalidateQueries({ queryKey: ["matchLogs", fixtureId] });
      }
    });
    return () => unsubscribe();
  }, [fixtureId]);

  const goToPage = (page: number) => {
    const lastPage = ensureNumber(logsData?.logs?.last_page, 1) || 1;
    if (
      page >= 1 &&
      page <= lastPage &&
      page !== currentPage
    ) {
      setCurrentPage(page);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const renderDetails = (log: LogEntry) => {
    if (log.type === "Goal") return log.details;
    if (log.type === "Card") return log.details;
    if (log.type === "Substitution") {
      const inPlayerId = log.details.split("In: ")[1];
      const inPlayer = ensureArray<LogEntry>(logsData?.logs?.data).find(
        (l) => l.player_id === inPlayerId
      )?.player;
      return `In: ${inPlayer?.name || inPlayerId}`;
    }
    return log.details;
  };

  if (logsError) {
    return (
      <p className="font-evogria text-[17px] text-red-500 text-center">
        Error loading logs
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 font-evogria">Logs</h3>
      {isLoading ? (
        <p className="font-evogria text-[17px] text-[#302464] text-center">
          Loading logs...
        </p>
      ) : ensureArray<LogEntry>(logsData?.logs?.data).length === 0 ? (
        <p className="font-evogria text-[17px] text-[#302464] text-center mb-4">
          No logs available for this fixture.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
          <Table className="rounded-md">
            <TableHeader>
              <TableRow className="font-inter">
                <TableHead>Type</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-inter">
              {ensureArray<LogEntry>(logsData?.logs?.data).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.player.name}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{renderDetails(log)}</TableCell>
                  <TableCell>{formatTime(log.time)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(log.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Delete log"
                    >
                      <Trash2 className="h-5 w-5 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <hr />
          <div className="flex justify-between items-center mt-4 px-4 pb-4">
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-1">
              {Array.from(
                { length: ensureNumber(logsData?.logs?.last_page, 1) || 1 },
                (_, i) => i + 1
              ).map((page) => (
                <Button
                  key={page}
                  onClick={() => goToPage(page)}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className={
                    page === currentPage
                      ? "bg-[#F9F5FF] text-[#302464] hover:bg-[#EDE9FE]"
                      : "bg-white text-[#302464] border-gray-300 hover:bg-gray-100"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={
                currentPage === (ensureNumber(logsData?.logs?.last_page, 1) || 1)
              }
              className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

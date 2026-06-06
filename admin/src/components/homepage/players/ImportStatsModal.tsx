"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, Upload, Trash2, Download } from "lucide-react"
import { toast } from "sonner"
import { 
  importCompetitionStats, 
  getCompetitionImportProgress,
  getCompetitions,
} from "@/actions/competitions"
import { useQuery } from "@tanstack/react-query"
import { queryClient } from "@/providers/query-provider"

interface ImportPlayerStatsModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

type ImportState = "initial" | "processing" | "success" | "error"

interface ImportError {
  failedRows: number
  totalRows: number
  errorMessage: string
}

interface Competition {
  id: string
  title: string
}

interface FormState {
  selectedCompetition: string
  selectedFile: File | null
}

export default function ImportPlayerStatsModal({ isOpen, onClose, onImportComplete }: ImportPlayerStatsModalProps) {
  const [formState, setFormState] = useState<FormState>({
    selectedCompetition: "",
    selectedFile: null,
  })
  const [importState, setImportState] = useState<ImportState>("initial")
  const [progress, setProgress] = useState(0)
  const [importError, setImportError] = useState<ImportError | null>(null)
  const [isExportEnabled, setIsExportEnabled] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [errorDownloadLink, setErrorDownloadLink] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stuckCheckRef = useRef<NodeJS.Timeout | null>(null)
  const lastProgressRef = useRef<{ progress: number; timestamp: number }>({ progress: 0, timestamp: Date.now() })

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch competitions
  const { data: competitionsData, isLoading: isCompetitionsLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
    enabled: isOpen && isMounted,
  })

  const competitions: Competition[] = competitionsData && !("error" in competitionsData) 
    ? competitionsData 
    : []

  const handleCompetitionChange = (competition: string) => {
    setFormState((prev) => ({ ...prev, selectedCompetition: competition }))
    setIsExportEnabled(competition !== "")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file extension - get the last extension only (handle cases like .csv.xlsx)
    const fileName = file.name.toLowerCase()
    const validExtensions = [".csv", ".xlsx", ".xls"]
    
    // Get the actual file extension (last one if multiple)
    const parts = fileName.split(".")
    const actualExtension = parts.length > 1 ? `.${parts[parts.length - 1]}` : ""
    const hasValidExtension = validExtensions.includes(actualExtension)

    // Check MIME types (some browsers may not set MIME type correctly)
    const validMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/excel", // .xls (older)
      "application/octet-stream", // Some browsers use this for .xls
    ]
    const hasValidMimeType = !file.type || validMimeTypes.includes(file.type)

    // Reject files with double extensions (e.g., .csv.xlsx)
    if (parts.length > 2) {
      const firstExt = `.${parts[parts.length - 2]}`
      const secondExt = `.${parts[parts.length - 1]}`
      if (validExtensions.includes(firstExt) && validExtensions.includes(secondExt)) {
        toast.error(`File has double extension (${firstExt}${secondExt}). Please rename the file to have only one extension (e.g., ${secondExt}).`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
    }

    if (hasValidExtension && hasValidMimeType) {
      setFormState((prev) => ({ ...prev, selectedFile: file }))
      setImportState("initial")
    } else {
      console.error("File validation failed:", {
        fileName: file.name,
        fileType: file.type,
        extension: actualExtension,
        hasValidExtension,
        hasValidMimeType,
      })
      toast.error(`Please select a valid file (CSV, XLS, or XLSX). Detected: ${actualExtension || "unknown"}`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileRemove = () => {
    setFormState((prev) => ({ ...prev, selectedFile: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExportPlayers = async () => {
    if (!formState.selectedCompetition) {
      toast.error("Please select a competition first")
      return
    }

    setIsExporting(true)
    try {
      const res = await fetch(
        `/api/admin/competitions/${formState.selectedCompetition}/players/export`,
        { method: "POST" }
      )
      if (!res.ok) {
        throw new Error(`Export failed (${res.status})`)
      }

      const blob = await res.blob()

      const cd = res.headers.get("content-disposition") || ""
      const match = cd.match(/filename="([^"]+)"/i)
      const filename =
        match?.[1] || `competition-${formState.selectedCompetition}-players.csv`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      const selectedComp = competitions.find(c => c.id === formState.selectedCompetition)
      toast.success(`Players from ${selectedComp?.title || "competition"} exported successfully`)
    } catch (error) {
      console.error("Error exporting players:", error)
      toast.error("Failed to export players")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!formState.selectedFile) {
      toast.error("Please select a file to import")
      return
    }

    if (!formState.selectedCompetition) {
      toast.error("Please select a competition")
      return
    }

    setImportState("processing")
    setProgress(0)
    setImportError(null)
    setErrorDownloadLink(null)
    lastProgressRef.current = { progress: 0, timestamp: Date.now() }

    try {
      // Log file details before sending
      if (formState.selectedFile) {
        console.log("Uploading file:", {
          name: formState.selectedFile.name,
          type: formState.selectedFile.type,
          size: formState.selectedFile.size,
        })
      }

      // Start the import
      const importResult = await importCompetitionStats(
        formState.selectedCompetition,
        formState.selectedFile!
      )

      console.log("Import result:", importResult)

      if (importResult && "error" in importResult) {
        console.error("Import error:", importResult.error)
        throw new Error(importResult.error || "Import failed")
      }

      if (!importResult) {
        throw new Error("Failed to start import. Please try again.")
      }

      const finishSuccess = () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (stuckCheckRef.current) {
          clearTimeout(stuckCheckRef.current)
          stuckCheckRef.current = null
        }
        setProgress(100)
        setImportState("success")
        toast.success("Player stats imported successfully!")
        if (formState.selectedCompetition) {
          sessionStorage.setItem(
            "lastImportedCompetitionId",
            formState.selectedCompetition
          )
        }
        queryClient.invalidateQueries({ queryKey: ["players"] })
        queryClient.invalidateQueries({ queryKey: ["player"] })
        setTimeout(() => onImportComplete(), 1000)
      }

      const finishFailed = (errorLink: string, message?: string) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (stuckCheckRef.current) {
          clearTimeout(stuckCheckRef.current)
          stuckCheckRef.current = null
        }
        setProgress(100)
        setErrorDownloadLink(errorLink)
        setImportError({
          failedRows: 0,
          totalRows: 0,
          errorMessage:
            message ??
            (errorLink
              ? "Import failed. Download the error file to see which rows need fixing and re-upload."
              : "Import failed. Please check the file format and try again."),
        })
        setImportState("error")
        toast.error("Import failed. Check the error file for details.")
      }

      if (importResult.status === "success") {
        finishSuccess()
        return
      }
      if (importResult.status === "failed") {
        finishFailed(importResult.link ?? "")
        return
      }

      // Poll for progress (import may still be running on server)
      const pollProgress = async () => {
        try {
          const progressResult = await getCompetitionImportProgress(
            formState.selectedCompetition
          )

          console.log("Progress result:", progressResult)

          if (progressResult && "error" in progressResult) {
            throw new Error(progressResult.error || "Failed to get progress")
          }

          if (!progressResult) {
            console.error("No progress result received")
            throw new Error("Failed to get import progress")
          }

          const currentProgress = progressResult.progress ?? 0
          const status = progressResult.status || "pending"

          console.log(`Import status: ${status}, Progress: ${currentProgress}%`)

          // Track progress changes to detect stuck imports
          const now = Date.now()
          if (currentProgress !== lastProgressRef.current.progress) {
            lastProgressRef.current = { progress: currentProgress, timestamp: now }
          } else {
            // If progress hasn't changed for more than 15 seconds, show warning
            const timeSinceLastChange = now - lastProgressRef.current.timestamp
            if (
              timeSinceLastChange > 15000 &&
              (status === "pending" || status === "processing")
            ) {
              const secondsStuck = Math.round(timeSinceLastChange / 1000)
              console.warn(`Import appears stuck: no progress change for ${secondsStuck}s`)
              
              // If stuck for more than 20 seconds, show user-friendly message (only once)
              if (timeSinceLastChange > 20000 && !stuckCheckRef.current) {
                stuckCheckRef.current = setTimeout(() => {
                  toast.warning(
                    `Import appears stuck (${secondsStuck}s). The backend may not be processing. Check backend logs or try again.`,
                    { duration: 8000 }
                  )
                }, 0)
              }
            }
          }

          setProgress(currentProgress)

          if (status === "success") {
            finishSuccess()
            return false
          } else if (status === "failed") {
            finishFailed(
              progressResult.link || "",
              progressResult.message
            )
            return false
          } else if (
            status === "pending" ||
            status === "processing" ||
            currentProgress < 100
          ) {
            return true
          }

          return false
        } catch (error) {
          console.error("Error polling progress:", error)
          throw error
        }
      }

      // Initial progress check - call immediately
      const shouldContinue = await pollProgress()

      // Set a timeout to prevent infinite polling (30 seconds max)
      timeoutRef.current = setTimeout(() => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        if (importState === "processing") {
          // Check one more time if import completed
          getCompetitionImportProgress(formState.selectedCompetition)
            .then((finalCheck) => {
              console.log("Final progress check:", finalCheck)
              if (
                finalCheck &&
                !("error" in finalCheck) &&
                finalCheck.status === "success"
              ) {
        setProgress(100)
        setImportState("success")
                toast.success("Player stats imported successfully!")
                if (formState.selectedCompetition) {
                  sessionStorage.setItem(
                    "lastImportedCompetitionId",
                    formState.selectedCompetition
                  )
                }
                queryClient.invalidateQueries({ queryKey: ["players"] })
                queryClient.invalidateQueries({ queryKey: ["player"] })
        setTimeout(() => {
          onImportComplete()
        }, 1000)
              } else if (
                finalCheck &&
                !("error" in finalCheck) &&
                finalCheck.status === "failed"
              ) {
                const errorLink = finalCheck.link || ""
                setErrorDownloadLink(errorLink)
                setImportError({
                  failedRows: 0,
                  totalRows: 0,
                  errorMessage: errorLink
                    ? "Import failed. Download the error file to see which rows need fixing and re-upload."
                    : "Import failed. Please check the file format and try again.",
                })
                setImportState("error")
                toast.error("Import failed. Check the error file for details.")
              } else {
                setImportError({
                  failedRows: 0,
                  totalRows: 0,
                  errorMessage: "Import is taking longer than expected. The file may be too large or the server may be processing. Please wait a moment and check the import status again, or contact support if this persists.",
                })
                setImportState("error")
                toast.error("Import timeout. Please try again or contact support.")
              }
            })
            .catch((error) => {
              console.error("Error in final check:", error)
              setImportError({
                failedRows: 0,
                totalRows: 0,
                errorMessage: "Import is taking longer than expected. Please check with support if this persists.",
              })
              setImportState("error")
              toast.error("Import timeout. Please try again or contact support.")
            })
        }
      }, 30000) // 30 second timeout

      // Start polling every 500ms for faster updates (backend processes in seconds)
      if (shouldContinue) {
        progressIntervalRef.current = setInterval(async () => {
          try {
            const continuePolling = await pollProgress()
            if (!continuePolling && progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = null
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
              }
            }
          } catch (error) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = null
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
              timeoutRef.current = null
            }
            if (stuckCheckRef.current) {
              clearTimeout(stuckCheckRef.current)
              stuckCheckRef.current = null
            }
            console.error("Error polling progress:", error)
  setImportError({
    failedRows: 0,
    totalRows: 0,
    errorMessage: "Import failed due to server error",
  })
  setImportState("error")
          }
        }, 500) // Reduced from 2000ms to 500ms for faster updates
      }
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
              timeoutRef.current = null
            }
            if (stuckCheckRef.current) {
              clearTimeout(stuckCheckRef.current)
              stuckCheckRef.current = null
            }
            console.error("Error importing stats:", error)
            setImportError({
              failedRows: 0,
              totalRows: 0,
              errorMessage: error instanceof Error ? error.message : "Import failed due to server error",
  })
  setImportState("error")
  }
  }

  // Cleanup interval and timeout on unmount or close
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (stuckCheckRef.current) {
        clearTimeout(stuckCheckRef.current)
        stuckCheckRef.current = null
      }
    }
  }, [])

  const handleDownloadErrors = () => {
    if (typeof window === "undefined") {
      toast.error("Download is only available in the browser")
      return
    }

    if (errorDownloadLink) {
      // Open the error file link in a new tab to download
      window.open(errorDownloadLink, "_blank")
    toast.success("Error file with failed rows downloaded")
    } else {
      toast.error("Error file not available")
    }
  }

  const handleCancel = () => {
    if (importState === "processing") {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (stuckCheckRef.current) {
        clearTimeout(stuckCheckRef.current)
        stuckCheckRef.current = null
      }
      setImportState("initial")
      setProgress(0)
      toast.success("Import cancelled")
      return
    }
    onClose()
  }

  const handleDone = () => {
    if (importState === "success") {
      setFormState({ selectedCompetition: "", selectedFile: null })
      setImportState("initial")
      setProgress(0)
      setImportError(null)
      setErrorDownloadLink(null)
      setIsExportEnabled(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onClose()
  }

  const renderInitialState = () => (
    <>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Export the player list for the selected competition, fill in the stat
          columns (total_shots, tackles, minutes_played, etc.), then upload the
          CSV or Excel file here. Player id must match a player in that
          competition.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select competition</label>
          <div className="relative">
            <select
              value={formState.selectedCompetition}
              onChange={(e) => handleCompetitionChange(e.target.value)}
              disabled={isCompetitionsLoading || isExporting}
              className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10 text-gray-500"
            >
              <option value="">
                {isCompetitionsLoading ? "Loading competitions..." : "Select an option"}
              </option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id} className="text-black">
                  {comp.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleExportPlayers}
              disabled={!isExportEnabled || isExporting}
              isLoading={isExporting}
              loadingText="EXPORTING..."
              className={`text-sm px-4 py-2 ${!isExportEnabled ? "text-gray-400 bg-gray-100" : "text-gray-700 bg-transparent"}`}
            >
              EXPORT PLAYERS
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload CSV file</label>
          {!formState.selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload stats</p>
              <p className="text-xs text-gray-500 mt-1">Supported: CSV, XLS, XLSX</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formState.selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(formState.selectedFile.size / 1024)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleFileRemove} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" 
            onChange={handleFileSelect} 
            className="hidden" 
          />
        </div>
      </div>

      <DialogFooter className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancel} className="text-gray-600 bg-transparent">
          CANCEL
        </Button>
        <Button
          onClick={handleImport}
          disabled={!formState.selectedFile || !formState.selectedCompetition}
          isLoading={importState === "processing"}
          loadingText="IMPORTING..."
          className="bg-[#302464] hover:bg-[#302464]/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          IMPORT
        </Button>
      </DialogFooter>
    </>
  )

  const renderProcessingState = () => (
    <>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Importing Player stats...</h3>
          <p className="text-sm text-gray-600 mb-4">
            This process may take sometime. Please wait while we complete the process.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancel} className="text-gray-600 bg-transparent">
          CANCEL
        </Button>
        <Button
          disabled={progress < 100}
          className="bg-[#302464] hover:bg-[#302464]/90 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          DONE
        </Button>
      </DialogFooter>
    </>
  )

  const renderSuccessState = () => (
    <>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Import Successful</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2 [&>div]:bg-[#302464]" />
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancel} className="text-gray-600 bg-transparent">
          CANCEL
        </Button>
        <Button onClick={handleDone} className="bg-[#302464] hover:bg-[#302464]/90 text-white">
          DONE
        </Button>
      </DialogFooter>
    </>
  )

  const renderErrorState = () => (
    <>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Import failed</h3>
          {importError && (
            <div className="border border-red-300 bg-red-50 rounded-md p-3">
              <p className="text-sm text-red-700">{importError.errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={handleCancel} className="text-gray-600 bg-transparent">
          CANCEL
        </Button>
        <Button onClick={handleDownloadErrors} className="bg-red-600 hover:bg-red-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          DOWNLOAD ERRORS
        </Button>
      </DialogFooter>
    </>
  )

  const renderContent = () => {
    switch (importState) {
      case "processing":
        return renderProcessingState()
      case "success":
        return renderSuccessState()
      case "error":
        return renderErrorState()
      default:
        return renderInitialState()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white w-[32rem] max-w-[95vw] max-h-[85vh] overflow-y-auto p-0">
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">
              IMPORT PLAYER STATS
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 py-5">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  )
}

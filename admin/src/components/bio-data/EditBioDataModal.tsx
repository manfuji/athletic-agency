"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateBioData, type BioDataRow } from "@/actions/bio-data";
import { linkBioDataToPlayer } from "@/actions/legacyPlayers";

export default function EditBioDataModal({
  row,
  onClose,
  onSaved,
}: {
  row: BioDataRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [playerName, setPlayerName] = useState(row.player_name ?? "");
  const [email, setEmail] = useState(row.aa_stats_email ?? "");
  const [dob, setDob] = useState(row.dob ?? "");
  const [position, setPosition] = useState(row.position ?? "");
  const [nationality, setNationality] = useState(row.nationality ?? "");
  const [jersey, setJersey] = useState(
    row.jersey_number == null ? "" : String(row.jersey_number)
  );
  const [photoUrl, setPhotoUrl] = useState(row.photo_url ?? "");

  const [issueDescription, setIssueDescription] = useState("Admin edit");
  const [evidenceRef, setEvidenceRef] = useState("");
  const [linkPlayerId, setLinkPlayerId] = useState("");

  const handleSave = async () => {
    if (!playerName.trim()) {
      toast.error("Player name is required");
      return;
    }
    setIsSubmitting(true);
    const res = await updateBioData(row.bio_data_id, {
      player_name: playerName.trim(),
      aa_stats_email: email.trim() ? email.trim() : null,
      dob: dob.trim() ? dob.trim() : null,
      position: position.trim() ? position.trim() : null,
      nationality: nationality.trim() ? nationality.trim() : null,
      jersey_number: jersey.trim() ? Number(jersey) : null,
      photo_url: photoUrl.trim() ? photoUrl.trim() : null,
      issue_description: issueDescription.trim() ? issueDescription.trim() : null,
      evidence_reference: evidenceRef.trim() ? evidenceRef.trim() : null,
    });
    setIsSubmitting(false);

    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Saved");
    onSaved();
  };

  const handleLink = async () => {
    if (!linkPlayerId.trim()) {
      toast.error("Player ID is required to link");
      return;
    }
    setIsSubmitting(true);
    const res = await linkBioDataToPlayer(row.bio_data_id, linkPlayerId.trim());
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Linked to player");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="bg-white w-[36rem] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-evogria text-[#101828] text-[18px]">
            Edit Bio Data
          </DialogTitle>
          <DialogDescription className="font-inter text-[14px] text-[#475467]">
            Changes will be written to `bio_data` and recorded in `qa_log`.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player name" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="AA stats email" />
          <Input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="DOB (YYYY-MM-DD)" />
          <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" />
          <Input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Nationality code" />
          <Input value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="Jersey number" />
          <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL" className="md:col-span-2" />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Issue description (qa_log)"
          />
          <Input
            value={evidenceRef}
            onChange={(e) => setEvidenceRef(e.target.value)}
            placeholder="Evidence reference (optional)"
          />
        </div>

        <div className="mt-3 flex flex-col md:flex-row gap-2 md:items-center">
          <Input
            value={linkPlayerId}
            onChange={(e) => setLinkPlayerId(e.target.value)}
            placeholder="Link to existing Player ID (optional)"
          />
          <Button
            variant="outline"
            onClick={handleLink}
            disabled={isSubmitting}
            className="font-evogria"
          >
            Link
          </Button>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full bg-transparent font-evogria text-[#344054]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full bg-[#302464] font-evogria text-white"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


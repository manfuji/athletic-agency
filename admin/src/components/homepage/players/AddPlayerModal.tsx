"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CustomButton from "@/reusables/CustomButton";
import { User, Plus } from "lucide-react";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { Combobox } from "@/reusables/ComboBox";
import Image from "next/image";
import { createStandalonePlayer } from "@/actions/players";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { hasFlag } from "country-flag-icons";
import { playerSchema } from "@/lib/validationSchema";
import { useForm } from "@/hooks/useForm";

countries.registerLocale(enLocale);

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerAdded: () => void;
}

interface Player {
  image: string;
  name: string;
  country: string;
  dob: string;
  height?: string;
  weight?: string;
  bio?: string;
  experience?: string;
  reason?: string;
  position: string;
  preferredFoot: string;
  [key: string]: unknown;
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onPlayerAdded,
}: AddPlayerModalProps) {
  const defaultPlayerState: Player = {
    image: "",
    name: "",
    country: "",
    dob: "",
    height: undefined,
    weight: undefined,
    bio: undefined,
    experience: undefined,
    reason: undefined,
    position: "",
    preferredFoot: "",
  };

  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const {
    data: player,
    setData: setPlayer,
    errors,
    handleChange,
    handleFileChange,
    validateAndSubmit,
    fileRefs,
  } = useForm<Player>(defaultPlayerState, playerSchema);

  const countryList = Object.entries(
    countries.getNames("en", { select: "official" })
  )
    .map(([code, name]) => ({
      value: code.toLowerCase(),
      label: name,
      hasFlag: hasFlag(code),
    }))
    .filter((country) => country.hasFlag);

  const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
  const feet = ["Left", "Right", "Both"];

  const handleCountryChange = (country: { value: string; label: string }) =>
    setPlayer((prev) => ({ ...prev, country: country.value }));

  useEffect(() => {
    if (attemptedSubmit && errors.dob) {
      toast.error(errors.dob._errors[0]);
      setAttemptedSubmit(false);
    }
  }, [attemptedSubmit, errors.dob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitHandler = async (formData: FormData) => {
      setIsLoading(true);
      try {
        const parsedDate = player.dob
          ? parse(player.dob, "dd/MM/yyyy", new Date())
          : null;
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date of birth");
        }

        formData.set("dob", format(parsedDate, "yyyy-MM-dd"));
        formData.set("nationality", player.country);
        formData.set("preferred_foot", player.preferredFoot);
        if (player.experience)
          formData.set("previous_experience", player.experience);
        if (player.reason) formData.set("reason_for_joining", player.reason);
        if (fileRefs.current.image?.files?.[0]) {
          formData.set("profile_picture", fileRefs.current.image.files[0]);
        }

        const response = await createStandalonePlayer(formData);

        if (!response) {
          toast.error("Failed to create player");
          return;
        }

        if ("error" in response) {
          toast.error(response.error);
          return;
        }

        toast.success("Player created successfully!");
        setPlayer(defaultPlayerState);
        Object.keys(fileRefs.current).forEach(
          (key) => fileRefs.current[key] && (fileRefs.current[key]!.value = "")
        );
        onPlayerAdded();
        onClose();
      } catch (error) {
        console.error("Error creating player:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create player"
        );
      } finally {
        setIsLoading(false);
      }
    };

    setAttemptedSubmit(true);
    await validateAndSubmit(submitHandler);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-normal text-[#000000]">
            ADD PLAYER
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mt-4">
            <div className="sm:col-span-2 flex flex-col items-center gap-2">
              <div
                className="relative border-4 border-white bg-gray-200 flex items-center justify-center cursor-pointer shadow-xl h-40 w-40 rounded-full"
                onClick={() => fileRefs.current.image?.click()}
              >
                {!player.image ? (
                  <User size={60} className="text-blue-900" />
                ) : (
                  <Image
                    src={player.image}
                    alt="Player"
                    className="h-full w-full rounded-full object-cover"
                    width={160}
                    height={160}
                  />
                )}
                <input
                  type="file"
                  ref={(el) => {
                    fileRefs.current.image = el;
                  }}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange("image", e)}
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-white p-1">
                  <Plus size={20} className="text-gray-500" />
                </div>
              </div>
              {errors.image && (
                <p className="text-red-600 text-sm">
                  {errors.image._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="font-inter text-[#000000]">
                Player Name
              </Label>
              <Input
                id="name"
                value={player.name}
                onChange={handleChange}
                placeholder="Enter name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name._errors[0]}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="country" className="font-inter text-[#000000]">
                Country
              </Label>
              <Combobox
                countries={countryList}
                onCountryChange={handleCountryChange}
                disabled={isLoading}
                value={player.country}
              />
              {errors.country && (
                <p className="text-red-600 text-sm">
                  {errors.country._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="dob" className="font-inter text-[#000000]">
                Date of Birth
              </Label>
              <Input
                type="date"
                id="dob"
                value={
                  player.dob
                    ? format(
                        parse(player.dob, "dd/MM/yyyy", new Date()),
                        "yyyy-MM-dd"
                      )
                    : ""
                }
                onChange={(e) => {
                  const dateValue = e.target.value;
                  const formattedDate = dateValue
                    ? format(
                        parse(dateValue, "yyyy-MM-dd", new Date()),
                        "dd/MM/yyyy"
                      )
                    : "";
                  setPlayer((prev) => ({ ...prev, dob: formattedDate }));
                }}
                placeholder="Select date of birth"
                disabled={isLoading}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dob && (
                <p className="text-red-600 text-sm">{errors.dob._errors[0]}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="position" className="font-inter text-[#000000]">
                Position
              </Label>
              <select
                id="position"
                value={player.position}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled={isLoading}
              >
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="text-red-600 text-sm">
                  {errors.position._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="preferredFoot"
                className="font-inter text-[#000000]"
              >
                Preferred Foot
              </Label>
              <select
                id="preferredFoot"
                value={player.preferredFoot}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled={isLoading}
              >
                <option value="">Select preferred foot</option>
                {feet.map((foot) => (
                  <option key={foot} value={foot}>
                    {foot}
                  </option>
                ))}
              </select>
              {errors.preferredFoot && (
                <p className="text-red-600 text-sm">
                  {errors.preferredFoot._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="height" className="font-inter text-[#000000]">
                Height (cm)
              </Label>
              <Input
                id="height"
                value={player.height || ""}
                onChange={handleChange}
                placeholder="cm"
                disabled={isLoading}
              />
              {errors.height && (
                <p className="text-red-600 text-sm">
                  {errors.height._errors?.[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="weight" className="font-inter text-[#000000]">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                value={player.weight || ""}
                onChange={handleChange}
                placeholder="kg"
                disabled={isLoading}
              />
              {errors.weight && (
                <p className="text-red-600 text-sm">
                  {errors.weight._errors?.[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bio" className="font-inter text-[#000000]">
                Bio (optional)
              </Label>
              <Textarea
                id="bio"
                value={player.bio || ""}
                onChange={handleChange}
                placeholder="Enter bio ..."
                disabled={isLoading}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="experience" className="font-inter text-[#000000]">
                Previous Experience (optional)
              </Label>
              <Textarea
                id="experience"
                value={player.experience || ""}
                onChange={handleChange}
                placeholder="Enter previous experience ..."
                disabled={isLoading}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="reason" className="font-inter text-[#000000]">
                Reason for Joining (optional)
              </Label>
              <Textarea
                id="reason"
                value={player.reason || ""}
                onChange={handleChange}
                placeholder="Enter reason ..."
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-6 mt-6 w-full">
            <CustomButton
              text="Cancel"
              type="button"
              onClick={onClose}
              bgColor="bg-transparent"
              color="text-[#344054]"
              className="hover:bg-transparent"
            />
            <CustomButton
              text="Add Player"
              bgColor="bg-[#302464]"
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              className="hover:bg-[#302464]"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

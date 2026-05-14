'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCompetitionStructures,
  createCompetitionStructure,
} from '@/actions/competitions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STRUCTURE_QUERY_KEY = ['structures'] as const;

interface Structure {
  id: string;
  name: string;
  description?: string;
}

interface CompetitionStructureProps {
  isOpen: boolean;
  onClose: () => void;
  onStepComplete: (structureId: string) => void;
  competition?: { id: string; name: string } | null;
  selectedStructure?: string | null;
}

const CompetitionStructure: React.FC<CompetitionStructureProps> = ({
  isOpen,
  onClose,
  onStepComplete,
  selectedStructure,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const { data: structures = [], isLoading } = useQuery<Structure[]>({
    queryKey: STRUCTURE_QUERY_KEY,
    queryFn: async () => {
      const result = await getCompetitionStructures();
      return Array.isArray(result) ? (result as Structure[]) : [];
    },
    enabled: isOpen,
  });

  const isGroupStageKnockout = (structureName: string) =>
    structureName === 'Group Stage + Knockout';

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a structure name');
      return;
    }
    setIsCreating(true);
    try {
      const result = await createCompetitionStructure({
        name: name.trim(),
        description: description.trim(),
      });
      if (result && typeof result === 'object' && 'error' in result) {
        toast.error(String(result.error));
        return;
      }
      toast.success('Structure created');
      setName('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: STRUCTURE_QUERY_KEY });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-bold text-center">
            Select Competition Structure
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-inter">
                Loading structures…
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {structures.map((format) => {
                  const isSelected = selectedStructure === format.id;
                  const isActive = isGroupStageKnockout(format.name);

                  return (
                    <Card
                      key={format.id}
                      className={`shadow-md ${
                        isSelected ? 'border-2 border-green-500' : ''
                      }`}
                    >
                      <CardHeader>
                        <div className="w-full h-32 bg-gray-200 rounded-md" />
                        <CardTitle className="text-[#000000] text-[16px] font-bold font-inter">
                          {format.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[14px] text-gray-600 font-inter min-h-[40px]">
                          {format.description ?? ''}
                        </p>
                        <Button
                          className={`mt-4 w-full font-inter ${
                            isActive
                              ? 'bg-[#302464] hover:bg-[#1f1656]'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          onClick={
                            isActive
                              ? () => {
                                  onStepComplete(format.id);
                                  onClose();
                                }
                              : undefined
                          }
                          disabled={!isActive}
                        >
                          {isSelected ? 'Selected' : 'Use this structure'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {!structures.length && (
                <div className="py-6 text-center text-sm text-muted-foreground font-inter">
                  No competition structures yet. Add one below (use the exact
                  name <span className="font-semibold text-foreground">
                    Group Stage + Knockout
                  </span>{' '}
                  to enable this competition format).
                </div>
              )}
              <div className="border-t border-border mt-6 pt-6 space-y-4">
                <h3 className="text-sm font-semibold font-inter text-foreground">
                  Add new structure
                </h3>
                <form
                  onSubmit={handleCreateStructure}
                  className="space-y-4 max-w-md"
                >
                  <div className="space-y-2">
                    <Label htmlFor="structure-name" className="font-inter">
                      Name
                    </Label>
                    <Input
                      id="structure-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Group Stage + Knockout"
                      className="font-inter"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="structure-description" className="font-inter">
                      Description (optional)
                    </Label>
                    <Input
                      id="structure-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short summary shown on the card"
                      className="font-inter"
                      disabled={isCreating}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-[#302464] hover:bg-[#1f1656] font-inter"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create structure'
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitionStructure;

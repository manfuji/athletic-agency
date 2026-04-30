'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCompetitionStructures } from '@/actions/competitions';
import { useQuery } from '@tanstack/react-query';

interface Structure {
  id: string;
  name: string;
  description: string;
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
  // const [structures, setStructures] = useState<Structure[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  const { data: structures = [], isLoading } = useQuery<Structure[]>({
    queryKey: ['structures'],
    queryFn: async () => {
      const result = await getCompetitionStructures();
      return Array.isArray(result) ? (result as Structure[]) : [];
    },
  });

  if (isLoading) return null;

  const isGroupStageKnockout = (structureName: string) =>
    structureName === 'Group Stage + Knockout';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-bold text-center">
            Select Competition Structure
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-3 gap-3">
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
                    <div className="w-full h-32 bg-gray-200 rounded-md"></div>
                    <CardTitle className="text-[#000000] text-[16px] font-bold font-inter">
                      {format.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[14px] text-gray-600 font-inter">
                      {format.description}
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
            <div className="py-10 text-center text-sm text-muted-foreground font-inter">
              No competition structures available.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitionStructure;

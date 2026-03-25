import { useState } from "react";
import type { StageType } from "../../../types/admin";
import { StageGroupsTable } from "./StageGroupsTable";
import { FinalStageView } from "./FinalStageView";

const STAGES: StageType[] = [
  { name: "first_stage", label: "First Stage" },
  { name: "second_stage", label: "Second Stage" },
  { name: "final_stage", label: "Final Stage" },
];

export const StagesView = () => {
  const [selectedStage, setSelectedStage] = useState<StageType>(STAGES[0]);

  return (
    <div className="space-y-6">
      {/* Stage Selector */}
      <div className="bg-white border-2 border-black p-4">
        <h3 className="text-sm font-black uppercase tracking-widest mb-4">
          Select Stage
        </h3>
        <div className="flex gap-2 flex-wrap">
          {STAGES.map((stage) => (
            <button
              key={stage.name}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                selectedStage.name === stage.name
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on selected stage */}
      {selectedStage.name === "final_stage" ? (
        <FinalStageView />
      ) : (
        <StageGroupsTable stage={selectedStage} />
      )}
    </div>
  );
};

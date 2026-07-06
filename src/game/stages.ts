import stagesData from '@/assets/data/stages.json';
import type { StageDefinition } from '@/src/types/stage';

const stages = stagesData as StageDefinition[];

export function getAllStages(): StageDefinition[] {
  return stages;
}

export function getStageById(id: number): StageDefinition | undefined {
  return stages.find((s) => s.id === id);
}

export function isTutorialStage(stageId: number): boolean {
  const stage = getStageById(stageId);
  return stage?.metadata.isTutorial === true || stageId <= 5;
}

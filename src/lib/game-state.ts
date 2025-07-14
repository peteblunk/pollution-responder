
export interface Character {
  name: string;
  rank: string;
  skill: number;
  preparedness: number;
  luck: number;
  unitName?: string;
}

export interface CharacterCreationState {
    qualification: 'qualified' | 'unqualified';
    skillRoll: number;
    hasMarineSafetyPin: boolean;
    isMSTHonorGrad: boolean;
    isOcsGrad: boolean;
    readiness: 'allGreen' | 'notAllGreen';
    preparednessRoll: number;
    readinessMetricsNotGreen: number;
    involuntaryDeployments: number;
    lettersOfCommendation: number;
    achievementMedals: number;
    isRepoY: boolean;
    hasChallengeCoin: boolean;
}

export interface ICS201 {
    incidentName: string;
    date: string;
    time: string;
    operationalPeriod: string;
    situationSummary: string;
    objectives: string;
    resourcesSummary: string;
    actionsSummary: string;
    preparedBy: string;
    approvedBy: string;
}

export interface GameState {
  character: Character;
  characterCreation: CharacterCreationState;
  ics201: ICS201;
  currentScenarioId: string;
  eventLog: string[];
  missedChecklistItems: string[];
  characterLocked: boolean;
  briefingAcknowledged: boolean;
  checklistComplete: boolean;
  whiteboardState: string;
  timeElapsed: number; // To track time penalties
  promptQueue: string[]; // A queue of item IDs to resolve
}

const today = new Date();

export const initialState: GameState = {
  character: {
    name: "MST1 Responder",
    rank: "Marine Science Technician First Class",
    skill: 0,
    preparedness: 0,
    luck: 0,
  },
  characterCreation: {
    qualification: 'unqualified',
    skillRoll: 0,
    hasMarineSafetyPin: false,
    isMSTHonorGrad: false,
    isOcsGrad: false,
    readiness: 'allGreen',
    preparednessRoll: 0,
    readinessMetricsNotGreen: 0,
    involuntaryDeployments: 0,
    lettersOfCommendation: 0,
    achievementMedals: 0,
    isRepoY: false,
    hasChallengeCoin: false,
  },
  ics201: {
    incidentName: "Diesel Spill at Pier 7",
    date: today.toISOString().split('T')[0],
    time: today.toTimeString().split(' ')[0].substring(0,5),
    operationalPeriod: `${today.toLocaleDateString()} 0800-2000`,
    situationSummary: "Initial report of diesel spill from M/V Coastal Navigator. Quantity unknown. Sheen observed moving towards sensitive marshland.",
    objectives: "1. Ensure safety of public and responders.\n2. Contain and recover spilled product.\n3. Protect environmentally sensitive areas.",
    resourcesSummary: "On Scene: M/V Coastal Navigator crew (5), local fire department (1 engine), 1x USCG response boat.\nOrdered: Federal On-Scene Coordinator, spill response contractor.",
    actionsSummary: "Vessel crew has deployed own boom.",
    preparedBy: "MST1 Responder",
    approvedBy: "",
  },
  currentScenarioId: "start",
  eventLog: ["08:02 - Game started. Initial scenario loaded."],
  missedChecklistItems: [],
  characterLocked: false,
  briefingAcknowledged: false,
  checklistComplete: false,
  whiteboardState: "",
  timeElapsed: 0,
  promptQueue: [],
};

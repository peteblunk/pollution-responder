export interface Character {
  name: string;
  rank: string;
  skill: number;
  preparedness: number;
  luck: number;
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
  ics201: ICS201;
  currentScenarioId: string;
  eventLog: string[];
}

const today = new Date();

export const initialState: GameState = {
  character: {
    name: "MST1 Responder",
    rank: "Marine Science Technician First Class",
    skill: 50,
    preparedness: 50,
    luck: 50,
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
};


"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import type { GameState, Character, ICS201, CharacterCreationState } from "@/lib/game-state";
import { initialState } from "@/lib/game-state";

type GameStateAction = 
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'UPDATE_ICS201'; payload: ICS201 }
  | { type: 'LOG_EVENT'; payload: string }
  | { type: 'UPDATE_CHARACTER_CREATION'; payload: CharacterCreationState }
  | { type: 'UPDATE_MISSED_CHECKLIST_ITEMS'; payload: string[] }
  | { type: 'LOCK_CHARACTER' };

const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameStateAction>;
  eventLog: string[];
  updateCharacter: (character: Character) => void;
  updateICS201: (ics201: ICS201) => void;
  logEvent: (event: string) => void;
  updateCharacterCreationState: (creationState: CharacterCreationState) => void;
  updateMissedChecklistItems: (items: string[]) => void;
  lockCharacter: () => void;
} | undefined>(undefined);

const gameStateReducer = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    case 'SET_STATE':
        return action.payload;
    case 'UPDATE_CHARACTER':
        return { ...state, character: action.payload };
    case 'UPDATE_ICS201':
        return { ...state, ics201: action.payload };
    case 'LOG_EVENT':
        return { ...state, eventLog: [...state.eventLog, `${new Date().toLocaleTimeString()}: ${action.payload}`]};
    case 'UPDATE_CHARACTER_CREATION':
        return { ...state, characterCreation: action.payload };
    case 'UPDATE_MISSED_CHECKLIST_ITEMS':
        return { ...state, missedChecklistItems: action.payload };
    case 'LOCK_CHARACTER':
        return { ...state, characterLocked: true };
    default:
      return state;
  }
};

const STORAGE_KEY = 'dieselDilemmaGameState';

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
      }
    } catch (error) {
        console.error("Failed to load game state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Failed to save game state to localStorage", error);
    }
  }, [state]);

  const updateCharacter = useCallback((character: Character) => {
    dispatch({ type: 'UPDATE_CHARACTER', payload: character });
  }, []);
  
  const updateCharacterCreationState = useCallback((creationState: CharacterCreationState) => {
      dispatch({ type: 'UPDATE_CHARACTER_CREATION', payload: creationState });
  }, []);

  const updateICS201 = useCallback((ics201: ICS201) => {
    dispatch({ type: 'UPDATE_ICS201', payload: ics201 });
  }, []);

  const logEvent = useCallback((event: string) => {
      dispatch({ type: 'LOG_EVENT', payload: event });
  }, []);

  const updateMissedChecklistItems = useCallback((items: string[]) => {
      dispatch({ type: 'UPDATE_MISSED_CHECKLIST_ITEMS', payload: items });
  }, []);
  
  const lockCharacter = useCallback(() => {
      dispatch({ type: 'LOCK_CHARACTER' });
  }, []);

  const value = { state, dispatch, eventLog: state.eventLog, updateCharacter, updateICS201, logEvent, updateCharacterCreationState, updateMissedChecklistItems, lockCharacter };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

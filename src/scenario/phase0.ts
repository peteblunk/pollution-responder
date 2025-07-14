// src/scenario/phase0.ts

export const phase0 = {
  // DRAWER 1: The initial report data
  initialReport: {
    title: "Initial Report",
    description: "1000 Hours - The call just came in: 'Potential diesel fuel leak from a vessel moored at Pier 3 at a Marina in Smuggler’s Cove on the Kitsap Peninsula.'",
    alert: "You're the first responders. The Command Center is waiting for your initial report. Acknowledge this message to proceed."
  },

  // DRAWER 2: The list of actions to take AFTER prompts are resolved
  postChecklistActions: [
    {
      id: 'duty-sup-check-in',
      type: 'BUTTON',
      title: "Duty Sup Check-in",
      description: "Report your departure and initial intentions.",
      buttonText: "Check In",
      logMessage: "Successfully checked in with Duty Supervisor."
    },
    {
      id: 'sample-kit-check',
      type: 'DICE_ROLL',
      title: "Sample Kit Check",
      description: "Confirm your sample kit is fully stocked.",
      buttonText: "Roll Preparedness",
      sides: 12,
      logMessage: "Rolled a {roll} on Sample Kit check (2d6, using d12 for simplicity)."
    },
    {
      id: 'drive-to-ferry',
      type: 'DICE_ROLL',
      title: "Drive to Ferry",
      description: "Time to head out. Let's hope you don't forget anything.",
      buttonText: "Roll for Departure",
      sides: 12,
      logMessage: "Rolled a {roll} for departure (Luck/Preparedness)."
    }
  ], // <-- Note the comma here, separating the drawers

  // DRAWER 3: The new set of prompts for any missed items
  itemPrompts: {
    'pfd': {
      title: "Missing Item: PFD",
      text: "You forgot your Personal Flotation Device (PFD). It's a critical safety item. You can try to find a spare, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: {
          logMessage: "Success! You quickly find a spare PFD in a storage locker.",
          timeCost: 5,
        },
        failure: {
          logMessage: "You waste valuable time rummaging through closets and come up empty-handed.",
          timeCost: 15,
        }
      }
    }
    // We can add 'gas-meter', 'paperwork', etc. here later
  }
};
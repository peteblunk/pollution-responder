// src/scenario/phase0.ts

// --- STEP 1: Define the shapes for our data pieces ---

type ChecklistItem = {
  id: string;
  label: string;
  isRequired: boolean;
  isBonus?: boolean; // Optional property
};

type ChecklistCategory = {
  category: string;
  items: ChecklistItem[];
};

type Action = {
  id: string;
  type: 'BUTTON' | 'DICE_ROLL';
  title: string;
  description: string;
  buttonText: string;
  logMessage: string;
  sides?: number; // Optional property for dice rolls
};

type ItemPrompt = {
  title: string;
  text: string;
  buttonText: string;
  attribute: string;
  outcomes: {
    success: { logMessage: string; timeCost: number; };
    failure: { logMessage: string; timeCost: number; };
  };
};

// --- STEP 2: Define the shape of the entire phase0 object ---

interface Phase0Data {
  initialReport: {
    title: string;
    description: string;
    alert: string;
  };
  postChecklistActions: Action[];
  itemPrompts: Record<string, ItemPrompt>;
  checklist: ChecklistCategory[];
}

// --- STEP 3: Create our data object and ensure it matches the shape ---

export const phase0: Phase0Data = {
  initialReport: {
    title: "Initial Report",
    description: "1000 Hours - The call just came in: 'Potential diesel fuel leak from a vessel moored at Pier 3 at a Marina in Smuggler’s Cove on the Kitsap Peninsula.'",
    alert: "You're the first responders. The Command Center is waiting for your initial report. Acknowledge this message to proceed."
  },

  postChecklistActions: [
    { id: 'duty-sup-check-in', type: 'BUTTON', title: "Duty Sup Check-in", description: "Report your departure and initial intentions.", buttonText: "Check In", logMessage: "Successfully checked in with Duty Supervisor." },
    { id: 'sample-kit-check', type: 'DICE_ROLL', title: "Sample Kit Check", description: "Confirm your sample kit is fully stocked.", buttonText: "Roll Preparedness", sides: 12, logMessage: "Rolled a {roll} on Sample Kit check (2d6, using d12 for simplicity)." },
    { id: 'drive-to-ferry', type: 'DICE_ROLL', title: "Drive to Ferry", description: "Time to head out. Let's hope you don't forget anything.", buttonText: "Roll for Departure", sides: 12, logMessage: "Rolled a {roll} for departure (Luck/Preparedness)." }
  ],

  itemPrompts: {
    'hard-hat': {
      title: "Missing Item: Hard Hat",
      text: "You forgot your hard hat. It's a critical safety item. Maybe you find one in the back of the van.",
      buttonText: "Roll to see if the van has an extra one or if you have to go back to the office.",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! There's an extra one in the van!", timeCost: 5 },
        failure: { logMessage: "You waste valuable time walking back to the office to get one.", timeCost: 15 }
      }
    },

    'gloves': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'eye-pro': {
      title: "Missing Item: eye protection",
      text: "You forgot your eye-protection at home. It's a critical safety item. You can try to find a spare pair, but it might take time.",
      buttonText: "Roll to find spare safety glasses",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! You quickly find a brand new pair in the PPE drawer.", timeCost: 5 },
        failure: { logMessage: "You waste valuable time rummaging through closets and finally find a scratched pair of glasses. They'll do.", timeCost: 15 }
      }
    },
    'safety-boots': {
      title: "Missing Item: Safety Boots",
      text: "You realize you're not wearing proper steel-toed safety boots. This is a major safety violation on a response.",
      buttonText: "Roll to find a spare pair",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! You found a dusty but serviceable pair of boots in the back of the response truck.", timeCost: 5 },
        failure: { logMessage: "No luck. You have to proceed with your standard footwear, hoping no one notices.", timeCost: 0 },
      }
    },
    'pfd': {
      title: "Missing Item: PFD",
      text: "You can't find your life vest. You'll need it if you need to board a vessel. You try to find one, but it might take time.",
      buttonText: "Roll to look around",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! Last Friday's field day pays off! Right on the coat rack where you left it!", timeCost: 0 },
        failure: { logMessage: "You search high and low finally finding one...on Chief's coat rack. Hopefully she won't need it...", timeCost: 15 }
      }
    },
    'gas-meter': {
      title: "Missing Item: 4-Gas Meter",
      text: "You forgot your 4-Gas Meter. It's a critical safety item. You might see the charging station as you are walking out the door, but you might only remember when you get out to the vehicle and have to walk back to the office to get one.",
      buttonText: "Roll to find see if you notice the charging station.",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! See the charging station and do a quick bump test with your meter.", timeCost: 5 },
        failure: { logMessage: "You realize after you start the car that you forgot a 4-gas meter. You walk back to the office and see that charging station is empty. You find one on a shipmate's desk. It passes the bump test, but is only half-charged. Hopefully, that's enough...", timeCost: 15 }
      }
    },
    'rad-pager': {
      title: "Missing Item: Radiation Detection Device",
      text: "You forgot your rad pager. Coast Guard policy requires that a rad pager be carried by at least on team member.",
      buttonText: "Roll to see if you will be in compliance with policy.",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! You realize you left your rad pager on your desk.", timeCost: 5 },
        failure: { logMessage: "You waste valuable time trying to find batteries for the last rad pager on the shelf.", timeCost: 15 }
      }
    },
    'foul-weather-gear': {
      title: "Missing Item: PFD",
      text: "You forgot your Personal Flotation Device (PFD). It's a critical safety item. You can try to find a spare, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! You quickly find a spare PFD in a storage locker.", timeCost: 5 },
        failure: { logMessage: "You waste valuable time rummaging through closets and come up empty-handed.", timeCost: 15 }
      }
    },
    'food-water': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'ferry-pass': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'sample-kit': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'paperwork': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'duty-sup-call': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
    'jurisdiction': {
      title: "Missing Item: Gloves",
      text: "You can't find your gloves. They are a critical safety item. You try to find some, but it might take time.",
      buttonText: "Roll to find spare",
      attribute: "preparedness",
      outcomes: {
        success: { logMessage: "Success! The new PO3 is a rockstar: the PPE locker is freshly stocked with gloves in your size.", timeCost: 5 },
        failure: { logMessage: "You spend some time to look all over the office and finally find a right and left glove. They are different sizes and different colors, but they'll do.", timeCost: 15 }
      }
    },
  },

  checklist: [
    { category: "PPE", items: [
        { id: 'hard-hat', label: "Hard Hat", isRequired: true },
        { id: 'gloves', label: "Gloves", isRequired: true },
        { id: 'eye-pro', label: "Eye Protection", isRequired: true },
        { id: 'safety-boots', label: "Safety Boots", isRequired: true },
        { id: 'pfd', label: "Personal Flotation Device (PFD)", isRequired: true }
    ]},
    { category: "Equipment", items: [
        { id: 'gas-meter', label: "4-Gas Meter", isRequired: true },
        { id: 'rad-pager', label: "Radiation Pager", isRequired: true }
    ]},
    { category: "Personal Gear", items: [
        { id: 'foul-weather-gear', label: "Warm Clothing / Foul Weather Gear", isRequired: false },
        { id: 'food-water', label: "Snack & Water", isRequired: true },
        { id: 'ferry-pass', label: "Ferry Pass", isRequired: true },
        { id: 'sunscreen', label: "Sunscreen", isRequired: false, isBonus: true }
    ]},
    { category: "Administration", items: [
        { id: 'sample-kit', label: "Sample Kit (Checked)", isRequired: true },
        { id: 'paperwork', label: "NOFI, forms, notebook", isRequired: true },
        { id: 'investigation-notebook', label: "Dedicated Investigation Notebook", isRequired: false, isBonus: true },
        { id: 'duty-sup-call', label: "Call Duty Sup / Contact", isRequired: true },
        { id: 'jurisdiction', label: "Confirm Jurisdiction / Consult ACP", isRequired: true }
    ]}
  ]
};
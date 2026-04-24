export interface WelcomeContent {
  page1: {
    title: string
    intro: string
    emojiSection: {
      title: string
      steps: string[]
    }
    outro: string
  }
  page2: {
    title: string
    tabs: Array<{
      emoji: string
      label: string
      description: string
    }>
    ctaButton: string
    dontShowLabel: string
  }
}

export const welcomeContent: WelcomeContent = {
  page1: {
    title: "Der Plan 🎲",
    intro: "Spontanität pur!",
    emojiSection: {
      title: "🧠 Wie das funktioniert:",
      steps: [
        "Emoji wählen unten rechts im Profil (rechts neben den Tabs)",
        "Das ist eure Identität! Merk dir den Recovery Code für den Fall der Fälle",
        "Spiel starten → Nur der Admin (🦧) darf",
        "Würfel entscheidet → Du bist dran!",
        "Der Aktive bestimmt Location (mit App-Hilfe)",
        "Nächster wählen → Weiter im Flow!"
      ]
    },
    outro: "🎉 Niemand weiß, was kommt. Perfekt für Überraschungen!"
  },
  page2: {
    title: "Deine Sofia-Toolbox 🧰",
    tabs: [
      {
        emoji: "🎲",
        label: "Der Plan",
        description: "Hier läuft das Spiel → Würfel entscheidet, wer die nächste Location bestimmt"
      },
      {
        emoji: "🏨",
        label: "Hotel",
        description: "Alle Infos zu Hotel Niky → Check-in/Check-out, Tipps, Anreise vom Flughafen"
      },
      {
        emoji: "🇧🇬",
        label: "Sofia",
        description: "Dieses Wochenende in Sofia → Events: Tinariwen, Sean Paul, Levski vs CSKA, Farmers Market"
      },
      {
        emoji: "📍",
        label: "Karte",
        description: "Alle Locations auf der Karte → mehr als 70 Locations mit Kategorien, Notizen-Board"
      },
      {
        emoji: "📖",
        label: "Survival",
        description: "Überleben in Bulgarien → Phrasen, Transport, Preise, Notfallnummern"
      },
      {
        emoji: "📝",
        label: "Notizen",
        description: "Notiz-Board für alle → Ideen, Erinnerungen, gemeinsames Planen"
      }
    ],
    ctaButton: "Los geht's!",
    dontShowLabel: "Nicht mehr anzeigen"
  }
}

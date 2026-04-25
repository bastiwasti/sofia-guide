export interface WelcomeContent {
  page1: {
    title: string
    intro: string
    setupSection: {
      title: string
      steps: string[]
    }
    roundSection: {
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
    intro: "Kein festes Programm. Kein Stress.\nDer Würfel entscheidet — ihr genießt einfach.",
    setupSection: {
      title: "Einmalig zu Beginn",
      steps: [
        "Wählt euer Emoji unten rechts (neben den Tabs) — das ist eure Kennung fürs Wochenende",
        "Recovery Code merken, falls ihr das Gerät wechselt"
      ]
    },
    roundSection: {
      title: "So läuft jede Runde",
      steps: [
        "🦧 Admin startet → Würfel fällt → wer dran ist, bestimmt die nächste Location",
        "Die App zeigt Vorschläge auf der Karte — ihr müsst sie nicht nutzen. Spontan um die Ecke biegen ist genauso richtig.",
        "Gruppe will sich aufteilen? Völlig okay. Macht einfach, was sich gerade richtig anfühlt.",
        "Nächste Runde → nächster Spieler übernimmt den Würfel"
      ]
    },
    outro: "🎲 Niemand weiß, was als Nächstes kommt — genau so soll's sein."
  },
  page2: {
    title: "Deine Sofia-Toolbox 🧰",
    tabs: [
      {
        emoji: "🎲",
        label: "Der Plan",
        description: "Würfel drücken → zufälliger Spieler wird ausgewählt → der Aktive bestimmt die nächste Location. Recovery Code beim Emoji-Setup notieren — damit kommt ihr auf jedem Gerät wieder rein."
      },
      {
        emoji: "🏨",
        label: "Hotel",
        description: "Alles zu Hotel Niky: Adresse, Check-in/Check-out, Anreise vom Flughafen SOF per Metro oder Bolt, die beste Route — und ein paar Tipps die man erst nach der zweiten Nacht kennt."
      },
      {
        emoji: "🇧🇬",
        label: "Sofia",
        description: "Fun Facts, Kulturschocks und was dieses Wochenende in Sofia los ist — wir haben recherchiert, was geht. Plus: warum Nicken hier Nein bedeutet."
      },
      {
        emoji: "📍",
        label: "Karte",
        description: "70+ kuratierte Locations — Restaurants, Bars, Craft Beer, Nightlife, Sehenswürdigkeiten — farbkodiert nach Kategorie, filterbar oben.\n\nEntfernungsringe zeigen wie weit alles vom Hotel liegt.\n\nGPS-Button (Dock rechts unten), 3 Modi:\n• Aus — nichts wird übermittelt\n• Aktiv — Standort einmalig gesetzt, nicht laufend aktualisiert\n• Follow — laufende Aktualisierung. Nochmal drücken → aus, letzter Standort bleibt 5 Min sichtbar\n\nTap auf eine Location → Details aufklappen. Eigene Locations könnt ihr auch ergänzen."
      },
      {
        emoji: "📖",
        label: "Survival",
        description: "Bulgarien auf einen Blick: die wichtigsten Phrasen mit Aussprache, Transport (Bolt > Metro > Taxi), Preistabelle, Notfallnummern. Und nochmal: Kopfschütteln heißt Ja."
      },
      {
        emoji: "📝",
        label: "Notizen",
        description: "Das gemeinsame Board für alle. Idee loswerden, Empfehlung teilen, Geheimtipp posten — ohne Login, einfach schreiben und absenden. Alle sehen's in Echtzeit. Euer Emoji erscheint automatisch als Absender."
      },
      {
        emoji: "👤",
        label: "Profil / Emoji",
        description: "Euer Emoji ist eure Identität fürs Wochenende — einmal wählen, fertig.\n\n• Recovery Code: unbedingt notieren. Damit kommt ihr auf jedem Gerät wieder in euer Profil rein — kein Code, kein Zugang.\n• Switchen: Gerät wechseln oder kurz jemand anderem die Kontrolle übergeben? Recovery Code eingeben, fertig.\n• Aufgeben: wer aussteigt, kann seinen Slot freigeben. Der Platz bleibt dann frei für die nächste Runde."
      }
    ],
    ctaButton: "Los geht's!",
    dontShowLabel: "Nicht mehr anzeigen"
  }
}

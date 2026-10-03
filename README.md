# awake

Reselling-Plattform für dich und deine Freunde: Sessions, Lager mit Ordnern, Statistiken, Audit-Log, Freunde, 3 Sprachen (EN/DE/AR), 5 Themes + eigene Farben (Haupt- und Zweitfarbe), mehrere Bilder pro Artikel, **Workouts** (eigene Trainingspläne, Training starten, Fortschritt + Graphen), Animationen (Schneefall + eigene Emojis/Zeichen).
Läuft auf jedem Gerät (Handy, Tablet, Desktop). Enthält **keine** Nutzerdaten – die Datenbank startet leer.

Die Daten liegen bei Firebase (Firestore), nicht in den Dateien. Wenn du die Website auf GitHub aktualisierst, bleiben alle Accounts, Sessions und Artikel erhalten.

## 1. Firebase-Projekt anlegen (kostenlos)
1. Gehe auf https://console.firebase.google.com und klicke **Projekt hinzufügen** (Google Analytics kannst du ausschalten).
2. Links **Build → Firestore Database → Datenbank erstellen**. Standort: `eur3 (Europe)`. Modus: **Produktionsmodus**.
3. Reiter **Regeln**: den kompletten Inhalt durch die Datei `firestore.rules` ersetzen und **Veröffentlichen**.

## 2. Web-App registrieren
1. Projektübersicht → Zahnrad → **Projekteinstellungen** → unten **Deine Apps** → Symbol `</>` (Web).
2. Name z. B. `awake`, **Firebase Hosting nicht** aktivieren, registrieren.
3. Du bekommst ein `firebaseConfig`. Kopiere `apiKey`, `authDomain`, `projectId`, `appId` in die Datei `firebase-config.js`.

## 3. Auf GitHub hochladen
1. Auf https://github.com → **New repository** → Name z. B. `awake` → **Public** → Create.
2. Auf der Repo-Seite **uploading an existing file** klicken und **alle Dateien aus diesem Ordner** hineinziehen (index.html, style.css, app.js, sw.js, manifest.json, firebase-config.js, firestore.rules, README.md und alle .png-Dateien). Unten **Commit changes**.
3. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, Ordner: `/ (root)` → Save.
4. Nach ca. 1 Minute ist die Seite erreichbar unter `https://DEIN-NAME.github.io/awake/`. Diesen Link schickst du deinen Freunden.

## Als App installieren (PWA)
Die Seite ist als installierbare App eingerichtet (Icon, Startbildschirm, Offline-Start) – es ist nichts weiter einzurichten, das läuft automatisch über GitHub Pages.
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm".
- **Android (Chrome):** Seite öffnen → Menü (⋮) → „App installieren" bzw. „Zum Startbildschirm hinzufügen".
- **Desktop (Chrome/Edge):** In der Adressleiste erscheint ein Installieren-Symbol.

Kostenlos, kein App Store nötig. Wichtig: PWA-Installation funktioniert nur über `https://` (GitHub Pages liefert das automatisch), nicht beim lokalen Testen über `file://`.

## Sprachassistent (neuer Tab)
Das Logo-Symbol in der Navigation öffnet den **awake Assistant**: Kugel, Umschalter *Text | Voice*, Eingabefeld mit Fragen-Dropdown und Mikrofon.
- Antworten kommen **nur aus deinen echten awake-Daten** (Verkäufe, Gewinn, Umsatz, Lager, Aktivität). Gibt es etwas nicht, sagt awake das klar. Unten kannst du wählen, ob alle Sessions oder nur eine ausgewertet wird.
- **Text:** Antwort erscheint als Popup mit Live-Tippanimation. **Voice:** awake liest die Antwort vor, die Kugel reagiert.
- Spracheingabe und Vorlesen nutzen die Browser-Funktionen (Chrome, Edge, Safari; Firefox hat keine Spracherkennung). Nötig: `https://` und Mikrofon-Erlaubnis.
- **Echte KI später anschließen:** Vor `app.js` in `index.html` ein Script einfügen, z. B.
  `window.AWAKE_ASSISTANT_PROVIDER = async ({question, lang, data}) => { /* deine API aufrufen */ return "Antworttext"; };`
  `data` enthält ein kompaktes Abbild deiner Daten (ohne Bilder). Gibt die Funktion nichts zurück, nutzt awake die eingebaute Auswertung. Den API-Schlüssel nie direkt in die öffentliche Seite schreiben, sondern über einen eigenen Server-Proxy gehen.

## Workouts (neuer Tab, Hantel-Symbol)
- **Workouts:** mehrere Workouts als Karten. **+ Workout erstellen** führt Schritt für Schritt durch Name, Gewicht, Größe, Schritte pro Tag, Trainingshäufigkeit, Trainingstage und die Übungen pro Tag (Sätze, Wiederholungen, optional Gewicht; bearbeiten, löschen, verschieben).
- **Training:** *Workout starten* → Übung groß, *Satz geschafft*, automatisch nächster Satz/nächste Übung. *Später machen* schiebt die Übung ans Ende, *Übung überspringen* lässt sie aus (bleibt im Workout gespeichert). Zum Schluss Abschluss-Ansicht mit wechselnden Sprüchen. Ein laufendes Training bleibt beim Neuladen erhalten (*Fortsetzen*).
- **Fortschritt:** Gewicht, Größe und Schritte mit Datum eintragen; Graphen für Körperwerte und Training (Workouts, Häufigkeit, Sätze, Dauer, Volumen) mit Filter 7 / 14 / 30 Tage / Alle.
- **Alle Graphen** (auch die Session-Statistiken): Maus drüberfahren oder mit dem Finger tippen/wischen zeigt Datum + genauen Wert.
- **Daten:** liegen in Firestore unter `sessions/fit_<id>` (Pläne, Körperwerte) und `sessions/fitlog_<id>_<Jahr-Monat>` (abgeschlossene Trainings). Dafür ist **keine Änderung der Firestore-Regeln** nötig. Beim Löschen des Accounts werden sie mit gelöscht.

## Assistent stoppen
- Spricht oder hört awake gerade zu, stoppt ein **Klick auf die Kugel** sofort (Sprachausgabe/Mikrofon aus, Kugel zurück in Ruhe). Im Ruhezustand verhält sich die Kugel wie vorher.
- Sprachbefehl **„Stop"** (auch „Stopp", „Halt"): während awake spricht, lauscht der Browser auf dieses Wort. Das geht nur, wenn das Mikrofon schon einmal erlaubt wurde (es erscheint nie eine neue Berechtigungsfrage). Abschaltbar mit `AI_STOP_VOICE=false` in `app.js`.

## Updates
Geänderte Dateien im Repo ersetzen (Add file → Upload files, gleiche Namen überschreiben). Die Daten bleiben in Firebase erhalten.

## Wichtig zu wissen
- Die Regeln erlauben jedem mit dem Website-Link Lesen/Schreiben (Login läuft in der App selbst, Passwörter werden als Hash gespeichert). Das reicht für einen Freundeskreis, ist aber kein Bankniveau. Für einen öffentlichen Dienst sollte später Firebase Authentication ergänzt werden.
- Bilder werden automatisch verkleinert. Pro Session liegen Artikel und Audit-Log in einem Dokument (Firestore-Limit ca. 1 MB): mit Fotos passen grob 60 Artikel, ohne Fotos deutlich mehr. Mit mehreren Bildern pro Artikel (max. 5) wird es entsprechend früher voll; die App meldet es, bevor etwas verloren geht.

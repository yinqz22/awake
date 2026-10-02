# awake

Reselling-Plattform für dich und deine Freunde: Sessions, Lager mit Ordnern, Statistiken, Audit-Log, Freunde, 3 Sprachen (EN/DE/AR), 5 Themes + eigene Farben (Haupt- und Zweitfarbe), Animationen (Schneefall + eigene Emojis/Zeichen).
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

## Updates
Geänderte Dateien im Repo ersetzen (Add file → Upload files, gleiche Namen überschreiben). Die Daten bleiben in Firebase erhalten.

## Wichtig zu wissen
- Die Regeln erlauben jedem mit dem Website-Link Lesen/Schreiben (Login läuft in der App selbst, Passwörter werden als Hash gespeichert). Das reicht für einen Freundeskreis, ist aber kein Bankniveau. Für einen öffentlichen Dienst sollte später Firebase Authentication ergänzt werden.
- Bilder werden automatisch verkleinert. Pro Session liegen Artikel und Audit-Log in einem Dokument (Firestore-Limit ca. 1 MB): mit Fotos passen grob 60 Artikel, ohne Fotos deutlich mehr.

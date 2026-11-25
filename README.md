# J&K Media

Statische Website aus HTML, CSS und JavaScript. Alle für die Darstellung benötigten Dateien liegen im Projekt. Es gibt keinen Build-Schritt und keine zu installierenden Projektabhängigkeiten.

## Lokal ansehen

Im Projektordner mit einer installierten Python-3-Version starten und im Browser `http://127.0.0.1:8000/` öffnen.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Unter Windows kann der Python-Aufruf `py -3` heißen, unter macOS oder Linux `python3`.

## GitHub Pages für die Freigaberunde

Die übliche GitHub-Pages-Vorschau ist über das Internet erreichbar. `noindex` bittet Suchmaschinen, die Vorschau nicht aufzunehmen, und bietet keinen Zugriffsschutz. [GitHub-Dokumentation zur Veröffentlichungsquelle](https://docs.github.com/de/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

1. Ein leeres Repository im gewünschten GitHub-Konto anlegen. In diesem Beispiel heißt es `jk-media-vorschau`.
2. Im Projektordner die Dateien committen und hochladen. `EUER-KONTO` durch den GitHub-Benutzer- oder Organisationsnamen ersetzen.

   ```sh
   git init -b main
   git add index.html leistungen.html studio.html kontakt.html impressum.html datenschutz.html 404.html assets README.md .github/workflows/pages.yml
   git commit -m "J&K Media Website zur Freigabe vorbereiten"
   git remote add origin https://github.com/EUER-KONTO/jk-media-vorschau.git
   git push -u origin main
   ```

3. Im Repository unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** wählen. Der Workflow liegt bereits im Projekt.
4. Unter **Actions → GitHub Pages → Run workflow** den veröffentlichten Standardbranch auswählen. Nach dem Lauf erscheint die Adresse unter **Settings → Pages**, üblicherweise `https://EUER-KONTO.github.io/jk-media-vorschau/`.

Danach veröffentlicht der Workflow neue Commits auf dem Standardbranch. Er lädt die HTML-Dateien und `assets/` hoch und setzt für die Fehlerseite den passenden Basispfad. [GitHub-Dokumentation zu eigenen Pages-Workflows](https://docs.github.com/de/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Kontaktdaten und Inhalte

Die öffentlichen Einstellungen stehen in `assets/js/config.js`. Die Datei wird an den Browser ausgeliefert. Zugangsdaten und API-Schlüssel gehören in die Serverkonfiguration des jeweiligen Dienstes.

| Einstellung | Verwendung |
| --- | --- |
| `contactEmail` | Geschäftliche E-Mail-Adresse. Ohne Formular-Endpunkt öffnet das Formular einen Entwurf im E-Mail-Programm. |
| `phone` | Optionale geschäftliche Telefonnummer im internationalen Format. |
| `whatsappUrl` | Optionaler öffentlicher WhatsApp-Kontaktlink. |
| `bookingUrl` | Optionaler öffentlicher Link zu einem Buchungskalender. Ohne Kalender kann im Kontaktformular ein Wunschtermin angefragt werden. |
| `formEndpoint` | Optionaler Endpunkt, der Formularanfragen per JSON-POST annimmt. Bei einer anderen Origin muss er die Website per CORS zulassen. |
| `socialLinks` | Optionale Liste von Profilen mit je `label` und `url`. |

Mit leeren Kontaktwerten erzeugt das Formular einen kopierbaren Entwurf für den Test. Sobald echte Anfragen erwünscht sind, E-Mail oder Formular-Endpunkt eintragen und den Eingang mit einer Testnachricht prüfen. Vor dem regulären Start die Platzhalter unter **Impressum** und **Datenschutz** durch die für das Unternehmen und die tatsächlich eingesetzten Dienste geprüften Angaben ersetzen. Für Seiten, die auffindbar sein sollen, dann das `noindex`-Meta-Tag entfernen.

Der Formular-Endpunkt erhält `type`, `name` und `email`. Dazu kommen die ausgefüllten Felder `company`, `phone`, `service`, `message`, `preferredDate` und `preferredTime`. Für `type: "projekt"` ist `message` erforderlich. Für `type: "termin"` ist `preferredDate` im Format `JJJJ-MM-TT` erforderlich, eine angegebene Uhrzeit bezieht sich auf Berlin. Der Browser wertet HTTP-Status `2xx` als erfolgreiche Annahme. Bei einem Endpunkt auf einer anderen Origin muss er auch den `OPTIONS`-Preflight mit Freigabe von `POST` und `Content-Type` beantworten.

Die Wortmarke im Kopf und Fuß ist typografisch umgesetzt. Die Bilddateien in `assets/images/` lassen sich gegen freigegebenes eigenes Material austauschen. Das eingebaute ImageGen hat zwei Bildvorlagen erzeugt:

- `camera.webp` und `camera-mobile.webp` zeigen eine Kinokamera im schwarzen Studio mit magentafarbenem Kantenlicht. Das Briefing verlangte eine weite 2:1-Aufnahme mit dem Kamerarig rechts und einer dunklen Freifläche links für die Überschrift.
- `forum.webp`, `post.webp` und `portrait.webp` entstanden aus drei gleich hohen Bildstreifen. Das Briefing verlangte ein zeitgenössisches Podium mit Kameraperson, einen Schnittplatz mit zwei Monitoren und ein fiktives Interviewporträt. Alle Motive sollten wie dokumentarische Filmstills aussehen und ohne Marken, lesbare Schrift oder Wasserzeichen auskommen.

## Umzug auf einen anderen Webhoster

1. Einen Hostingtarif mit HTTPS für die gewünschte Domain einrichten. Die sieben HTML-Dateien und den Ordner `assets/` in das öffentliche Webverzeichnis übertragen. Die relativen Links funktionieren auch bei einer Bereitstellung unter einem Unterpfad.
2. `404.html` beim neuen Anbieter als Fehlerseite hinterlegen und ihr `<base href="./">` auf den Veröffentlichungsordner setzen, etwa `<base href="/">` bei einer eigenen Domain. So funktionieren die Links auch von einer tief verschachtelten Fehler-URL aus.
3. Startseite, Unterseiten und gegebenenfalls Formular und Buchung zunächst am Zielhost testen. Bei einem externen Formular-Endpunkt die neue Origin freigeben. Anschließend die Web-DNS-Einträge der Domain nach Vorgabe des Hosters umstellen.

Die Website und die geschäftliche E-Mail können dieselbe Domain nutzen und bei unterschiedlichen Anbietern liegen. Wer Proton Mail einsetzt, lässt die für Mail eingerichteten DNS-Einträge beim Wechsel des Webhosters bestehen. [Proton-Hilfe für eigene Mail-Domains](https://proton.me/support/custom-domain)

# Dove sta il sito, e come spostarlo

Il sito è statico: HTML, CSS, JavaScript e immagini. Non esegue codice
sul server, quindi può stare ovunque. Tutta la parte viva — prenotazioni,
check-in, prezzi, recensioni, pagamenti — sta nell'altra applicazione,
su Render, e non c'entra con questo spostamento.

## Perché spostarlo

Netlify conta i deploy a crediti. Il 25 ottobre 2026 i crediti del ciclo
sono finiti dopo diciotto pubblicazioni in una sera, e le pubblicazioni
in produzione sono rimaste bloccate fino al rinnovo del 16 novembre. Il
sito pubblicato continua a funzionare, ma non si può aggiornare.

Cloudflare Pages ospita siti statici senza contatori di deploy, e il
dominio è già su Cloudflare.

## Cosa si perde

Niente, a parte il pannello `/admin` di questo sito — rimosso in questo
commit. Modificava `availability.json`, che resta e continua a funzionare:
cambiano solo le notti minime e l'email di contatto, e si modificano nel
file invece che da un modulo. Quel pannello inseriva anche i periodi
occupati a mano, cosa che non serve più da quando arrivano dalle
prenotazioni Airbnb e da quelle diratte pagate.

Attenzione a non confonderlo con **checkin.mascarella89.com/admin**, che
è tutt'altro: lì ci sono prenotazioni, check-in, messaggi e pagamenti.
Quello sta su Render e non viene toccato.

## I passaggi, in ordine

1. Su Cloudflare, **Workers & Pages → Create → Pages → Connect to Git**,
   e autorizza il repository `francoleoni-web/mascarella-house-site`.
2. Impostazioni di build: **nessun comando**, cartella di output `/`
   (la radice). È un sito statico senza compilazione.
3. Lascia che pubblichi su `<nome>.pages.dev` e **apri quell'indirizzo**:
   deve funzionare tutto — calendario, prezzi, recensioni, modulo.
   Verifica prima di toccare il dominio.
4. Solo allora, in **Custom domains**, aggiungi `mascarella89.com` e
   `www.mascarella89.com`. Cloudflare aggiorna il DNS da sé.
5. Controlla il sito sul dominio vero. Se qualcosa non va, in DNS basta
   rimettere i valori di prima (annotati qui sotto) e torna su Netlify.

## I valori DNS attuali, per poter tornare indietro

    mascarella89.com        A      75.2.60.5
    www.mascarella89.com    CNAME  mascarella89.netlify.app

## Dopo lo spostamento

Non cancellare subito il sito su Netlify: lascialo qualche giorno come
rete di sicurezza. Quando sei tranquillo, lo togli.

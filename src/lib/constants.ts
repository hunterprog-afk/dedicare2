export const FRAMES_PATH  = "/frames"
export const FRAME_COUNT  = 120
export const FRAME_EXT    = "jpg" as const

export const NAV_ITEMS = [
  { key: "servizi",   href: "#servizi" },
  { key: "filosofia", href: "#filosofia" },
  { key: "processo",  href: "#processo" },
  { key: "faq",       href: "#faq" },
  { key: "lavora",    href: "#lavora-con-noi" },
] as const

export const PARTNERS = [
  "INPS",
  "ASL Milano",
  "CRI",
  "ANOSS",
  "Fondazione Sacra Famiglia",
  "AIAS",
]

export const SERVICES = [
  {
    icon: "Stethoscope",
    slug: "assistenza-infermieristica",
    image: "/images/services/assistenza-infermieristica.jpg",
    title: "Assistenza Infermieristica",
    body: "Interventi infermieristici professionali a domicilio e in ospedale, condotti da personale abilitato con competenze cliniche avanzate.",
    bullets: [
      "Somministrazione terapie e farmaci",
      "Monitoraggio parametri vitali",
      "Medicazioni e gestione ferite",
      "Educazione terapeutica al paziente",
      "Supporto post-operatorio",
    ],
  },
  {
    icon: "Heart",
    slug: "operatori-oss",
    image: "/images/services/operatori-oss.jpg",
    title: "Operatori OSS",
    body: "I nostri OSS offrono supporto qualificato e premuroso per la cura quotidiana, preservando dignità, autonomia e benessere.",
    bullets: [
      "Igiene personale e mobilizzazione",
      "Assistenza nell'alimentazione",
      "Supporto emotivo e compagnia",
      "Stimolazione cognitiva",
      "Coordinamento con i familiari",
    ],
  },
  {
    icon: "Clock",
    slug: "reperibilita-24-7",
    image: "/images/services/reperibilita-24-7.jpg",
    title: "Reperibilità 24/7",
    body: "Presenza garantita ogni ora del giorno e della notte. Risposta di emergenza rapida e gestione delle situazioni critiche.",
    bullets: [
      "Pronto intervento h24",
      "Risposta entro 30 minuti",
      "Gestione emergenze domiciliari",
      "Reperibilità festivi inclusi",
    ],
  },
  {
    icon: "Ambulance",
    slug: "trasporto-protetto",
    image: "/images/services/trasporto-protetto.jpg",
    title: "Trasporto Protetto",
    body: "Accompagnamento specializzato per visite, terapie e ogni spostamento che richiede assistenza sanitaria dedicata.",
    bullets: [
      "Trasporto sanitario assistito",
      "Accompagnamento a visite specialistiche",
      "Assistenza durante ricoveri",
      "Personale infermieristico a bordo",
    ],
  },
  {
    icon: "Activity",
    slug: "prevenzione-gratuita",
    image: "/images/services/prevenzione-gratuita.jpg",
    title: "Prevenzione Gratuita",
    body: "Prima di ogni intervento misuriamo gratuitamente i principali parametri vitali del paziente. Perché prevenire è cura.",
    bullets: [
      "Pressione arteriosa con sfigmomanometro digitale",
      "Saturazione SpO₂ con pulsossimetro",
      "Frequenza cardiaca e ritmo",
      "Segnalazione anomalie al medico curante",
      "Completamente gratuito ad ogni visita",
    ],
  },
  {
    icon: "Users",
    slug: "approccio-multidisciplinare",
    image: "/images/services/approccio-multidisciplinare.jpg",
    title: "Approccio Multidisciplinare",
    body: "Un team integrato di professionisti sanitari e socio-assistenziali per una presa in carico globale della persona.",
    bullets: [
      "Infermieri, OSS, fisioterapisti coordinati",
      "Piano di cura personalizzato",
      "Aggiornamenti periodici alla famiglia",
      "Continuità assistenziale garantita",
    ],
  },
]

export const REASONS = [
  {
    icon: "ShieldCheck",
    title: "Personale Certificato",
    body: "Selezione rigorosa e formazione continua. Ogni professionista è qualificato, assicurato e regolarmente aggiornato.",
  },
  {
    icon: "Clock",
    title: "Disponibili Sempre",
    body: "Reperibilità 24 ore su 24, 7 giorni su 7. Perché le necessità di salute non rispettano gli orari di ufficio.",
  },
  {
    icon: "MessageCircle",
    title: "Prima Consulenza Gratuita",
    body: "Un colloquio telefonico o WhatsApp senza impegno per comprendere le vostre esigenze e proporre la soluzione più adatta.",
  },
  {
    icon: "MapPin",
    title: "Area Metropolitana",
    body: "Copertura capillare nell'intera area metropolitana di Milano. Interveniamo dove siete, quando ne avete bisogno.",
  },
]

export const PROCESS_STEPS = [
  {
    n: "1",
    title: "Primo Contatto",
    body: "Consulenza gratuita telefonica o WhatsApp per comprendere le esigenze del paziente e della famiglia. Senza impegno.",
  },
  {
    n: "2",
    title: "Valutazione",
    body: "Valutazione clinica completa per definire un piano di cura personalizzato, condiviso con tutta la famiglia.",
  },
  {
    n: "3",
    title: "Attivazione",
    body: "Assegnazione del professionista più adatto e avvio tempestivo dell'assistenza con monitoraggio immediato dei parametri vitali.",
  },
  {
    n: "4",
    title: "Follow-up",
    body: "Aggiornamenti periodici alla famiglia, revisione del piano e reperibilità H24 per qualsiasi necessità clinica.",
  },
]

export const STATS = [
  { value: "24/7",  label: "Disponibilità" },
  { value: "100%",  label: "Cura personalizzata" },
  { value: "3+",    label: "Parametri vitali gratuiti" },
  { value: "MI",    label: "Area metropolitana coperta" },
]

export const TESTIMONIALS = [
  {
    quote: "Abbiamo affidato l'assistenza di nostra madre a Dedicare Solutions dopo una lunga ricerca. La cura e la professionalità che abbiamo trovato hanno superato ogni aspettativa.",
    name: "Famiglia Rossi",
    role: "Milano, paziente anziana",
  },
  {
    quote: "L'infermiera inviata era puntuale, competente e incredibilmente umana. Mio padre si è sentito subito a proprio agio. Non potevamo chiedere di meglio.",
    name: "Marco B.",
    role: "Segrate, paziente post-operatorio",
  },
  {
    quote: "La reperibilità notturna ci ha letteralmente salvato in una situazione di emergenza. In meno di 30 minuti avevano qualcuno a casa nostra.",
    name: "Giulia T.",
    role: "Pioltello, paziente anziana",
  },
  {
    quote: "Il piano di cura personalizzato che hanno costruito per nostra figlia è stato trasformativo. Finalmente ci sentiamo accompagnati, non soli.",
    name: "Famiglia Marino",
    role: "Cologno, paziente pediatrica",
  },
  {
    quote: "La consulenza iniziale gratuita mi ha convinto subito. Hanno capito la situazione in pochi minuti e proposto una soluzione concreta e sostenibile.",
    name: "Antonella V.",
    role: "Sesto San Giovanni",
  },
  {
    quote: "Professionisti seri, puntuali e sempre disponibili. La qualità dell'assistenza domiciliare è su un livello che non pensavo possibile nel privato.",
    name: "Roberto C.",
    role: "Milano, familiare caregiver",
  },
  {
    quote: "Da quando seguono mio nonno, la sua qualità di vita è migliorata visibilmente. Stimolazione cognitiva e attenzione alla persona, non solo alla malattia.",
    name: "Chiara L.",
    role: "Vimodrone, paziente con demenza",
  },
]

export const FAQ_ITEMS = [
  {
    q: "A chi si rivolge Dedicare Solutions?",
    a: "Assistiamo anziani, adulti post-ospedalizzazione, bambini e persone con disabilità fisiche o cognitive che necessitano di supporto sanitario o socio-assistenziale a domicilio, in ospedale o durante gli spostamenti nell'area metropolitana di Milano.",
  },
  {
    q: "La prima consulenza è davvero gratuita?",
    a: "Sì, completamente. Un colloquio telefonico o WhatsApp senza alcun impegno per comprendere le vostre esigenze, rispondere alle domande e proporre la soluzione più adatta. Chiamateci o scriveteci al +39 388 253 6992.",
  },
  {
    q: "Il personale è qualificato e assicurato?",
    a: "Assolutamente. Ogni professionista — infermieri, OSS, assistenti — è rigorosamente selezionato, in possesso delle qualifiche previste dalla normativa italiana, coperto da assicurazione professionale e sottoposto a formazione continua.",
  },
  {
    q: "Operate solo a Milano o anche nelle zone limitrofe?",
    a: "Copriamo l'intera area metropolitana di Milano: Segrate, Pioltello, Sesto San Giovanni, Cologno Monzese, Vimodrone e comuni limitrofi. Contatteci per verificare la copertura nella vostra zona.",
  },
  {
    q: "Come funziona l'assistenza notturna e nei weekend?",
    a: "Siamo disponibili 24 ore su 24, 7 giorni su 7, festivi inclusi. La reperibilità continua non è un'opzione aggiuntiva: è parte integrante del nostro servizio perché le necessità cliniche non seguono un orario.",
  },
  {
    q: "Cosa include la misurazione gratuita dei parametri vitali?",
    a: "Ad ogni visita, il nostro personale misura gratuitamente pressione arteriosa, saturazione dell'ossigeno e frequenza cardiaca. I valori vengono registrati e comunicati alla famiglia, contribuendo a un monitoraggio preventivo continuo.",
  },
  {
    q: "Come posso attivare il servizio rapidamente?",
    a: "Contatteci al +39 388 253 6992 o via email a info@dedicaresolutions.it. Dopo il colloquio iniziale gratuito, possiamo attivare il servizio in tempi molto brevi — spesso nelle 24-48 ore successive alla valutazione.",
  },
]

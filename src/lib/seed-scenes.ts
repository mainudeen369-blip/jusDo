import type { QuizQuestion } from "./types";

/** Famous Tamil films — story told sideways; guess the movie. Difficult set of 15. */
export const SEED_SCENES: QuizQuestion[] = [
  {
    id: "sc1",
    star: "both",
    difficulty: "difficult",
    prompt:
      "One body, two personalities: a brilliant creator’s machine becomes a charming hero… then a ruthless villain who falls for the hero’s love. Which film?",
    options: [
      { id: "a", text: "Robot / Enthiran" },
      { id: "b", text: "Dasavathaaram" },
      { id: "c", text: "Anniyan" },
      { id: "d", text: "I" },
    ],
    correctOptionId: "a",
    funFact: "Enthiran (2010) — Chitti’s dual nature is the classic Rajinikanth–Shankar mass sci-fi beat.",
  },
  {
    id: "sc2",
    star: "both",
    difficulty: "difficult",
    prompt:
      "By day he pulls an auto and lives quietly; the city still whispers about a feared don from his past. A sister’s wedding pulls that past back. Which film?",
    options: [
      { id: "a", text: "Baashha" },
      { id: "b", text: "Billa" },
      { id: "c", text: "Nayakan" },
      { id: "d", text: "Thalapathi" },
    ],
    correctOptionId: "a",
    funFact: "Baashha — “style is the man” and the auto-driver reveal are pure 90s theatre folklore.",
  },
  {
    id: "sc3",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A meek man hides other selves inside him — one obsessively neat, one a fierce vigilante who punishes injustice. A butterfly / “Anniyan” cue unlocks the switch. Which film?",
    options: [
      { id: "a", text: "Chandramukhi" },
      { id: "b", text: "Anniyan" },
      { id: "c", text: "Dasavathaaram" },
      { id: "d", text: "Virumaandi" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc4",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A psychiatric hospital, a haunted dancer’s legend, and a doctor who must face what others call a ghost. Which film?",
    options: [
      { id: "a", text: "Kanchana" },
      { id: "b", text: "Chandramukhi" },
      { id: "c", text: "Muni" },
      { id: "d", text: "Aranmanai" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc5",
    star: "both",
    difficulty: "difficult",
    prompt:
      "Kabaddi dust, a runaway romance, and a powerful father who wants the hero crushed — mass entry through sport. Which film?",
    options: [
      { id: "a", text: "Ghilli" },
      { id: "b", text: "Thirupaachi" },
      { id: "c", text: "Madhurey" },
      { id: "d", text: "Sachein" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sc6",
    star: "both",
    difficulty: "difficult",
    prompt:
      "Ten faces, one crisis: a bio-weapon threat, faith and science colliding, and a disaster wave in the climax era of Tamil epics. Which film?",
    options: [
      { id: "a", text: "Enthiran" },
      { id: "b", text: "Dasavathaaram" },
      { id: "c", text: "Indian" },
      { id: "d", text: "Sivaji" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc7",
    star: "both",
    difficulty: "difficult",
    prompt:
      "An aging freedom-fighter turns vigilante against corruption; the system hunts him while the public debates justice. Which film?",
    options: [
      { id: "a", text: "Indian (Hindustani)" },
      { id: "b", text: "Mudhalvan" },
      { id: "c", text: "Sivaji" },
      { id: "d", text: "Aalavandhan" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sc8",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A common man is dared to become Chief Minister for a day — and the city learns what power can clean… or corrupt. Which film?",
    options: [
      { id: "a", text: "Mudhalvan" },
      { id: "b", text: "Indian" },
      { id: "c", text: "Sarkar" },
      { id: "d", text: "Politician" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sc9",
    star: "both",
    difficulty: "difficult",
    prompt:
      "Black money, a black wig climax vibe, and a hero who takes on the tax / underground finance network with swagger. Which film?",
    options: [
      { id: "a", text: "Sivaji: The Boss" },
      { id: "b", text: "Kuselan" },
      { id: "c", text: "Baba" },
      { id: "d", text: "Chandramukhi" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sc10",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A soft-spoken army officer returns home; sleeper cells and a calm villain turn Chennai into a chessboard of bombs and bluffs. Which film?",
    options: [
      { id: "a", text: "Kaththi" },
      { id: "b", text: "Thuppakki" },
      { id: "c", text: "Beast" },
      { id: "d", text: "Theri" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc11",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A heist night, a grey anti-hero who plays everyone, and loyalty that flips like cards on a table. Which film?",
    options: [
      { id: "a", text: "Mankatha" },
      { id: "b", text: "Billa" },
      { id: "c", text: "Aarambam" },
      { id: "d", text: "Yennai Arindhaal" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sc12",
    star: "both",
    difficulty: "difficult",
    prompt:
      "Friendship forged like Karna’s fate: a discarded boy becomes a feared gangster, bound to a friend who rises in politics. Mani Ratnam rain and tragedy. Which film?",
    options: [
      { id: "a", text: "Nayakan" },
      { id: "b", text: "Thalapathi" },
      { id: "c", text: "Kannathil Muthamittal" },
      { id: "d", text: "Roja" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc13",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A newlywed’s husband is kidnapped into a conflict zone; she fights systems and silence to bring him back — music that made history. Which film?",
    options: [
      { id: "a", text: "Bombay" },
      { id: "b", text: "Roja" },
      { id: "c", text: "Kannathil Muthamittal" },
      { id: "d", text: "Alaipayuthey" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sc14",
    star: "both",
    difficulty: "difficult",
    prompt:
      "A cafe owner wants a quiet life, but a past name and a hunting gang force the mask off — “Bloody sweet” energy. Which film?",
    options: [
      { id: "a", text: "Master" },
      { id: "b", text: "Kaithi" },
      { id: "c", text: "Leo" },
      { id: "d", text: "Vikram" },
    ],
    correctOptionId: "c",
  },
  {
    id: "sc15",
    star: "both",
    difficulty: "difficult",
    prompt:
      "Black squads, a legendary agent pulled back into the game, and a drug empire that turns the city into a night-war. Which film?",
    options: [
      { id: "a", text: "Kaithi" },
      { id: "b", text: "Vikram (2022)" },
      { id: "c", text: "Leo" },
      { id: "d", text: "Beast" },
    ],
    correctOptionId: "b",
    funFact: "Lokesh cinematic universe fans connect Vikram with Rolex / Kaithi threads.",
  },
];

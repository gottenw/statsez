"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "../../components/navigation";
import { Footer } from "../../components/footer";
import { ScrambleText } from "../../components/scramble-text";

const responseFormats = {
  leagues: {
    "success": true,
    "data": {
      "leagues": [
        { "id": "brazil-serie-a-2025", "name": "Série A", "country": "brazil", "season": "2025", "slug": "brazil-serie-a" },
        { "id": "england-premier-league-2025-2026", "name": "Premier League", "country": "england", "season": "2025-2026", "slug": "england-premier-league" },
        { "id": "spain-laliga-2025-2026", "name": "LaLiga", "country": "spain", "season": "2025-2026", "slug": "spain-laliga" },
        { "id": "germany-bundesliga-2025-2026", "name": "Bundesliga", "country": "germany", "season": "2025-2026", "slug": "germany-bundesliga" },
        { "id": "italy-serie-a-2025-2026", "name": "Serie A", "country": "italy", "season": "2025-2026", "slug": "italy-serie-a" },
        { "id": "france-ligue-1-2025-2026", "name": "Ligue 1", "country": "france", "season": "2025-2026", "slug": "france-ligue-1" },
        { "id": "portugal-liga-portugal-2025-2026", "name": "Liga Portugal", "country": "portugal", "season": "2025-2026", "slug": "portugal-liga-portugal" },
        { "id": "netherlands-eredivisie-2025-2026", "name": "Eredivisie", "country": "netherlands", "season": "2025-2026", "slug": "netherlands-eredivisie" }
      ],
      "total": 84,
      "filters": { "country": null }
    }
  },
  fixtures: {
    "success": true,
    "data": {
      "fixtures": [
        { "id": "lbnqyVFq", "date": "2026-02-08T16:30:00.000Z", "round": "Round 25", "homeTeam": { "name": "Liverpool" }, "awayTeam": { "name": "Man City" }, "score": { "fullTime": { "home": 1, "away": 2 }, "halfTime": { "home": 0, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "lrdmg9KU", "date": "2026-02-08T14:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Brighton" }, "awayTeam": { "name": "Crystal Palace" }, "score": { "fullTime": { "home": 0, "away": 1 }, "halfTime": { "home": 0, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "xKSwcCx3", "date": "2026-02-07T17:30:00.000Z", "round": "Round 25", "homeTeam": { "name": "Newcastle" }, "awayTeam": { "name": "Brentford" }, "score": { "fullTime": { "home": 2, "away": 3 }, "halfTime": { "home": 1, "away": 2 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "K24WdiL5", "date": "2026-02-07T15:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Arsenal" }, "awayTeam": { "name": "Sunderland" }, "score": { "fullTime": { "home": 3, "away": 0 }, "halfTime": { "home": 1, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "GUcueVkI", "date": "2026-02-07T15:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Bournemouth" }, "awayTeam": { "name": "Aston Villa" }, "score": { "fullTime": { "home": 1, "away": 1 }, "halfTime": { "home": 0, "away": 1 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "UyEecLWo", "date": "2026-02-07T15:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Burnley" }, "awayTeam": { "name": "West Ham" }, "score": { "fullTime": { "home": 0, "away": 2 }, "halfTime": { "home": 0, "away": 2 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "MqW2ea1b", "date": "2026-02-07T15:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Fulham" }, "awayTeam": { "name": "Everton" }, "score": { "fullTime": { "home": 1, "away": 2 }, "halfTime": { "home": 1, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "dMruej7F", "date": "2026-02-07T15:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Wolverhampton" }, "awayTeam": { "name": "Chelsea" }, "score": { "fullTime": { "home": 1, "away": 3 }, "halfTime": { "home": 0, "away": 3 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "pQuhZ8pd", "date": "2026-02-07T12:30:00.000Z", "round": "Round 25", "homeTeam": { "name": "Manchester Utd" }, "awayTeam": { "name": "Tottenham" }, "score": { "fullTime": { "home": 2, "away": 0 }, "halfTime": { "home": 1, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "raKBgwWA", "date": "2026-02-06T20:00:00.000Z", "round": "Round 25", "homeTeam": { "name": "Leeds" }, "awayTeam": { "name": "Nottm Forest" }, "score": { "fullTime": { "home": 3, "away": 1 }, "halfTime": { "home": 2, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" }
      ],
      "total": 10,
      "filters": { "league": "england-premier-league-2025-2026", "round": "Round 25" }
    }
  },
  standings: {
    "success": true,
    "data": {
      "league": "Premier League",
      "country": "england",
      "season": "2025-2026",
      "standings": [
        { "position": 1, "team": "Arsenal", "played": 25, "won": 17, "drawn": 5, "lost": 3, "goalsFor": 49, "goalsAgainst": 17, "points": 56, "goalDifference": 32 },
        { "position": 2, "team": "Man City", "played": 25, "won": 15, "drawn": 5, "lost": 5, "goalsFor": 51, "goalsAgainst": 24, "points": 50, "goalDifference": 27 },
        { "position": 3, "team": "Manchester Utd", "played": 26, "won": 13, "drawn": 8, "lost": 5, "goalsFor": 50, "goalsAgainst": 37, "points": 47, "goalDifference": 13 },
        { "position": 4, "team": "Aston Villa", "played": 25, "won": 14, "drawn": 5, "lost": 6, "goalsFor": 36, "goalsAgainst": 27, "points": 47, "goalDifference": 9 },
        { "position": 5, "team": "Chelsea", "played": 25, "won": 12, "drawn": 7, "lost": 6, "goalsFor": 45, "goalsAgainst": 28, "points": 43, "goalDifference": 17 },
        { "position": 6, "team": "Liverpool", "played": 25, "won": 11, "drawn": 6, "lost": 8, "goalsFor": 40, "goalsAgainst": 35, "points": 39, "goalDifference": 5 },
        { "position": 7, "team": "Brentford", "played": 25, "won": 12, "drawn": 3, "lost": 10, "goalsFor": 39, "goalsAgainst": 34, "points": 39, "goalDifference": 5 },
        { "position": 8, "team": "Everton", "played": 25, "won": 10, "drawn": 7, "lost": 8, "goalsFor": 28, "goalsAgainst": 28, "points": 37, "goalDifference": 0 },
        { "position": 9, "team": "Sunderland", "played": 25, "won": 9, "drawn": 9, "lost": 7, "goalsFor": 27, "goalsAgainst": 29, "points": 36, "goalDifference": -2 },
        { "position": 10, "team": "Crystal Palace", "played": 26, "won": 9, "drawn": 8, "lost": 9, "goalsFor": 28, "goalsAgainst": 30, "points": 35, "goalDifference": -2 },
        { "position": 11, "team": "Bournemouth", "played": 25, "won": 8, "drawn": 10, "lost": 7, "goalsFor": 41, "goalsAgainst": 44, "points": 34, "goalDifference": -3 },
        { "position": 12, "team": "Fulham", "played": 26, "won": 10, "drawn": 4, "lost": 12, "goalsFor": 36, "goalsAgainst": 39, "points": 34, "goalDifference": -3 },
        { "position": 13, "team": "Newcastle", "played": 25, "won": 9, "drawn": 6, "lost": 10, "goalsFor": 35, "goalsAgainst": 36, "points": 33, "goalDifference": -1 },
        { "position": 14, "team": "Brighton", "played": 26, "won": 7, "drawn": 11, "lost": 8, "goalsFor": 35, "goalsAgainst": 34, "points": 32, "goalDifference": 1 },
        { "position": 15, "team": "Tottenham", "played": 25, "won": 7, "drawn": 8, "lost": 10, "goalsFor": 35, "goalsAgainst": 35, "points": 29, "goalDifference": 0 },
        { "position": 16, "team": "Leeds", "played": 25, "won": 7, "drawn": 8, "lost": 10, "goalsFor": 34, "goalsAgainst": 43, "points": 29, "goalDifference": -9 },
        { "position": 17, "team": "Nottm Forest", "played": 25, "won": 7, "drawn": 5, "lost": 13, "goalsFor": 25, "goalsAgainst": 38, "points": 26, "goalDifference": -13 },
        { "position": 18, "team": "West Ham", "played": 26, "won": 6, "drawn": 6, "lost": 14, "goalsFor": 32, "goalsAgainst": 49, "points": 24, "goalDifference": -17 },
        { "position": 19, "team": "Burnley", "played": 25, "won": 3, "drawn": 6, "lost": 16, "goalsFor": 25, "goalsAgainst": 49, "points": 15, "goalDifference": -24 },
        { "position": 20, "team": "Wolverhampton", "played": 26, "won": 1, "drawn": 5, "lost": 20, "goalsFor": 17, "goalsAgainst": 52, "points": 8, "goalDifference": -35 }
      ]
    }
  },
  stats: {
    "success": true,
    "data": {
      "matchId": "lbnqyVFq",
      "periods": [
        {
          "period": "Match",
          "stats": [
            { "statId": "expected_goals__xg_", "statName": "Expected goals (xG)", "homeValue": "1.21", "awayValue": "2.75" },
            { "statId": "ball_possession", "statName": "Ball possession", "homeValue": "47%", "awayValue": "53%" },
            { "statId": "total_shots", "statName": "Total shots", "homeValue": "15", "awayValue": "17" },
            { "statId": "shots_on_target", "statName": "Shots on target", "homeValue": "4", "awayValue": "7" },
            { "statId": "big_chances", "statName": "Big chances", "homeValue": "1", "awayValue": "3" },
            { "statId": "corner_kicks", "statName": "Corner kicks", "homeValue": "5", "awayValue": "4" },
            { "statId": "passes", "statName": "Passes", "homeValue": "78% (306/390)", "awayValue": "85% (393/465)" },
            { "statId": "yellow_cards", "statName": "Yellow cards", "homeValue": "2", "awayValue": "4" },
            { "statId": "red_cards", "statName": "Red cards", "homeValue": "1", "awayValue": "0" },
            { "statId": "xg_on_target__xgot_", "statName": "xG on target (xGOT)", "homeValue": "0.34", "awayValue": "1.99" },
            { "statId": "shots_off_target", "statName": "Shots off target", "homeValue": "8", "awayValue": "6" },
            { "statId": "blocked_shots", "statName": "Blocked shots", "homeValue": "3", "awayValue": "4" },
            { "statId": "shots_inside_the_box", "statName": "Shots inside the box", "homeValue": "9", "awayValue": "9" },
            { "statId": "shots_outside_the_box", "statName": "Shots outside the box", "homeValue": "6", "awayValue": "8" },
            { "statId": "hit_the_woodwork", "statName": "Hit the woodwork", "homeValue": "0", "awayValue": "0" },
            { "statId": "touches_in_opposition_box", "statName": "Touches in opposition box", "homeValue": "32", "awayValue": "25" },
            { "statId": "accurate_through_passes", "statName": "Accurate through passes", "homeValue": "1", "awayValue": "2" },
            { "statId": "offsides", "statName": "Offsides", "homeValue": "6", "awayValue": "2" },
            { "statId": "free_kicks", "statName": "Free kicks", "homeValue": "16", "awayValue": "13" },
            { "statId": "long_passes", "statName": "Long passes", "homeValue": "46% (30/65)", "awayValue": "38% (20/53)" },
            { "statId": "passes_in_final_third", "statName": "Passes in final third", "homeValue": "67% (97/144)", "awayValue": "80% (109/137)" },
            { "statId": "crosses", "statName": "Crosses", "homeValue": "29% (6/21)", "awayValue": "27% (3/11)" },
            { "statId": "expected_assists__xa_", "statName": "Expected assists (xA)", "homeValue": "0.93", "awayValue": "1.26" },
            { "statId": "throw_ins", "statName": "Throw ins", "homeValue": "15", "awayValue": "16" },
            { "statId": "fouls", "statName": "Fouls", "homeValue": "13", "awayValue": "16" },
            { "statId": "tackles", "statName": "Tackles", "homeValue": "53% (9/17)", "awayValue": "53% (8/15)" },
            { "statId": "duels_won", "statName": "Duels won", "homeValue": "49", "awayValue": "51" },
            { "statId": "clearances", "statName": "Clearances", "homeValue": "20", "awayValue": "31" },
            { "statId": "interceptions", "statName": "Interceptions", "homeValue": "7", "awayValue": "10" },
            { "statId": "errors_leading_to_shot", "statName": "Errors leading to shot", "homeValue": "2", "awayValue": "2" },
            { "statId": "errors_leading_to_goal", "statName": "Errors leading to goal", "homeValue": "0", "awayValue": "0" },
            { "statId": "goalkeeper_saves", "statName": "Goalkeeper saves", "homeValue": "5", "awayValue": "3" },
            { "statId": "xgot_faced", "statName": "xGOT faced", "homeValue": "1.99", "awayValue": "0.34" },
            { "statId": "goals_prevented", "statName": "Goals prevented", "homeValue": "-0.01", "awayValue": "-0.66" }
          ]
        }
      ]
    }
  },
  lineups: {
    "success": true,
    "data": {
      "matchId": "lbnqyVFq",
      "home": {
        "formation": "4-3-3",
        "players": [
          { "participantId": "1", "participantName": "Alisson", "participantSurname": "Becker", "participantNumber": "1", "participantCountry": "BRA", "playerType": "FirstTeam", "positionKey": "GK" },
          { "participantId": "66", "participantName": "Trent", "participantSurname": "Alexander-Arnold", "participantNumber": "66", "participantCountry": "ENG", "playerType": "FirstTeam", "positionKey": "DR" },
          { "participantId": "4", "participantName": "Virgil", "participantSurname": "van Dijk", "participantNumber": "4", "participantCountry": "NED", "playerType": "FirstTeam", "positionKey": "DC" },
          { "participantId": "5", "participantName": "Ibrahima", "participantSurname": "Konaté", "participantNumber": "5", "participantCountry": "FRA", "playerType": "FirstTeam", "positionKey": "DC" },
          { "participantId": "26", "participantName": "Andrew", "participantSurname": "Robertson", "participantNumber": "26", "participantCountry": "SCO", "playerType": "FirstTeam", "positionKey": "DL" },
          { "participantId": "3", "participantName": "Wataru", "participantSurname": "Endo", "participantNumber": "3", "participantCountry": "JPN", "playerType": "FirstTeam", "positionKey": "MC" },
          { "participantId": "10", "participantName": "Alexis", "participantSurname": "Mac Allister", "participantNumber": "10", "participantCountry": "ARG", "playerType": "FirstTeam", "positionKey": "MC" },
          { "participantId": "8", "participantName": "Dominik", "participantSurname": "Szoboszlai", "participantNumber": "8", "participantCountry": "HUN", "playerType": "FirstTeam", "positionKey": "MC" },
          { "participantId": "11", "participantName": "Mohamed", "participantSurname": "Salah", "participantNumber": "11", "participantCountry": "EGY", "playerType": "FirstTeam", "positionKey": "RW" },
          { "participantId": "9", "participantName": "Darwin", "participantSurname": "Núñez", "participantNumber": "9", "participantCountry": "URU", "playerType": "FirstTeam", "positionKey": "ST" },
          { "participantId": "7", "participantName": "Luis", "participantSurname": "Díaz", "participantNumber": "7", "participantCountry": "COL", "playerType": "FirstTeam", "positionKey": "LW" }
        ]
      },
      "away": {
        "formation": "4-1-4-1",
        "players": [
          { "participantId": "31", "participantName": "Ederson", "participantSurname": "Moraes", "participantNumber": "31", "participantCountry": "BRA", "playerType": "FirstTeam", "positionKey": "GK" },
          { "participantId": "2", "participantName": "Kyle", "participantSurname": "Walker", "participantNumber": "2", "participantCountry": "ENG", "playerType": "FirstTeam", "positionKey": "DR" },
          { "participantId": "3", "participantName": "Rúben", "participantSurname": "Dias", "participantNumber": "3", "participantCountry": "POR", "playerType": "FirstTeam", "positionKey": "DC" },
          { "participantId": "25", "participantName": "Manuel", "participantSurname": "Akanji", "participantNumber": "25", "participantCountry": "SUI", "playerType": "FirstTeam", "positionKey": "DC" },
          { "participantId": "24", "participantName": "Josko", "participantSurname": "Gvardiol", "participantNumber": "24", "participantCountry": "CRO", "playerType": "FirstTeam", "positionKey": "DL" },
          { "participantId": "16", "participantName": "Rodri", "participantSurname": "Hernández", "participantNumber": "16", "participantCountry": "ESP", "playerType": "FirstTeam", "positionKey": "DMC" },
          { "participantId": "20", "participantName": "Bernardo", "participantSurname": "Silva", "participantNumber": "20", "participantCountry": "POR", "playerType": "FirstTeam", "positionKey": "MR" },
          { "participantId": "17", "participantName": "Kevin", "participantSurname": "De Bruyne", "participantNumber": "17", "participantCountry": "BEL", "playerType": "FirstTeam", "positionKey": "MC" },
          { "participantId": "47", "participantName": "Phil", "participantSurname": "Foden", "participantNumber": "47", "participantCountry": "ENG", "playerType": "FirstTeam", "positionKey": "MC" },
          { "participantId": "11", "participantName": "Jérémy", "participantSurname": "Doku", "participantNumber": "11", "participantCountry": "BEL", "playerType": "FirstTeam", "positionKey": "ML" },
          { "participantId": "9", "participantName": "Erling", "participantSurname": "Haaland", "participantNumber": "9", "participantCountry": "NOR", "playerType": "FirstTeam", "positionKey": "ST" }
        ]
      }
    }
  },
  events: {
    "success": true,
    "data": {
      "matchId": "lbnqyVFq",
      "events": [
        { "minute": "12'", "order": 1, "event": "GOAL", "label": "Goal", "is_home": false, "is_away": true, "player": { "id": "9", "name": "Erling Haaland" }, "info": { "id": "17", "name": "Kevin De Bruyne" } },
        { "minute": "34'", "order": 2, "event": "YELLOW_CARD", "label": "Yellow Card", "is_home": true, "is_away": false, "player": { "id": "4", "name": "Virgil van Dijk" }, "info": null },
        { "minute": "45+2'", "order": 3, "event": "GOAL", "label": "Goal", "is_home": true, "is_away": false, "player": { "id": "11", "name": "Mohamed Salah" }, "info": { "id": "66", "name": "Trent Alexander-Arnold" } },
        { "minute": "82'", "order": 4, "event": "GOAL", "label": "Goal", "is_home": false, "is_away": true, "player": { "id": "47", "name": "Phil Foden" }, "info": null }
      ]
    }
  },
  teams: {
    "success": true,
    "data": {
      "teams": [
        { "name": "Arsenal", "country": "england" },
        { "name": "Aston Villa", "country": "england" },
        { "name": "Bournemouth", "country": "england" },
        { "name": "Brentford", "country": "england" },
        { "name": "Brighton", "country": "england" },
        { "name": "Burnley", "country": "england" },
        { "name": "Chelsea", "country": "england" },
        { "name": "Crystal Palace", "country": "england" },
        { "name": "Everton", "country": "england" },
        { "name": "Fulham", "country": "england" },
        { "name": "Leeds", "country": "england" },
        { "name": "Liverpool", "country": "england" },
        { "name": "Man City", "country": "england" },
        { "name": "Manchester Utd", "country": "england" },
        { "name": "Newcastle", "country": "england" },
        { "name": "Nottm Forest", "country": "england" },
        { "name": "Sunderland", "country": "england" },
        { "name": "Tottenham", "country": "england" },
        { "name": "West Ham", "country": "england" },
        { "name": "Wolverhampton", "country": "england" }
      ],
      "total": 20,
      "filters": { "league": "england-premier-league-2025-2026" }
    }
  },
  teamFixtures: {
    "success": true,
    "data": {
      "team": "Liverpool",
      "fixtures": [
        { "id": "lbnqyVFq", "date": "2026-02-08T16:30:00.000Z", "round": "Round 25", "homeTeam": { "name": "Liverpool" }, "awayTeam": { "name": "Man City" }, "score": { "fullTime": { "home": 1, "away": 2 }, "halfTime": { "home": 0, "away": 0 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "bTitnz7m", "date": "2026-01-31T20:00:00.000Z", "round": "Round 24", "homeTeam": { "name": "Liverpool" }, "awayTeam": { "name": "Newcastle" }, "score": { "fullTime": { "home": 4, "away": 1 }, "halfTime": { "home": 2, "away": 1 } }, "status": "FINISHED", "league": "Premier League", "country": "england" },
        { "id": "IHUdJpXq", "date": "2026-01-24T17:30:00.000Z", "round": "Round 23", "homeTeam": { "name": "Bournemouth" }, "awayTeam": { "name": "Liverpool" }, "score": { "fullTime": { "home": 3, "away": 2 }, "halfTime": { "home": 2, "away": 1 } }, "status": "FINISHED", "league": "Premier League", "country": "england" }
      ],
      "total": 25
    }
  },
  leagueStats: {
    "success": true,
    "data": {
      "league": "Premier League",
      "stats": { "totalMatches": 253, "totalGoals": 708, "avgGoalsPerMatch": 2.8, "homeWins": 110, "awayWins": 77, "draws": 66 }
    }
  },
  leagueSeasons: {
    "success": true,
    "data": {
      "league": "Premier League",
      "country": "England",
      "seasons": ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021", "2019-2020", "2018-2019", "2017-2018", "2016-2017"]
    }
  }
};

const endpoints = [
  {
    id: "leagues",
    name: "LEAGUES",
    method: "GET",
    path: "/v1/football/leagues",
    description: "List all supported competitions across 170+ countries.",
    params: [{ name: "country", type: "string", required: false, desc: "Filter by country slug" }],
    response: responseFormats.leagues
  },
  {
    id: "fixtures",
    name: "FIXTURES",
    method: "GET",
    path: "/v1/football/fixtures",
    description: "Get completed match list with final and partial scores.",
    params: [
      { name: "league", type: "string", required: true, desc: "League ID" },
      { name: "season", type: "string", required: false, desc: "Season (e.g. 2024-2025). Defaults to current." },
      { name: "team", type: "string", required: false, desc: "Filter by team name" },
      { name: "round", type: "string", required: false, desc: "Filter by round" },
      { name: "dateFrom", type: "string", required: false, desc: "Range start (YYYY-MM-DD)" },
      { name: "dateTo", type: "string", required: false, desc: "Range end (YYYY-MM-DD)" }
    ],
    response: responseFormats.fixtures
  },
  {
    id: "standings",
    name: "STANDINGS",
    method: "GET",
    path: "/v1/football/standings",
    description: "Full league table including points, goals, and difference.",
    params: [
      { name: "league", type: "string", required: true, desc: "League ID" },
      { name: "season", type: "string", required: false, desc: "Season (e.g. 2024-2025). Defaults to current." }
    ],
    response: responseFormats.standings
  },
  {
    id: "stats",
    name: "STATISTICS",
    method: "GET",
    path: "/v1/football/fixtures/{id}/stats",
    description: "Comprehensive match performance data (34+ metrics).",
    params: [{ name: "id", type: "string", required: true, desc: "Match ID" }],
    response: responseFormats.stats
  },
  {
    id: "lineups",
    name: "LINEUPS",
    method: "GET",
    path: "/v1/football/fixtures/{id}/lineups",
    description: "Starting XI, tactical formations, and player metadata.",
    params: [{ name: "id", type: "string", required: true, desc: "Match ID" }],
    response: responseFormats.lineups
  },
  {
    id: "events",
    name: "EVENTS",
    method: "GET",
    path: "/v1/football/fixtures/{id}/events",
    description: "Match timeline: goals, assists, cards, and substitutions.",
    params: [{ name: "id", type: "string", required: true, desc: "Match ID" }],
    response: responseFormats.events
  },
  {
    id: "teams",
    name: "TEAMS",
    method: "GET",
    path: "/v1/football/teams",
    description: "List all clubs available in a specific competition.",
    params: [
      { name: "league", type: "string", required: true, desc: "League ID" },
      { name: "season", type: "string", required: false, desc: "Season (e.g. 2024-2025). Defaults to current." },
      { name: "search", type: "string", required: false, desc: "Filter by team name" }
    ],
    response: responseFormats.teams
  },
  {
    id: "teamFixtures",
    name: "TEAM FIXTURES",
    method: "GET",
    path: "/v1/football/teams/{teamName}/fixtures",
    description: "Full match history for a specific club.",
    params: [
      { name: "teamName", type: "string", required: true, desc: "Full team name (path)" },
      { name: "league", type: "string", required: true, desc: "League ID (query)" },
      { name: "season", type: "string", required: false, desc: "Season (e.g. 2024-2025). Defaults to current." }
    ],
    response: responseFormats.teamFixtures
  },
  {
    id: "leagueSeasons",
    name: "LEAGUE SEASONS",
    method: "GET",
    path: "/v1/football/leagues/{leagueId}/seasons",
    description: "List all available seasons for a league.",
    params: [{ name: "leagueId", type: "string", required: true, desc: "League ID" }],
    response: responseFormats.leagueSeasons
  },
  {
    id: "leagueStats",
    name: "LEAGUE STATS",
    method: "GET",
    path: "/v1/football/leagues/{leagueId}/stats",
    description: "Aggregate season statistics and performance averages.",
    params: [
      { name: "leagueId", type: "string", required: true, desc: "League ID" },
      { name: "season", type: "string", required: false, desc: "Season (e.g. 2024-2025). Defaults to current." }
    ],
    response: responseFormats.leagueStats
  }
];

const codeExamples = {
  leagues: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/leagues"`,
    js: `fetch('https://api.statsez.com/v1/football/leagues', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.leagues));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/leagues', headers={'x-api-key': 'YOUR_KEY'})\nleagues = response.json()['data']['leagues']`
  },
  fixtures: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/fixtures?league=england-premier-league-2025-2026"`,
    js: `fetch('https://api.statsez.com/v1/football/fixtures?league=england-premier-league-2025-2026', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.fixtures));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/fixtures', headers={'x-api-key': 'YOUR_KEY'}, params={'league': 'england-premier-league-2025-2026'})\nfixtures = response.json()['data']['fixtures']`
  },
  standings: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/standings?league=england-premier-league-2025-2026"`,
    js: `fetch('https://api.statsez.com/v1/football/standings?league=england-premier-league-2025-2026', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.standings));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/standings', headers={'x-api-key': 'YOUR_KEY'}, params={'league': 'england-premier-league-2025-2026'})\nstandings = response.json()['data']['standings']`
  },
  stats: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/fixtures/lbnqyVFq/stats"`,
    js: `fetch('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/stats', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.periods));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/stats', headers={'x-api-key': 'YOUR_KEY'})\nstats = response.json()['data']['periods']`
  },
  lineups: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/fixtures/lbnqyVFq/lineups"`,
    js: `fetch('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/lineups', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.home.players));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/lineups', headers={'x-api-key': 'YOUR_KEY'})\nlineups = response.json()['data']`
  },
  events: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/fixtures/lbnqyVFq/events"`,
    js: `fetch('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/events', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.events));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/fixtures/lbnqyVFq/events', headers={'x-api-key': 'YOUR_KEY'})\nevents = response.json()['data']['events']`
  },
  teams: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/teams?league=england-premier-league-2025-2026"`,
    js: `fetch('https://api.statsez.com/v1/football/teams?league=england-premier-league-2025-2026', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.teams));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/teams', headers={'x-api-key': 'YOUR_KEY'}, params={'league': 'england-premier-league-2025-2026'})\nteams = response.json()['data']['teams']`
  },
  teamFixtures: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/teams/Liverpool/fixtures?league=Yq4hUnzQ"`,
    js: `fetch('https://api.statsez.com/v1/football/teams/Liverpool/fixtures?league=Yq4hUnzQ', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.fixtures));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/teams/Liverpool/fixtures', headers={'x-api-key': 'YOUR_KEY'}, params={'league': 'Yq4hUnzQ'})\nfixtures = response.json()['data']['fixtures']`
  },
  leagueSeasons: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/seasons"`,
    js: `fetch('https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/seasons', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.seasons));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/seasons', headers={'x-api-key': 'YOUR_KEY'})\nseasons = response.json()['data']['seasons']`
  },
  leagueStats: {
    curl: `curl -H "x-api-key: YOUR_KEY" \\
  "https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/stats"`,
    js: `fetch('https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/stats', {
  headers: { 'x-api-key': 'YOUR_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.data.stats));`,
    py: `import requests\n\nresponse = requests.get('https://api.statsez.com/v1/football/leagues/Yq4hUnzQ/stats', headers={'x-api-key': 'YOUR_KEY'})\nstats = response.json()['data']['stats']`
  }
};

export default function DocsPage() {
  const t = useTranslations("docs");
  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0]);
  const [activeLang, setActiveLang] = useState<"curl" | "js" | "py">("curl");

  const currentExample = codeExamples[activeEndpoint.id as keyof typeof codeExamples];

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] w-full grid-system">
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[20%] top-0 bottom-0 w-px bg-border" />
          <div className="absolute left-[40%] top-0 bottom-0 w-px bg-border" />
          <div className="absolute left-[60%] top-0 bottom-0 w-px bg-border" />
          <div className="absolute left-[80%] top-0 bottom-0 w-px bg-border" />
        </div>

        <div className="relative z-10 min-h-[60vh] flex flex-col justify-between section-padding py-12">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="data-label text-foreground/50">API REFERENCE</span>
              <span className="data-value text-muted-foreground">v1.0</span>
            </div>
            <div className="flex gap-12 text-right">
              <div className="flex flex-col gap-1">
                <span className="data-label text-foreground/50">ENDPOINTS</span>
                <span className="data-value">11</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="data-label text-foreground/50">FORMAT</span>
                <span className="data-value">JSON</span>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="flex-1 flex items-center py-16">
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="display-text text-foreground">
                  <ScrambleText text="API" delay={0.3} />
                  <br />
                  <span className="text-muted text-foreground/30">DOCS</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 max-w-xl"
              >
                <p className="subhead-text text-muted-foreground leading-relaxed">
                  {t("description")}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-4 gap-8 border-t border-border pt-8"
          >
            <div className="flex flex-col gap-2">
              <span className="data-label text-foreground/50">BASE URL</span>
              <span className="font-mono text-sm">api.statsez.com/v1</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="data-label text-foreground/50">AUTH</span>
              <span className="font-mono text-sm">x-api-key header</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="data-label text-foreground/50">RATE LIMIT</span>
              <span className="font-mono text-sm">100 req/min</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="data-label text-foreground/50">RESPONSE</span>
              <span className="font-mono text-sm">JSON</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full border-t border-border bg-background">
        <div className="grid grid-cols-12 gap-px bg-border">
          
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 bg-background">
            <div className="p-6 border-b border-border">
              <span className="data-label text-foreground/50 uppercase tracking-widest">ENDPOINTS</span>
            </div>
            <div className="divide-y divide-border">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setActiveEndpoint(ep)}
                  className={`w-full text-left p-6 transition-all duration-300 group ${
                    activeEndpoint.id === ep.id 
                      ? "bg-foreground text-background" 
                      : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-mono border px-1.5 py-0.5 uppercase ${
                      activeEndpoint.id === ep.id 
                        ? "border-background/30 text-background" 
                        : "border-border text-muted-foreground"
                    }`}>
                      {ep.method}
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-medium tracking-tight uppercase">
                    {ep.name}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    activeEndpoint.id === ep.id ? "text-background/60" : "text-muted-foreground"
                  }`}>
                    {ep.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="col-span-12 lg:col-span-9 bg-background min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEndpoint.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="p-12 border-b border-border">
                  <div className="flex items-center gap-6 mb-6">
                    <span className="px-4 py-1 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-widest">
                      {activeEndpoint.method}
                    </span>
                    <code className="text-2xl font-mono text-foreground tracking-tighter">
                      {activeEndpoint.path}
                    </code>
                  </div>
                  <p className="text-xl text-muted-foreground max-w-2xl font-sans leading-relaxed">
                    {activeEndpoint.description}
                  </p>
                </div>

                {/* Parameters */}
                {activeEndpoint.params.length > 0 && (
                  <div className="border-b border-border">
                    <div className="p-6 border-b border-border bg-foreground/[0.02]">
                      <span className="data-label text-foreground/50">PARAMETERS</span>
                    </div>
                    <div className="divide-y divide-border">
                      {activeEndpoint.params.map((param) => (
                        <div key={param.name} className="p-8 grid grid-cols-12 gap-8 items-center">
                          <div className="col-span-3">
                            <code className="font-mono text-base font-bold text-foreground">{param.name}</code>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{param.type}</span>
                          </div>
                          <div className="col-span-2">
                            {param.required ? (
                              <span className="text-[10px] font-mono font-bold uppercase text-red-500 tracking-widest">Required</span>
                            ) : (
                              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Optional</span>
                            )}
                          </div>
                          <div className="col-span-5">
                            <span className="text-sm text-muted-foreground font-sans">{param.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Examples */}
                <div className="border-b border-border">
                  <div className="p-6 border-b border-border bg-foreground/[0.02] flex items-center justify-between">
                    <span className="data-label text-foreground/50">REQUEST IMPLEMENTATION</span>
                    <div className="flex gap-2">
                      {["curl", "js", "py"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang as "curl" | "js" | "py")}
                          className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                            activeLang === lang
                              ? "bg-foreground text-background"
                              : "border border-border text-muted-foreground hover:bg-foreground/5"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-12 bg-background overflow-x-auto">
                    <pre className="font-mono text-sm text-foreground leading-relaxed">
                      <code>{currentExample[activeLang as keyof typeof currentExample]}</code>
                    </pre>
                  </div>
                </div>

                {/* Full Response */}
                <div>
                  <div className="p-6 border-b border-border bg-foreground/[0.02] flex items-center justify-between">
                    <span className="data-label text-foreground/50">FULL RAW RESPONSE</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">200 OK / application/json</span>
                  </div>
                  <div className="p-12 bg-background overflow-x-auto max-h-[800px] custom-scrollbar">
                    <pre className="font-mono text-xs text-foreground leading-relaxed">
                      <code>{JSON.stringify(activeEndpoint.response, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
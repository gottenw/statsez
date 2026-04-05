curl --request GET \
	--url https://flashscore4.p.rapidapi.com/api/flashscore/v2/general/sports \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/general/countries?sport_id=1' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/general/tournaments?country_id=176&sport_id=1' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/list?sport_id=1&day=0&timezone=Europe%2FBerlin' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/list-by-date?sport_id=1&date=2026-01-27&timezone=Europe%2FBerlin' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/details?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/match/summary?match_id=AHz58q34' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/match/stats?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/match/lineups?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/match/player-stats?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/match/commentary?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/odds?match_id=GCxZ2uHc&geo_ip_code=US' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/h2h?match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/standings?type=overall&match_id=GCxZ2uHc' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/standings/form?match_id=GCxZ2uHc&type=overall' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/teams/details?team_url=%2Fteam%2Freal-madrid%2FW8mj7MDD%2F' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/teams/results?team_id=W8mj7MDD&page=1' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/teams/fixtures?team_id=W8mj7MDD&page=1' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/teams/squad?team_url=%2Fteam%2Freal-madrid%2FW8mj7MDD%2F' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/teams/transfers?team_id=W8mj7MDD' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/tournaments/ids?tournament_url=%2Ftennis%2Fatp-singles%2Fwimbledon%2F' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/tournaments/details?tournament_stage_id=dINOZk9Q' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/tournaments/details?tournament_stage_id=dINOZk9Q' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/tournaments/fixtures?tournament_template_id=QVmLl54o&season_id=187&page=1' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'

    curl --request GET \
	--url 'https://flashscore4.p.rapidapi.com/api/flashscore/v2/tournaments/standings?tournament_stage_id=dINOZk9Q&tournament_id=A1MYWy8T&type=overall' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: flashscore4.p.rapidapi.com' \
	--header 'x-rapidapi-key: 66eca0d9b8msh24619f26a815e84p10390bjsnfcf47b1e6358'
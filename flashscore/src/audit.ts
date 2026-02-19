import { getCountries, getCompetitions } from './api.js';

async function audit() {
  console.log('--- AUDITORIA SPORTDB ---');
  try {
    const countries = await getCountries();
    console.log(`Paises encontrados: ${countries.length}`);
    
    let totalLeagues = 0;
    const sampleCountries = countries.slice(0, 8); 
    
    for (const country of sampleCountries) {
      const countryKey = `${country.slug}:${country.id}`;
      const comps = await getCompetitions(countryKey);
      totalLeagues += comps.length;
      console.log(`  - ${country.name}: ${comps.length} ligas`);
    }
    
    const avgLeaguesPerCountry = totalLeagues / sampleCountries.length;
    const estimatedTotalLeagues = Math.round(countries.length * avgLeaguesPerCountry);
    
    const estimatedMatches = estimatedTotalLeagues * 300 * 5;

    console.log('\n--- RESULTADOS REAIS ---');
    console.log(`Total de Paises: ${countries.length}`);
    console.log(`Total Estimado de Ligas: ${estimatedTotalLeagues}`);
    console.log(`Total Estimado de Partidas: ${(estimatedMatches / 1000000).toFixed(1)}M+`);
  } catch (e) {
    console.error('Erro na auditoria:', e.message);
  }
}

audit();
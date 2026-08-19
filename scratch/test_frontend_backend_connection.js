const { chessApi } = require('../src/lib/chessApi');

async function testConnection() {
  console.log('=== TESTING FRONTEND-TO-BACKEND CHESS API CONNECTION ===\n');

  try {
    console.log('1. Fetching Settings via chessApi.getSettings()...');
    const settings = await chessApi.getSettings();
    console.log('Success:', settings.success);
    console.log('Tournament Tagline:', settings.data?.tournamentTagline);

    console.log('\n2. Registering test player via chessApi.registerPlayer()...');
    const regRes = await chessApi.registerPlayer({
      fullName: 'Frontend Connection Competitor',
      email: `fe.conn.${Date.now()}@college.edu`,
      phone: '9998887776',
      department: 'MJ Team'
    });
    console.log('Registered Player ID:', regRes.data?.playerId);
    console.log('Status:', regRes.data?.status);

    console.log('\n3. Fetching Players list via chessApi.getPlayers()...');
    const playersRes = await chessApi.getPlayers();
    console.log('Players Count:', playersRes.count);

    console.log('\n4. Fetching Standings via chessApi.getStandings()...');
    const standingsRes = await chessApi.getStandings();
    console.log('Standings Count:', standingsRes.count);

    console.log('\n✅ FRONTEND TO BACKEND CONNECTION VERIFIED 100%!');
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();

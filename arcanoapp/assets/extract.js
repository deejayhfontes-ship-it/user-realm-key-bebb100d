const fs = require('fs');
try {
    const content = fs.readFileSync('index-DkAxdhuK.js', 'utf8');

    // Find all Supabase URLs (starts with https:// and ends with supabase.co)
    const urls = content.match(/https:\/\/[A-Za-z0-9-]+\.supabase\.co/g);

    // Find all JWTs (starts with eyJh)
    const jwts = content.match(/eyJh[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g);

    console.log('URLs found:', [...new Set(urls)]);
    console.log('JWTs found:', [...new Set(jwts)]);
} catch (e) {
    console.error(e);
}

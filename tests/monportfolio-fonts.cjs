// Fixture only. Avoid fetching Google Fonts during the isolated Next browser run.
module.exports = new Proxy({}, { get(_, url) {
  const family = new URL(url).searchParams.get('family')?.split(':')[0];
  return `@font-face{font-family:'${family}';font-weight:100 900;font-style:normal;src:local('Arial');}`;
}});

// Dynamically import all JSON files from the hymns folder
const hymnContext = require.context('../hymns', false, /\.json$/);

// Map the imported modules to an array
export const allHymns = hymnContext.keys().map(hymnContext);

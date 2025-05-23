const audioContext = require.context('../tracks', false, /\.mp3$/);

export const audioTracks = {};

audioContext.keys().forEach((key) => {
  const trackNumber = parseInt(key.replace(/^\.\/(\d+)\.mp3$/, '$1'), 10);
  
  audioTracks[trackNumber] = audioContext(key);
});

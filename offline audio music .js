
    // Attach functionality to all audio players
    document.querySelectorAll('.each-audio-page').forEach(function(page) {
      const audio = page.querySelector('audio');
      const rewindBtn = page.querySelector('.rewind');
      const forwardBtn = page.querySelector('.forward');
      const volumeSlider = page.querySelector('.volume-slider');

      // Rewind 10s
      rewindBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
      });

      // Forward 10s
      forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
      });

      // Volume control
      volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
      });

      // Set default volume
      audio.volume = 0.7;
      volumeSlider.value = 0.7;
    });
 
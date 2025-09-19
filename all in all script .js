document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('musicSearchInput');
      const searchButton = document.getElementById('searchMusicButton');
      const platformButtons = document.querySelectorAll('.platform-btn');
      
      let selectedPlatforms = ['youtube'];
      
      // Platform selection
      platformButtons.forEach(button => {
        button.addEventListener('click', function() {
          const platform = this.getAttribute('data-platform');
          
          if (this.classList.contains('active')) {
            this.classList.remove('active');
            selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
          } else {
            this.classList.add('active');
            selectedPlatforms.push(platform);
          }
        });
      });
      
      // Function to perform search
      function performMusicSearch() {
        const query = searchInput.value.trim();
        
        if (query === '') {
          alert('Please enter a search term');
          return;
        }
        
        if (selectedPlatforms.length === 0) {
          alert('Please select at least one platform');
          return;
        }
        
        // Search on each selected platform
        selectedPlatforms.forEach(platform => {
          let searchUrl;
          
          switch(platform) {
            case 'youtube':
              searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' music')}`;
              break;
            case 'facebook':
              searchUrl = `https://www.facebook.com/search/top?q=${encodeURIComponent(query + ' music')}`;
              break;
            case 'google':
              searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' music')}`;
              break;
            case 'tiktok':
              searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query + ' music')}`;
              break;
          }
          
          // Open search results in a new tab
          window.open(searchUrl, '_blank');
        });
      }
      
      // Add event listeners
      searchButton.addEventListener('click', performMusicSearch);
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performMusicSearch();
        }
      });
    });
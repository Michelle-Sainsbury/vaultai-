const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', event => {
  processUpload(event.target.files);
});

dropZone.addEventListener('dragover', event => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', event => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  processUpload(event.dataTransfer.files);
});

searchInput.addEventListener('input', runSearch);
categoryFilter.addEventListener('change', runSearch);

function processUpload(files) {
  const vault = JSON.parse(localStorage.getItem('vault') || '[]');
  
  [...files].forEach(file => {
    const entry = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      dateUploaded: new Date().toISOString(),
      category: detectCategory(file.type),
      tags: generateTags(file.name)
    };
    
    vault.push(entry);
  });
  
  localStorage.setItem('vault', JSON.stringify(vault));
  fileInput.value = '';
  runSearch();
}

function detectCategory(fileType) {
  if (fileType.includes('image')) return 'Images';
  if (fileType.includes('pdf')) return 'Documents';
  if (fileType.includes('video')) return 'Videos';
  if (fileType.includes('audio')) return 'Audio';
  if (fileType.includes('text')) return 'Documents';
  
  return 'Other';
}

function generateTags(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .split(/[-_\s]/)
    .filter(Boolean);
}

function searchVault(query, category) {
  const vault = JSON.parse(localStorage.getItem('vault') || '[]');
  
  return vault.filter(file => {
    const matchesName = file.name
      .toLowerCase()
      .includes(query.toLowerCase());
    
    const matchesCategory =
      category === 'All' || file.category === category;
    
    return matchesName && matchesCategory;
  });
}

function runSearch() {
  const query = searchInput.value;
  const category = categoryFilter.value;
  const results = searchVault(query, category);
  
  renderResults(results);
}

function renderResults(files) {
  const container = document.getElementById('results');
  
  if (!files.length) {
    container.innerHTML = '<p>No files found.</p>';
    return;
  }
  
  container.innerHTML = files.map(file => `
    <div class="file-card">
      <strong>${file.name}</strong>
      <span>${file.category}</span>
      <span>${formatFileSize(file.size)}</span>
      <span>${new Date(file.dateUploaded).toLocaleDateString()}</span>
      <small>${file.tags.join(', ')}</small>
    </div>
  `).join('');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

runSearch();

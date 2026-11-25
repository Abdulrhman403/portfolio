/**
 * main.js — Main application logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
});

async function loadProjects() {
  try {
    const res = await fetch('data/projects.json');
    const projects = await res.json();
    renderProjects(projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <article class="project-card">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="project-tags">
        ${p.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <a href="${p.url}" target="_blank" rel="noopener">View Project</a>
    </article>
  `).join('');
}

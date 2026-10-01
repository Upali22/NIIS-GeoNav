/**
 * NIIS GeoNav persistent campus backup.
 * Render's local filesystem can reset, so the browser keeps the latest
 * successful campus CMS snapshot and restores it on refresh.
 */
const STORAGE_KEY = 'niis_campus_persistent_v1';
const API_PREFIX = '/api/campus/';

export function installCampusPersistence() {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__niisPersistenceInstalled) return;
  w.__niisPersistenceInstalled = true;

  const originalFetch = window.fetch.bind(window);
  w.__niisOriginalFetch = originalFetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
    const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET')).toUpperCase();

    // For the main campus snapshot, prefer the browser backup when available.
    if (url === '/api/campus/data' && method === 'GET') {
      const response = await originalFetch(input, init);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const serverData = await response.clone().json();
          const localData = JSON.parse(saved);
          // Local snapshot is authoritative for CMS-managed campus content.
          return new Response(JSON.stringify({ ...serverData, ...localData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (_) {}
      return response;
    }

    const response = await originalFetch(input, init);

    // After any successful campus CMS mutation, immediately snapshot the full state.
    if (url.startsWith(API_PREFIX) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && response.ok) {
      try {
        const snapshotResponse = await originalFetch('/api/campus/data', { method: 'GET' });
        if (snapshotResponse.ok) {
          const snapshot = await snapshotResponse.json();
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            buildings: snapshot.buildings,
            navNodes: snapshot.navNodes,
            navEdges: snapshot.navEdges,
            faculty: snapshot.faculty,
            events: snapshot.events,
            gallery: snapshot.gallery,
            coreMembers: snapshot.coreMembers,
            announcements: snapshot.announcements,
            settings: snapshot.settings,
            teachers: snapshot.teachers,
            obstacles: snapshot.obstacles
          }));
        }
      } catch (e) {
        console.warn('NIIS local campus backup failed:', e);
      }
    }

    return response;
  };
}

export function clearCampusPersistence() {
  localStorage.removeItem(STORAGE_KEY);
}

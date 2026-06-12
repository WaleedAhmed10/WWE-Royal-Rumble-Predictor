import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getWrestlers, addWrestler, updateWrestler, deleteWrestler,
  resetWrestlers, importWrestlers, exportWrestlers
} from '../api';

export default function Wrestlers() {
  const [wrestlers, setWrestlers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', winProbability: 5, eliminationResistance: 1.0, brand: 'Raw' });

  useEffect(() => { loadWrestlers(); }, []);

  async function loadWrestlers() {
    try {
      const data = await getWrestlers();
      setWrestlers(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', winProbability: 5, eliminationResistance: 1.0, brand: 'Raw' });
    setShowForm(true);
  }

  function openEdit(w) {
    setEditing(w);
    setForm({ name: w.name, winProbability: w.winProbability, eliminationResistance: w.eliminationResistance, brand: w.brand });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await updateWrestler(editing._id, form);
      else await addWrestler(form);
      setShowForm(false);
      loadWrestlers();
      alert(editing ? 'Wrestler updated!' : `${form.name} added to database!`);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this wrestler?')) return;
    await deleteWrestler(id);
    loadWrestlers();
    alert('Wrestler deleted!');
  }

  async function handleReset() {
    if (!confirm('Reset to default roster? This will replace all your wrestlers.')) return;
    await resetWrestlers();
    loadWrestlers();
    alert('Reset to default roster!');
  }

  async function clearAll() {
    if (!confirm('Delete ALL wrestlers? This cannot be undone.')) return;
    await importWrestlers([]);
    loadWrestlers();
    alert('All wrestlers deleted!');
  }

  async function handleExport() {
    if (wrestlers.length === 0) return alert('No wrestlers to export!');
    const data = await exportWrestlers();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wrestlers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert('Database exported!');
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const imported = JSON.parse(text);
        if (!Array.isArray(imported)) return alert('Invalid file format');
        if (!confirm(`Import ${imported.length} wrestlers? This will replace your current database.`)) return;
        await importWrestlers(imported.map(({ name, winProbability, eliminationResistance, brand }) =>
          ({ name, winProbability, eliminationResistance, brand })
        ));
        loadWrestlers();
        alert('Import successful!');
      } catch {
        alert('Error parsing JSON file');
      }
    };
    input.click();
  }

  const filtered = wrestlers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.brand && w.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <h1 className="page-title">WWE Royal Rumble Wrestler Database</h1>
      {error && <div className="error-msg">{error}</div>}

      <div className="database-operations">
        <button className="btn" onClick={openAdd}>➕ Add Wrestler</button>
        <button className="btn" onClick={handleExport}>📤 Export Database</button>
        <button className="btn" onClick={handleImport}>📥 Import Database</button>
        <button className="btn" onClick={handleReset}>🔄 Reset to Default</button>
        <button className="btn" onClick={clearAll}>🗑️ Clear All</button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search wrestlers by name or brand..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <p className="wrestler-count">Total Wrestlers: {wrestlers.length}</p>

      {showForm && (
        <div className="card form-card">
          <h3>{editing ? '✏️ Edit Wrestler' : '➕ Add Wrestler'}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="number" step="0.1" placeholder="Win probability (1-100%)" value={form.winProbability} onChange={e => setForm({ ...form, winProbability: +e.target.value })} />
            <input type="number" step="0.1" placeholder="Elimination resistance (0.5-2.0)" value={form.eliminationResistance} onChange={e => setForm({ ...form, eliminationResistance: +e.target.value })} />
            <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
              <option>Raw</option><option>SmackDown</option><option>NXT</option><option>Legend</option><option>Unknown</option>
            </select>
            <button className="btn" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '8px' }}>Cancel</button>
          </form>
        </div>
      )}

      <div className="wrestler-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            {wrestlers.length === 0
              ? '🤼 No wrestlers yet. Click "Add Wrestler" to start building your database!'
              : 'No wrestlers found'}
          </div>
        ) : (
          filtered.map(w => (
            <div key={w._id} className="wrestler-card">
              <h3>{w.name}</h3>
              <div className="wrestler-stats">
                <p>🏆 Win Probability: {w.winProbability}%</p>
                <p>🛡️ Elimination Resistance: {w.eliminationResistance}</p>
                <p>🎪 Brand: {w.brand || 'Unknown'}</p>
              </div>
              <div className="wrestler-actions">
                <button className="btn" onClick={() => openEdit(w)}>✏️ Edit</button>
                <button className="btn btn-secondary" onClick={() => handleDelete(w._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '40px' }}>
        <Link to="/builder" className="btn">🎪 Go to Rumble Builder →</Link>
      </div>
    </>
  );
}

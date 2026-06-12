import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getWrestlers, getSetup, saveSetup } from '../api';

export default function Builder() {
  const navigate = useNavigate();
  const [allWrestlers, setAllWrestlers] = useState([]);
  const [slots, setSlots] = useState(Array(30).fill(null));
  const [search, setSearch] = useState('');
  const [activeSlot, setActiveSlot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const wrestlers = await getWrestlers();
      setAllWrestlers(wrestlers);
      const setup = await getSetup();
      if (setup?.wrestlers?.length === 30) setSlots(setup.wrestlers);
    } catch (err) {
      setError(err.message);
    }
  }

  function assignToSlot(slotIndex, wrestler) {
    const newSlots = [...slots];
    newSlots[slotIndex] = {
      wrestlerId: wrestler._id,
      name: wrestler.name,
      winProbability: wrestler.winProbability,
      eliminationResistance: wrestler.eliminationResistance,
      brand: wrestler.brand,
      entryNumber: slotIndex + 1
    };
    setSlots(newSlots);
    setActiveSlot(null);
  }

  function randomize() {
    if (allWrestlers.length < 30) {
      alert(`Need at least 30 wrestlers. You have ${allWrestlers.length}. Add more wrestlers first!`);
      return;
    }
    const shuffled = [...allWrestlers].sort(() => Math.random() - 0.5).slice(0, 30);
    setSlots(shuffled.map((w, i) => ({
      wrestlerId: w._id,
      name: w.name,
      winProbability: w.winProbability,
      eliminationResistance: w.eliminationResistance,
      brand: w.brand,
      entryNumber: i + 1
    })));
    alert('Random entries assigned!');
  }

  function clearAll() {
    if (confirm('Clear all slot assignments?')) setSlots(Array(30).fill(null));
  }

  async function handleSave() {
    const filled = slots.filter(s => s !== null);
    if (filled.length !== 30) {
      alert(`Need ${30 - filled.length} more wrestlers!`);
      return;
    }
    try {
      await saveSetup(filled);
      alert('Rumble setup saved! Click Simulate to run the match.');
    } catch (err) {
      alert(err.message);
    }
  }

  const filledCount = slots.filter(s => s !== null).length;
  const filtered = allWrestlers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.brand && w.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <h1 className="page-title">Royal Rumble Builder</h1>
      <p style={{ textAlign: 'center' }}>Select 30 wrestlers and assign entry numbers 1-30</p>
      {error && <div className="error-msg">{error}</div>}

      <div className="builder-container">
        <div className="database-panel">
          <h3>Your Wrestlers</h3>
          <input
            className="search-box"
            placeholder="🔍 Search wrestlers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {allWrestlers.length === 0 ? (
            <p>No wrestlers found. Go to Wrestlers page first!</p>
          ) : (
            filtered.map(w => (
              <div
                key={w._id}
                className={`wrestler-item ${activeSlot === null ? 'disabled' : ''}`}
                onClick={() => {
                  if (activeSlot !== null) assignToSlot(activeSlot, w);
                  else alert('Click on a slot first, then click a wrestler to assign!');
                }}
              >
                <strong>{w.name}</strong>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Win: {w.winProbability}% | {w.brand || ''}</div>
              </div>
            ))
          )}
        </div>

        <div className="rumble-panel">
          <h3>Royal Rumble Slots (30 Required)</h3>
          <div className="ringslots">
            {slots.map((slot, i) => (
              <div
                key={i}
                className={`slot ${slot ? 'filled' : ''} ${activeSlot === i ? 'active' : ''}`}
                onClick={() => setActiveSlot(i)}
              >
                <div className="slot-number">Entry #{i + 1}</div>
                <div className="slot-content">{slot ? slot.name : ''}</div>
                <div className="slot-status" style={{ color: slot ? '#4CAF50' : '#888' }}>
                  {slot ? 'Filled' : 'Empty'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="builder-controls">
        <button className="btn" onClick={randomize}>🎲 Randomize Entries</button>
        <button className="btn" onClick={clearAll}>🗑️ Clear All</button>
        <button className="btn" onClick={handleSave}>💾 Save Setup</button>
        {filledCount === 30 ? (
          <Link to="/simulate" className="btn">▶️ Simulate Rumble</Link>
        ) : (
          <span className="btn" style={{ opacity: 0.5 }}>▶️ Simulate Rumble</span>
        )}
      </div>

      {activeSlot !== null && (
        <p className="slot-hint">Click on a wrestler to assign to Entry #{activeSlot + 1}</p>
      )}

      {filledCount > 0 && (
        <div className="slot-counter">{filledCount}/30 Selected</div>
      )}
    </>
  );
}

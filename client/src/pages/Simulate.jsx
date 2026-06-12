import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSetup, saveSimulation } from '../api';

export default function Simulate() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [minute, setMinute] = useState(0);
  const [active, setActive] = useState([]);
  const [eliminated, setEliminated] = useState([]);
  const [timeline, setTimeline] = useState([{ minute: 0, text: 'Royal Rumble begins!' }]);
  const [winner, setWinner] = useState(null);
  const [complete, setComplete] = useState(false);

  const entryQueue = useRef([]);
  const intervalRef = useRef(null);
  const matchRef = useRef({ active: [], eliminated: [], minute: 0, timeline: [] });

  useEffect(() => {
    getSetup()
      .then(data => {
        if (!data || data.wrestlers?.length !== 30) {
          setError('No rumble setup found! Please build a Royal Rumble first.');
        } else {
          setSetup(data);
          entryQueue.current = [...data.wrestlers].sort((a, b) => a.entryNumber - b.entryNumber);
        }
      })
      .catch(err => setError(err.message));
    return () => clearInterval(intervalRef.current);
  }, []);

  function addEvent(text, currentMinute) {
    setTimeline(prev => [...prev, { minute: currentMinute, text }]);
    matchRef.current.timeline.push({ minute: currentMinute, text });
  }

  function simulateStep() {
    const m = matchRef.current;
    m.minute += 1;
    setMinute(m.minute);

    const entryIndex = Math.floor(m.minute / 1.5);
    while (entryQueue.current.length > 0 && entryQueue.current[0].entryNumber === entryIndex) {
      const w = entryQueue.current.shift();
      m.active.push({ ...w, stamina: 100, momentum: 0, eliminations: 0 });
      addEvent(`${w.name} enters at #${w.entryNumber}!`, m.minute);
    }

    const toRemove = [];
    m.active.forEach(w => {
      w.stamina -= 1 + m.active.length / 10;
      w.momentum *= 0.95;
      let elimChance = 0.05;
      elimChance *= (1 + (100 - w.stamina) / 200);
      elimChance /= w.eliminationResistance || 1;
      elimChance /= 1 + w.momentum;
      if (Math.random() < elimChance) toRemove.push(w);
    });

    toRemove.forEach(w => {
      const idx = m.active.indexOf(w);
      if (idx !== -1) m.active.splice(idx, 1);
      m.eliminated.push(w);
      if (m.active.length > 0) {
        const eliminator = m.active[Math.floor(Math.random() * m.active.length)];
        eliminator.eliminations++;
        eliminator.momentum += 0.25;
        addEvent(`❌ ${w.name} eliminated by ${eliminator.name}!`, m.minute);
      } else {
        addEvent(`❌ ${w.name} eliminated!`, m.minute);
      }
    });

    setActive([...m.active]);
    setEliminated([...m.eliminated]);

    const done = m.eliminated.length >= 29 || (entryQueue.current.length === 0 && m.active.length === 1);
    if (done && m.active.length >= 1) endMatch(m);
  }

  async function endMatch(m) {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    const win = m.active[0];
    setWinner(win);
    setComplete(true);
    addEvent(`🏆 WINNER: ${win.name}! 🏆`, m.minute);

    const all = [...m.active, ...m.eliminated];
    const mostElim = all.reduce((a, b) => (a.eliminations || 0) > (b.eliminations || 0) ? a : b, { name: 'Unknown', eliminations: 0 });

    try {
      await saveSimulation({
        winner: win.name,
        matchDuration: m.minute,
        mostEliminations: mostElim.eliminations || 0,
        mostEliminationsName: mostElim.name,
        ironMan: win.name,
        totalEliminations: m.eliminated.length,
        timeline: m.timeline
      });
    } catch (err) {
      console.error('Could not save to server:', err.message);
    }
  }

  function start() {
    if (!setup || isRunning) return;
    setIsRunning(true);
    runLoop();
  }

  function togglePause() {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      runLoop();
    }
  }

  function runLoop() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(simulateStep, 1000 / speed);
  }

  function toggleSpeed() {
    const newSpeed = speed === 1 ? 3 : 1;
    setSpeed(newSpeed);
    if (isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(simulateStep, 1000 / newSpeed);
    }
  }

  function formatTime(m) {
    const mins = Math.floor(m);
    const secs = Math.floor((m % 1) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (error) {
    return (
      <div className="error-msg">
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/builder')}>Go to Builder</button>
      </div>
    );
  }

  if (!setup) return <p style={{ textAlign: 'center' }}>Loading setup...</p>;

  return (
    <>
      <h1 className="page-title">Royal Rumble Simulation</h1>

      <div className="controls">
        <button className="btn" onClick={start} disabled={isRunning || complete}>▶️ Start Simulation</button>
        <button className="btn" onClick={togglePause} disabled={!minute && !isRunning}>
          {isRunning ? '⏸️ Pause' : '▶️ Resume'}
        </button>
        <button className="btn" onClick={toggleSpeed}>⚡ Speed: {speed}x</button>
        <button className="btn" disabled={!complete} onClick={() => navigate('/results')}>📊 View Results</button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>⏱️ Match Time</h3>
          <p>{formatTime(minute)}</p>
        </div>
        <div className="stat-card">
          <h3>👥 In Ring</h3>
          <p>{active.length}</p>
        </div>
        <div className="stat-card">
          <h3>❌ Eliminated</h3>
          <p>{eliminated.length}/29</p>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(eliminated.length / 29) * 100}%` }} />
      </div>

      {winner && (
        <div className="winner-display">
          <h2>🏆 ROYAL RUMBLE WINNER 🏆</h2>
          <div className="winner-name">{winner.name}</div>
          <button className="btn" onClick={() => navigate('/results')}>📊 View Detailed Results</button>
        </div>
      )}

      <div className="timeline">
        <h3>Elimination Timeline</h3>
        {timeline.map((e, i) => (
          <div key={i} className="timeline-event">
            <span className="event-time">{formatTime(e.minute)}</span>
            <span>{e.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

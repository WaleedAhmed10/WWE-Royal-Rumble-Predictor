function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (character === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[i + 1] === '\n') i += 1;
      row.push(value);
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(value);
  if (row.some(cell => cell.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('CSV must include a header row and at least one wrestler.');

  const headers = rows[0].map(header => header.trim().replace(/^\uFEFF/, '').toLowerCase().replace(/[\s_-]/g, ''));
  return rows.slice(1).map(cells =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] || '').trim()]))
  );
}

function parseXml(text) {
  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (document.querySelector('parsererror')) {
    throw new Error('Invalid XML file. Check that the XML is well-formed.');
  }

  const wrestlerNodes = [...document.getElementsByTagName('*')]
    .filter(node => node.localName.toLowerCase() === 'wrestler');
  if (document.documentElement?.tagName.toLowerCase() === 'wrestler') {
    wrestlerNodes.unshift(document.documentElement);
  }
  if (wrestlerNodes.length === 0) {
    throw new Error('XML must contain <wrestler> elements inside a <wrestlers> root.');
  }

  return wrestlerNodes.map(node => {
    const values = Object.fromEntries(
      [...node.children].map(child => [
        child.tagName.toLowerCase().replace(/[\s_-]/g, ''),
        child.textContent.trim()
      ])
    );
    for (const attribute of [...node.attributes]) {
      values[attribute.name.toLowerCase().replace(/[\s_-]/g, '')] = attribute.value;
    }
    return values;
  });
}

function field(raw, ...aliases) {
  const normalized = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key.toLowerCase().replace(/[\s_-]/g, ''), value])
  );
  for (const alias of aliases) {
    const key = alias.toLowerCase().replace(/[\s_-]/g, '');
    if (normalized[key] !== undefined && normalized[key] !== '') return normalized[key];
  }
  return undefined;
}

function normalizeWrestler(raw) {
  const name = String(field(raw, 'name', 'wrestler') || '').trim();
  const winProbability = parseFloat(field(raw, 'winProbability', 'win_prob', 'win') ?? 5);
  const eliminationResistance = parseFloat(
    field(raw, 'eliminationResistance', 'resistance') ?? 1.0
  );

  return {
    name,
    winProbability: Number.isFinite(winProbability) ? winProbability : 5,
    eliminationResistance: Number.isFinite(eliminationResistance) ? eliminationResistance : 1.0,
    brand: String(field(raw, 'brand') || 'Unknown').trim() || 'Unknown'
  };
}

export function parseWrestlerFile(text, fileName = '') {
  if (!text || !text.trim()) throw new Error('File is empty.');

  const cleaned = text.replace(/^\uFEFF/, '').trim();
  const extension = fileName.split('.').pop()?.toLowerCase();
  let list;

  if (extension === 'csv' || (!extension && !cleaned.startsWith('<') && !/^[\[{]/.test(cleaned))) {
    list = parseCsv(cleaned);
  } else if (extension === 'xml' || cleaned.startsWith('<')) {
    list = parseXml(cleaned);
  } else {
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      throw new Error('Unsupported file format. Choose a .csv, .xml, or .json file.');
    }
    list = Array.isArray(data) ? data : data && Array.isArray(data.wrestlers) ? data.wrestlers : null;
    if (!list) throw new Error('JSON must be an array of wrestlers or contain a "wrestlers" array.');
  }

  const wrestlers = list.map(normalizeWrestler).filter(w => w.name);
  if (wrestlers.length === 0) throw new Error('No wrestlers found. Each row or <wrestler> needs a name.');
  return wrestlers;
}

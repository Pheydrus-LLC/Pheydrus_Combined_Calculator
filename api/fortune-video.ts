import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { folderId, pile } = req.query as { folderId: string; pile: string };

  if (!folderId || !pile) {
    return res.status(400).json({ error: 'folderId and pile required' });
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_DRIVE_API_KEY not configured' });
  }

  try {
    let query: string;

    if (pile === 'main') {
      query = `'${folderId}' in parents and (name = 'main.mp4' or name = 'main.mov') and trashed = false`;
    } else {
      const pileNum = parseInt(pile, 10);
      if (isNaN(pileNum) || pileNum < 1 || pileNum > 4) {
        return res.status(400).json({ error: 'Invalid pile number' });
      }
      query = `'${folderId}' in parents and (name = 'pile-${pileNum}.mp4' or name = 'pile-${pileNum}.mov') and trashed = false`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'Drive API error' });
    }

    const data = await response.json() as { files?: { id: string; name: string; mimeType: string }[] };

    if (!data.files || data.files.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const file = data.files[0];

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.json({
      fileId: file.id,
      name: file.name,
      embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
    });
  } catch {
    return res.status(500).json({ error: 'Internal error' });
  }
}

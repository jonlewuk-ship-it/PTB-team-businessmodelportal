// A dedicated, independent HTTP storage bucket for the PTB TEAM portal
const KV_BUCKET_URL = "https://kvdb.io/K99b6BBN2x58pC6SUpXN9U/acca_ptb_workspaces";

// Default pre-seeded markets tailored specifically for the PTB division
const defaultMarkets = [
  {
    name: "Brasil", 
    city: "Brasília", 
    code: "br", 
    img: "image_82b4b2.jpg", // Referencing your exact file verbatim
    url: "#", 
    custom: false
  },
  {
    name: "Portugal", 
    city: "Lisboa", 
    code: "pt", 
    img: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1200", 
    url: "#", 
    custom: false
  }
];

export default async function handler(request, response) {
  try {
    const { method } = request;

    // --- GET: FETCH PTB WORKSPACES ---
    if (method === 'GET') {
      const res = await fetch(KV_BUCKET_URL);
      
      if (res.status === 404) {
        await fetch(KV_BUCKET_URL, {
          method: 'POST',
          body: JSON.stringify(defaultMarkets)
        });
        return response.status(200).json(defaultMarkets);
      }

      const data = await res.json();
      return response.status(200).json(data);
    }

    // --- POST: ADD NEW PTB WORKSPACE ---
    if (method === 'POST') {
      const newWorkspace = request.body;
      const getRes = await fetch(KV_BUCKET_URL);
      let currentData = getRes.status === 200 ? await getRes.json() : defaultMarkets;

      currentData.push(newWorkspace);
      
      await fetch(KV_BUCKET_URL, {
        method: 'POST',
        body: JSON.stringify(currentData)
      });
      return response.status(200).json(currentData);
    }

    // --- DELETE: REMOVE PTB WORKSPACE ---
    if (method === 'DELETE') {
      const { index } = request.query;
      const getRes = await fetch(KV_BUCKET_URL);
      let currentData = getRes.status === 200 ? await getRes.json() : defaultMarkets;

      if (index !== undefined) {
        currentData.splice(parseInt(index, 10), 1);
        await fetch(KV_BUCKET_URL, {
          method: 'POST',
          body: JSON.stringify(currentData)
        });
      }
      return response.status(200).json(currentData);
    }

    return response.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}

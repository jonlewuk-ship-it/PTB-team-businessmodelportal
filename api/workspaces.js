const KV_BUCKET_URL = "https://kvdb.io/K99b6BBN2x58pC6SUpXN9U/acca_workspaces";

const defaultMarkets = [
  {name:"Portogallo", city:"Lisbon", code:"pt", img:"https://images.unsplash.com/photo-1585675403063-95886915234f?w=1200", url:"https://collaborative-bmc.vercel.app/canvas/spmiurs50ehwfhcetukkj7idete3ey0f", custom:false},
  {name:"Brasile", city:"Brasília", code:"br", img:"https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1200", url:"https://collaborative-bmc.vercel.app/canvas/ktmtcgj44yxpo0ow483s7l101y7s26pm", custom:false}
];

export default async function handler(request, response) {
  try {
    const { method } = request;

    // --- GET: FETCH WORKSPACES ---
    if (method === 'GET') {
      const res = await fetch(KV_BUCKET_URL);
      
      if (res.status === 404) {
        // Initialize if the bucket is empty
        await fetch(KV_BUCKET_URL, {
          method: 'POST',
          body: JSON.stringify(defaultMarkets)
        });
        return response.status(200).json(defaultMarkets);
      }

      const data = await res.json();
      return response.status(200).json(data);
    }

    // --- POST: ADD NEW WORKSPACE ---
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

    // --- DELETE: REMOVE WORKSPACE ---
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

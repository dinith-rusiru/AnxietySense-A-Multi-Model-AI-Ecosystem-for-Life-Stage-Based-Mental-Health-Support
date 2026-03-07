// const BASE_URL = 'http://192.168.8.156:8000/dinth';
const BASE_URL = "http://127.0.0.1:8000/dinth";

// export const predictAnxiety = async (imageDataUrl) => {
//   // Convert base64 dataUrl → Blob properly
//   const byteString  = atob(imageDataUrl.split(',')[1]);
//   const mimeString  = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
//   const ab          = new ArrayBuffer(byteString.length);
//   const ia          = new Uint8Array(ab);

//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }

//   const blob     = new Blob([ab], { type: mimeString });
//   const file     = new File([blob], 'face.jpg', { type: 'image/jpeg' });
//   const formData = new FormData();
//   formData.append('file', file);

//   console.log('Sending file size:', file.size, 'bytes');  // should be > 10000

//   const response = await fetch(`${BASE_URL}/predict`, {
//     method: 'POST',
//     body  : formData,
//   });

//   if (!response.ok) {
//     const err = await response.text();
//     throw new Error(`Server error ${response.status}: ${err}`);
//   }

//   return await response.json();
// };

// const BASE_URL = 'http://172.28.10.37:8000/dinth';  // ← change to your IP



export const predictAnxiety = async (imageDataUrl) => {
  const byteString = atob(imageDataUrl.split(',')[1]);
  const mime       = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab         = new ArrayBuffer(byteString.length);
  const ia         = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  const blob     = new Blob([ab], { type: mime });
  const file     = new File([blob], 'face.jpg', { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/predict`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Server error ${response.status}`);
  return await response.json();
};

export const analyzeDrawing = async (metrics, cameraScore) => {
  const response = await fetch(`${BASE_URL}/analyze-drawing`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      metrics     : metrics,
      camera_score: cameraScore,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Server error ${response.status}: ${err}`);
  }
  return await response.json();
};
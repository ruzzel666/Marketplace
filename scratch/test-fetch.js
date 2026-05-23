fetch("https://marketplace-afea8-default-rtdb.firebaseio.com/db.json")
  .then(res => res.json())
  .then(data => {
    console.log("Type of data:", typeof data);
    console.log("Is array:", Array.isArray(data));
    if (data) {
      console.log("Keys:", Object.keys(data));
      if (Array.isArray(data)) {
        console.log("Length:", data.length);
        console.log("First element:", data[0]);
      } else {
        console.log("First few keys data:", Object.keys(data).slice(0, 3).map(k => ({ key: k, val: data[k] })));
      }
    }
  })
  .catch(err => console.error("Error:", err));

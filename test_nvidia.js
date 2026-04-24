const fetch = require('node-fetch');

(async () => {
    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
              model: "google/gemma-2-2b-it",
              messages: [
                { role: "system", content: "You are a test" },
                { role: "user", content: "Hello" }
              ],
              temperature: 0.2,
              top_p: 0.7,
              max_tokens: 1024,
              stream: false
            })
          });
        
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text);
    } catch(e) {
        console.error(e);
    }
})();

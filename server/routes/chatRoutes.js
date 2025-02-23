router.post('/chat', upload.single('image'), async (req, res) => {
    try {
        console.log("🔍 Incoming Request:", req.body, req.file);

        let userMessage = req.body.message || "";
        let plantLabels = [];

        // 🔹 Log Image Upload
        if (req.file) {
            console.log("📸 Image Received: ", req.file.mimetype, req.file.size, "bytes");
            plantLabels = await analyzeImage(req.file.buffer);

            if (plantLabels.length > 0) {
                console.log("✅ Plant Labels Detected:", plantLabels);
                userMessage += ` My plant looks like: ${plantLabels.map(label => label.description).join(", ")}.`;
            } else {
                console.log("⚠️ No Labels Detected by Vision API.");
            }
        } else {
            console.log("⚠️ No Image Uploaded.");
        }

        // 🔹 Fetch plant details from Perenual API
        const plantData = plantLabels.length ? await fetchPlantFromPerenual(plantLabels[0].description) : null;

        // 🔹 Analyze plant health
        const plantHealth = plantLabels.length ? analyzePlantHealth(plantLabels) : { isHealthy: true, details: "No image provided." };

        // 🔹 Construct AI message
        let fullMessage = userMessage;
        if (plantData) {
            fullMessage += ` This plant is likely a ${plantData.common_name} (${plantData.scientific_name}).`;
        }
        fullMessage += ` Health Status: ${plantHealth.details}`;

        // 🔹 Get AI response from Gemini
        const aiResponse = await generateGeminiResponse(fullMessage);
        console.log("✅ AI Response:", aiResponse);

        res.json({ message: aiResponse });

    } catch (error) {
        console.error("❌ Chat API Error:", error);
        res.status(500).json({ error: "Failed to process chat.", details: error.message });
    }
});

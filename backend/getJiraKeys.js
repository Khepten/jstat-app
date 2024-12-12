const axios = require("axios");

// Fonction pour récupérer les clés Jira
const fetchJiraKeys = async () => {
    try {
        // Requête à l'API Jira
        const base64Auth = Buffer.from("ndegas:Ormelune45@").toString("base64");
        const authHeader = `Basic ${base64Auth}`;
        const response = await axios.get(
            "https://jira-srh.cegedim-srh.net/rest/api/2/search?fields=key&jql=filter=172347&maxResults=999",
            {
                headers: {
                    Authorization: authHeader, // Remplacez avec votre jeton ou credentials
                },
            }
        );

        // Extraction des clés Jira
        const keys = response.data.issues.map((issue) => issue.key);

        console.log("Clés Jira récupérées :", keys);

        // Retourner les clés
        return keys;
    } catch (error) {
        console.error("Erreur lors de la récupération des clés Jira :", error);
        return [];
    }
};

// Exécuter la fonction
fetchJiraKeys();

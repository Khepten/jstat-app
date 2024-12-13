require("dotenv").config(); // Charger les variables d'environnement
const axios = require("axios");

// Charger les variables d'environnement
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraPassword = process.env.JIRA_PASSWORD;

// Générer le token d'authentification en Base64 avec Buffer
const authToken = `Basic ${Buffer.from(
    `${jiraUsername}:${jiraPassword}`
).toString("base64")}`;

// Fonction pour récupérer les clés des tickets Jira
async function getJiraKeys() {
    try {
        const response = await axios.get(
            `${jiraBaseUrl}/rest/api/2/search?fields=key&jql=filter=172346&maxResults=4999`,
            {
                headers: {
                    Authorization: authToken, // Utiliser le token généré
                    Accept: "application/json", // Format de la réponse attendu
                },
                params: {
                    jql: "assignee=currentUser()", // Filtrer les tickets assignés à l'utilisateur actuel
                    maxResults: 50, // Limiter le nombre de résultats
                },
            }
        );

        // Extraire les clés des tickets
        const issueKeys = response.data.issues.map((issue) => issue.key);

        console.log("Clés des tickets Jira :", issueKeys);
        return issueKeys;
    } catch (error) {
        // Gestion des erreurs
        if (error.response) {
            console.error(
                `Erreur API Jira : ${error.response.status} - ${error.response.statusText}`
            );
        } else {
            console.error("Erreur réseau ou autre :", error.message);
        }
    }
}

// Appel de la fonction
getJiraKeys();

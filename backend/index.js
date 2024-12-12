const axios = require("axios");
const { Client } = require("pg");

// Configuration Jira
const JIRA_URL = "https://jira-srh.cegedim-srh.net/rest/api/2/search";
const USERNAME = "votre_username";
const PASSWORD = "votre_password";
const FILTER_ID = "169262";

// Configuration PostgreSQL
const dbConfig = {
    user: "votre_utilisateur",
    host: "localhost",
    database: "votre_base",
    password: "votre_mot_de_passe",
    port: 5432,
};

// Table de correspondance entre Jira et PostgreSQL
const FIELD_MAPPING = {
    id: "id_serial",
    key: "id_jira",
    customfield_14670: "due_delivery",
    resolution: "resolution",
    customfield_11276: "desired_delivery",
    labels: "labels",
    issuelinks: "issuelinks",
    assignee: "assignee",
    components: "components",
    customfield_20770: "sla_status",
    customfield_14771: "clt_first_test",
    customfield_10972: "step",
    subtasks: "subtasks",
    customfield_15970: "pay_period_year",
    reporter: "reporter",
    issuetype: "issuetype",
    project: "project",
    customfield_20070: "group",
    resolutiondate: "resolutiondate",
    watches: "watches",
    customfield_21270: "ca_update",
    updated: "updated",
    customfield_14971: "clt_priority_valid",
    description: "description",
    customfield_14972: "declared_env",
    customfield_20171: "nb_comments",
    customfield_14970: "clt_priority",
    customfield_14976: "expected_srh_end_date",
    summary: "summary",
    duedate: "due_date",
    customfield_13972: "last_assignee_srh",
    customfield_13975: "main_closing_date",
    status: "status",
    creator: "creator",
    customfield_14470: "main_delivery_date",
    timespent: "timespent",
    customfield_11072: "last_comment",
    created: "created",
    customfield_15770: "mrgl_impact",
};

// Récupération des tickets Jira
async function fetchJiraData() {
    const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

    try {
        const response = await axios.get(JIRA_URL, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
            },
            params: {
                jql: `filter=${FILTER_ID}`,
                maxResults: 100,
            },
        });
        return response.data.issues;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des données Jira :",
            error.message
        );
        throw error;
    }
}

// Insertion des données dans PostgreSQL
async function insertIntoDatabase(issues) {
    const client = new Client(dbConfig);

    try {
        await client.connect();

        for (const issue of issues) {
            const fields = issue.fields;
            const record = {};

            // Préparer les champs pour PostgreSQL
            for (const [jiraField, dbField] of Object.entries(FIELD_MAPPING)) {
                record[dbField] = fields[jiraField] || null;
            }

            // Générer la requête d'insertion dynamique
            const columns = Object.keys(record).join(", ");
            const values = Object.values(record);
            const placeholders = values
                .map((_, index) => `$${index + 1}`)
                .join(", ");

            const query = `INSERT INTO votre_table (${columns}) VALUES (${placeholders})`;

            // Exécuter la requête
            await client.query(query, values);
        }

        console.log("Insertion réussie !");
    } catch (error) {
        console.error(
            "Erreur lors de l'insertion des données :",
            error.message
        );
        throw error;
    } finally {
        await client.end();
    }
}

// Fonction principale
async function main() {
    try {
        const issues = await fetchJiraData();
        await insertIntoDatabase(issues);
    } catch (error) {
        console.error("Erreur :", error.message);
    }
}

main();

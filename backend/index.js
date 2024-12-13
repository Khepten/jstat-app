const axios = require("axios");
const { Client } = require("pg");
require("dotenv").config();

// Configuration Jira (via .env)
const JIRA_URL = process.env.JIRA_URL;
const USERNAME = process.env.JIRA_USERNAME;
const PASSWORD = process.env.JIRA_PASSWORD;
const FILTER_ID = process.env.JIRA_FILTER_ID;
const API_TOKEN = process.env.JIRA_TOKEN;

// Configuration PostgreSQL (via .env)
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
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

// Récupération des données Jira pour une issue spécifique (hardcodée)
async function fetchJiraTicket() {
    const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
    const url =
        "https://jira-srh.cegedim-srh.net/rest/api/2/issue/SRHCACALF-7235";

    try {
        console.log("Tentative de récupération du ticket...");
        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
            },
        });

        console.log("Ticket récupéré :", response.data);
        return response.data;
    } catch (error) {
        console.log("JIRA_URL:", url);
        console.log("fetchJiraData:", typeof fetchJiraData);
        console.log("USERNAME:", process.env.JIRA_USERNAME);
        console.log("PASSWORD:", process.env.JIRA_PASSWORD);
        console.error("Détails supplémentaires :", error.response?.data);
    }
}

fetchJiraTicket();

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

            const query = `INSERT INTO issues (${columns}) VALUES (${placeholders})`;

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
        const issues = await fetchJiraData(); // Récupérer une issue Jira
        console.log("fetchJiraData:", typeof fetchJiraData);
        //await insertIntoDatabase(issues); // Insérer les données dans PostgreSQL
    } catch (error) {
        console.error("Erreur :", error.message);
    }
}

main();

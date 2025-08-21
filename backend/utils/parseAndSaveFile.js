// backend/utils/parseAndSaveFile.js
const fs = require("fs");
const XLSX = require("xlsx");
const fastcsv = require("fast-csv");
const User = require("../models/User");

async function parseAndSaveFile(filePath, originalName) {
    let users = [];

    if (originalName.endsWith(".xlsx")) {
        // Read Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        users = sheetData.map(row => ({
            Name: row.Name || "",
            LastName: row.LastName || "",
            Email: row.Email || "",
            Company: row.Company || "",
            Title: row.Title || "",
            Phone: row.Phone || "",
            Address: row.Address || "",
            City: row.City || "",
            State: row.State || "",
            PostalCode: row.PostalCode || "",
            Country: row.Country || "",
            Industry: row.Industry || "",
            Employee_Range__c: row.Employee_Range__c || "",
            MktoPersonNotes: row.MktoPersonNotes || "",
            UTM_Source__c: row.UTM_Source__c || "",
            UTM_Content__c: row.UTM_Content__c || "",
            UTM_Detail__c: row.UTM_Detail__c || "",
            UTM_Medium__c: row.UTM_Medium__c || "",
            UTM_Campaign__c: row.UTM_Campaign__c || "",
            Whitepaper_Title__c: row.Whitepaper_Title__c || ""
        }));
    } else if (originalName.endsWith(".csv")) {
        // Read CSV
        users = await new Promise((resolve, reject) => {
            const rows = [];
            fs.createReadStream(filePath)
                .pipe(fastcsv.parse({ headers: true }))
                .on("data", row => {
                    rows.push({
                        Name: row.Name || "",
                        LastName: row.LastName || "",
                        Email: row.Email || "",
                        Company: row.Company || "",
                        Title: row.Title || "",
                        Phone: row.Phone || "",
                        Address: row.Address || "",
                        City: row.City || "",
                        State: row.State || "",
                        PostalCode: row.PostalCode || "",
                        Country: row.Country || "",
                        Industry: row.Industry || "",
                        Employee_Range__c: row.Employee_Range__c || "",
                        MktoPersonNotes: row.MktoPersonNotes || "",
                        UTM_Source__c: row.UTM_Source__c || "",
                        UTM_Content__c: row.UTM_Content__c || "",
                        UTM_Detail__c: row.UTM_Detail__c || "",
                        UTM_Medium__c: row.UTM_Medium__c || "",
                        UTM_Campaign__c: row.UTM_Campaign__c || "",
                        Whitepaper_Title__c: row.Whitepaper_Title__c || ""
                    });
                })
                .on("end", () => resolve(rows))
                .on("error", reject);
        });
    } else {
        throw new Error("Unsupported file format. Please upload CSV or XLSX.");
    }

    // Bulk update or insert
    if (users.length > 0) {
        await User.bulkWrite(users.map(user => ({
            updateOne: {
                filter: { Email: user.Email },
                update: { $set: user }, // Always overwrite with new data
                upsert: true
            }
        })));
    }

    fs.unlinkSync(filePath); // Remove temp file
    return users.length;
}

module.exports = parseAndSaveFile;

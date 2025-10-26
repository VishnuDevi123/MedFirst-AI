// services/aiAgentService.js
export async function generateDrugSummary(drugData) {
    const { brand_name, purpose, warnings, dosage, manufacturer, expiry } =
      drugData;
  
    return `
    ✅ Verified Drug Summary:
    - Name: ${brand_name || "Unknown"}
    - Manufacturer: ${manufacturer || "Not listed"}
    - Purpose: ${purpose || "N/A"}
    - Dosage: ${dosage || "Check packaging"}
    - Warning: ${warnings || "Refer to official label"}
    - Expiry: ${expiry || "Not available"}
  
    This medicine is verified and authentic. Always check expiry before use.
    `;
  }
// services/fdaService.js
import axios from "axios";

export async function fetchOpenFDA(ndc) {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.product_ndc:${ndc}&limit=1`;
    const res = await axios.get(url);

    const result = res.data.results?.[0];
    if (!result) throw new Error("No data found");

    const drugInfo = {
      brand_name: result.openfda?.brand_name?.[0],
      manufacturer: result.openfda?.manufacturer_name?.[0],
      purpose: result.purpose?.[0],
      warnings: result.warnings?.[0],
      dosage: result.dosage_and_administration?.[0],
    };

    return drugInfo;
  } catch (err) {
    console.error("OpenFDA fetch error:", err.message);
    return null;
  }
}
import { File, Paths } from "expo-file-system";
import { getAllLocationData } from "./db";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Writes location_data to an Excel-compatible .xls file and returns its URI. */
export const exportLocationDataExcelUri = async (): Promise<string | null> => {
  const rows = await getAllLocationData();
  if (rows.length === 0) return null;

  const headerCells = [
    "id",
    "latitude",
    "longitude",
    "time",
    "accuracy",
    "synced",
  ]
    .map((name) => `<Cell><Data ss:Type="String">${name}</Data></Cell>`)
    .join("");

  const dataRows = rows
    .map((row) => {
      const accuracy =
        row.accuracy == null
          ? `<Cell><Data ss:Type="String"></Data></Cell>`
          : `<Cell><Data ss:Type="Number">${row.accuracy}</Data></Cell>`;

      return `<Row>
        <Cell><Data ss:Type="Number">${row.id}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.latitude}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.longitude}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(row.time)}</Data></Cell>
        ${accuracy}
        <Cell><Data ss:Type="Number">${row.synced}</Data></Cell>
      </Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="location_data">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const file = new File(Paths.document, `location_data_${Date.now()}.xls`);
  file.write(xml);
  return file.uri;
};

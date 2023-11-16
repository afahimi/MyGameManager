

export async function getAllTableNames() {
    let query : string = `SELECT table_name FROM all_tables WHERE owner = '${process.env.ORACLE_USERNAME}'`
    let result: object = await OracleServerRequest(query)
    return result
}

export async function getTableData(table_name : string) {
    let query : string = `SELECT * FROM ${table_name}`
    let result: object = await OracleServerRequest(query)
    return result
}

/**
 * Sends request 'query' to Oracle DB, returns back JSON body
 * @param query 
 * @returns JSON body
 */
async function OracleServerRequest(query: string) {
    console.log("query: " + query);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query }),
    };
    console.log("sending post request");
    let result = await fetch(
      "https://www.students.cs.ubc.ca/~afahimi/index.php",
      requestOptions
    )

    return result.json()
}


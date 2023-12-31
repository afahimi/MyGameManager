/* Gets all the table names to render on front end */
export async function getAllTableNames() {
    let query : string = `SELECT table_name FROM all_tables WHERE owner = '${process.env.ORACLE_USERNAME}'`
    let result: object = await OracleServerRequest(query)
    return result
}
/* Get the table for corresponding table name */
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
export async function OracleServerRequest(query: string) {
    console.log("query: " + query);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query }),
    };

    // https://www.students.cs.ubc.ca/~afahimi/index.php
    console.log("sending post request");
    let result = await fetch(
      "https://www.students.cs.ubc.ca/~afahimi/index.php",
      requestOptions
    );
    
    

    return result.json();
}


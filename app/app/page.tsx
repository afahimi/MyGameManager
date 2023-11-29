"use client";
import styles from "./Home.module.css";
import Head, { defaultHead } from "next/head";
import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import DataTable from "./components/data_table";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";

import Alert from "./components/Alert.tsx";
import { AlertProperty } from "./components/Alert.tsx";

import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

import { getAllTableNames, getTableData } from "./utils/functions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { error, table } from "console";
import { OracleServerRequest } from "./utils/functions.ts";
import { divisionQueries } from "./utils/division_queries.ts";
import { nestedAggregation } from "./utils/nested_aggregations.ts";
import { AGGREGATION_OPS } from "./utils/constants.ts";
import WhereHaving from "./components/where_having.tsx";
import { exec } from "child_process";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

type RecordType = Record<string, string>;

const Home = () => {
  const [query, setQuery] = useState<RecordType>({});
  const [defaultQuery, setDefaultQuery] = useState("");
  const [result, setResult] = useState<any[]>([]);

  const [sideMenuVisible, setSideMenuVisible] = useState("true");

  const [tableNames, setTableNames] = useState([]);
  const [currTable, setCurrTable] = useState("");
  const [currTableKeys, setCurrTableKeys] = useState<Array<string>>([]);
  const [operation, setOperation] = useState<string>("");
  const [distinct, setDistinct] = useState<boolean>(false);

  const [projectSelections, setProjectSelections] = useState<string[]>([]);
  const [joinSelection, setJoinSelection] = useState<string>("");

  const [groupBy, setGroupBy] = useState<any[]>([]);
  const [groupByOperation, setGroupByOperation] = useState<string>("");

  const [joinTableResult, setJoinTableResult] = useState<any[]>([]);
  const [updateValues, setUpdateValues] = useState<Record<string, string>>({});

  const [divisorColumn, setDivisorColumn] = useState<string>("");
  const [divisionQuery, setDivisionQuery] = useState<string>("");

  const [whereHavingStr, setWhereHavingStr] = useState("");
  const [aggrKeys, setAggrKeys] = useState<string[]>([]);

  const [alert, setAlert] = useState<AlertProperty>({
    isVisible: false,
    msg: "",
    op_result: "success",
  });

  interface OracleError {
    ERROR: string;
  }
  /* Helper functions for error handling or input sanitizing */
  const operations = [
    "SELECT",
    "PROJECT",
    "JOIN",
    "AGGREGATION",
    "SUMMARY",
    "INSERT",
    "DELETE",
    "UPDATE",
    "MULTIJOIN",
  ];

  const OPERATION_FRONTEND = {
    "Add new": "INSERT",
    "Remove": "DELETE",
    "Update": "UPDATE",
    "View data": "PROJECT",
    "Search within game": "SELECT",
    "Character Overview": "MULTIJOIN",
    "View multiple game entities": "JOIN",
    "Calculate game statistics": "AGGREGATION",
    "Game Summary": "SUMMARY",
  }

  const HIDDEN_TABLES = new Set(["CONTAINS"])

  const USER_TABLE_NAME = {
    CHARACTERINFO: "Character Info",
    CONTAINS: "Inventory Contents",
    COORDINATELOCATIONS: "Coordinate Locations",
    DEVELOPS: "Player Skills",
    FACTIONS: "Factions",
    INTERACTIONS: "Player Interaction Log",
    INVENTORY: "Inventory",
    ITEM: "Items",
    LOCATIONS: "Location",
    MEMBEROF: "Faction List",
    NONPLAYABLECHARACTER: "NPC Info",
    PLAYER: "Player Info",
    QUESTREWARDS: "Quest Rewards",
    REWARDITEMS: "Reward Items",
    SKILL: "Skill",
    YIELDSQUEST: "Yields Quest"
  }

  const sanitizeInputs = (str: string) => {
    const patterns = [
      /--/,
      /;/,
      /'/,
      /"/,
      /\bDROP\b/i,
      /\bSELECT\b/i,
      /\bINSERT\b/i,
      /\bWHERE\b/i,
      /\bFROM\b/i,
      /\bDELETE\b/i,
      /\bUPDATE\b/i,
      /\bUNION\b/i,
      /\bALTER\b/i,
      /\bEXEC\b/i,
      /\bEXECUTE\b/i,
      /\\/,
      /\bNULL\b/i,
      /%/i,
      /_/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(str)) {
        return "";
      }
    }

    return str;
  };

  const convertStringToIntIfPossible = (str: string) => {
    if (/^\d+$/.test(str)) {
      return parseInt(str, 10);
    }

    return str;
  };

  const returnProperString = (key: string, value: string) => {
    const converted = convertStringToIntIfPossible(value);
    return typeof converted === "number"
      ? `${key} = ${converted}`
      : `${key} = '${converted}'`;
  };

  const errorHandle = (err: OracleError[]) => {
    if (err && err.length > 0) {
      for (const element of err) {
        if (element.ERROR) {
          console.log(element.ERROR);
          return element.ERROR;
        }
      }
    }

    return "";
  };

  const requestResult = async (executeQuery: string) => {
    const result = await OracleServerRequest(executeQuery);
    console.log(result);
    if (errorHandle(result).length > 0) {
      showAlert("FAILURE: error exists", "fail");
      setResult(result);
    } else {
      if (["INSERT", "DELETE", "UPDATE"].includes(operation)) {
        const updatedResult = await OracleServerRequest(
          `SELECT * FROM ${currTable}`
        );
        setResult(updatedResult);
      } else {
        if (result.length == 0) {
          setResult([["No results found"]]);
        } else {
          setResult(result);
        }
        
      }
      showAlert("SUCCESS!", "success");
    }
  };

  const showAlert = (msg: string, op_result: "success" | "fail") => {
    setAlert({ isVisible: true, msg, op_result });

    setTimeout(() => {
        setAlert({ isVisible: false, msg: '', op_result: 'success' });
    }, 3500);
};

  /* ************************************************************ */

  const handleProjectCheckboxChange = (checked: boolean, key: string) => {
    if (checked) {
      console.log("checked");
      setProjectSelections((prevSelections) => [...prevSelections, key]);
    } else {
      console.log("unchecked");
      setProjectSelections((prevSelections) =>
        prevSelections.filter((item) => item !== key)
      );
    }
    console.log(projectSelections);
    setCurrTableKeys(Object.keys(result[0]));
  };

  const generateProjectElements = (
    res: string[] = result,
    tableName: string = currTable
  ) => {
    if (res.length === 0) {
      return null;
    }

    const uniqueKeys = new Set(Object.keys(res[0]));
    const uniqueKeysArray = Array.from(uniqueKeys);


    
    return uniqueKeysArray.map((key, index) => {

      return (
        <div key={`${key}-${index}`} className="text-black">
          <Form.Check
            type="checkbox"
            label={key}
            
            onChange={(e) =>
              handleProjectCheckboxChange(
                e.target.checked,
                `${tableName}.${key}`
              )
            }
          />
        </div>
      );
    });
  };

  const getTableAttributes = () => {
    if (result.length == 0) {
      return [];
    }
    const uniqueKeys = new Set(Object.keys(result[0]));
    return uniqueKeys;
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  const handleUpdateChange = (fieldName: string, value: string) => {
    setUpdateValues((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  async function changeVisibleTable(table_name: string) {
    setResult([]);
    setCurrTable(table_name);
    setDefaultQuery("");
    setQuery({});
    setGroupByOperation("");
    setGroupBy([]);
    setWhereHavingStr("");
    //setProjectSelections(["*"]);
    try {
      let data: any = await getTableData(table_name);
      setResult(data);
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  useEffect(() => {
    getAllTableNames()
      .then((res: any) => {
        console.log("success:", res);
        setTableNames(res);
        changeVisibleTable("CHARACTERINFO");
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const createFormControlElements = (handleFunction = handleInputChange) => {
    if (result.length === 0) {
      return null;
    }
    const keys = Object.keys(result[0]);

    return keys.map((key, index) => {

      if(['HEALTH', "MANA", "OVERALLLEVEL", "CURRENTLEVEL", "INVENTORYSIZE"
      , "INVENTORYQUANTITY", "QUESTLEVEL", "REWARDQUANTITY"].includes(key)){
        return (
          <div key={index} >
            {key}
            <Form.Control
              key={index}
              type="range"
              min="1"
              max="100"
              defaultValue="50"
              placeholder={key}
              onChange={(e) => {
                const sliderValueDisplay = document.getElementById(`slider-value-display-${key}`)
                if(sliderValueDisplay){
                  sliderValueDisplay.textContent = e.target.value
                }
                handleFunction(key, e.target.value)}
              }
            />
            <span id = {`slider-value-display-${key}`}>50</span>
          </div>
        );
      }
      else {
        return (
          <Form.Control
            key={index}
            type="text"
            placeholder={key}
            onChange={(e) => handleFunction(key, e.target.value)}
          />
        );
      }
    });
  };

  const generateJoinElements = () => {
    if (tableNames.length === 0) {
      return null;
    }

    return tableNames.map((tableName: any, count) => {
      return (
        <Dropdown.Item
          key={count}
          onClick={() => {
            setJoinSelection(tableName.TABLE_NAME);
            getJoinSelectTable(tableName.TABLE_NAME);
            setDivisorColumn("");
          }}
        >
          {tableName.TABLE_NAME}
        </Dropdown.Item>
      );
    });
  };

  const generateJoinUserElements = () => {
    if (tableNames.length === 0) {
      return null;
    }

    const joinTables = {
      "Character Info and Inventory": "CHARACTERINFO",
    }


    return tableNames.map((tableName: any, count) => {
      return (
        <Dropdown.Item
          key={count}
          onClick={() => {
            setJoinSelection(tableName.TABLE_NAME);
            getJoinSelectTable(tableName.TABLE_NAME);
            setDivisorColumn("");
          }}
        >
          {tableName.TABLE_NAME}
        </Dropdown.Item>
      );
    });
  };

  const generateDivisionMenuElements = () => {
    let divisonQueries : any[] = ["Select all players who have all items"];
    let nestedAggQueries = Object.keys(nestedAggregation);
    let combinedList = nestedAggQueries.concat(divisonQueries);

    return combinedList.map((query: string, count) => {
      return (
        <Dropdown.Item
          key={count}
          onClick={() => {
            setDivisionQuery(query);
          }}
        >
          {query}
        </Dropdown.Item>
      );
    });
  };

  const getJoinSelectTable = async (tableName: string) => {
    setJoinTableResult(await OracleServerRequest(`SELECT * FROM ${tableName}`));
  };

  const [field, setField] = useState<any[]>([]);

  interface OperationUI {
    [key: string]: JSX.Element;
  }

  const operationUI: OperationUI = {
    SELECT: (
      <>
        <div>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Find in {currTable}
          </h1>
        </div>
        <div>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
          </h1>
        </div>
        <div className="inline-flex space-x-4">
          Filter: 
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
          />
        </div>
          
                  <Form>
                  Visible Columns:
            <div className={styles.project_form}>
              {generateProjectElements(result)}
            </div>
          </Form>
      </>
    ),

    JOIN: (
      <div className=" flex-col">
        <div className="space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            View
          </h1>
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              {joinSelection ? joinSelection : "...."}
            </Dropdown.Toggle>

            <Dropdown.Menu>{generateJoinElements()}</Dropdown.Menu>
          </Dropdown>
          {/* <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            with {currTable} using 
          </h1> */}
        </div>
        Filter
        <div className="inline-flex space-x-4 mt-4">
         
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />
        </div>
        <div className="inline-flex space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Show Columns: 
          </h1>
          <Form.Check
            type="checkbox"
            label="Distinct"
            checked={distinct}
            onChange={(e) => setDistinct(e.target.checked)}
          />
        </div>
      </div>
    ),

    INSERT: (
      <>
        <Form>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),

    DELETE: (
      <>
        <Form>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),

    UPDATE: (
      <>
        <Form>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Target Row:
          </h1>
          <Form.Group>{createFormControlElements()}</Form.Group>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Set values (or leave blank to not update):
          </h1>
          <Form.Group>
            {createFormControlElements(handleUpdateChange)}
          </Form.Group>
        </Form>
      </>
    ),

    PROJECT: (
      <>
        <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
          Select
        </h1>
        <Form>
          <div className={styles.project_form}>{generateProjectElements()}</div>
        </Form>
      </>
    ),

    AGGREGATION: (
      <div className="">
        <div className="flex justify-center items-center gap-2">
          Get
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupByOperation}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {AGGREGATION_OPS.map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() => setGroupByOperation(elem)}
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          of 
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupBy[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(getTableAttributes()).map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() =>
                            setGroupBy((old: any) => [elem, old[1]])
                          }
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          
        </div>

        <div className="flex justify-center items-center gap-2">
          Optional Grouping: 
          <Form>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                {groupBy[1]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(getTableAttributes()).map((elem) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={`2-${elem}`}
                        onClick={() => setGroupBy((old: any) => [old[0], elem])}
                      >
                        {elem}
                      </Dropdown.Item>
                    </>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Form>
        </div>
        <div className="inline-flex space-x-4">
          Filter:
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />
        </div>
      </div>
    ),
    NESTED_AGGREGATION: (
      <div className="">
        <div className="flex justify-center items-center gap-2">
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupByOperation}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {AGGREGATION_OPS.map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() => setGroupByOperation(elem)}
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          (
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupBy[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(getTableAttributes()).map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() =>
                            setGroupBy((old: any) => [elem, old[1]])
                          }
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          )
        </div>

        <div className="flex justify-center items-center gap-2">
          Group By
          <Form>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                {groupBy[1]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(getTableAttributes()).map((elem) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={`2-${elem}`}
                        onClick={() => setGroupBy((old: any) => [old[0], elem])}
                      >
                        {elem}
                      </Dropdown.Item>
                    </>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Form>
        </div>
        <div className="inline-flex space-x-4">
          HAVING
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />
        </div>
      </div>
    ),
    SUMMARY: (
      <>
        <div className="inline-flex space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            What would you like to know?:
          </h1>
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              {divisionQuery ? divisionQuery : "....."}
            </Dropdown.Toggle>
            
            <Dropdown.Menu>{generateDivisionMenuElements()}</Dropdown.Menu>
          </Dropdown>
        </div>
      </>
    )
  };

  /* Given the values generate a query to execute and toss it to postRequest */
  const handleExecuteQuery = async () => {
    setResult([]);
    let executeQuery = "";
    let where_clause = "";
    switch (operation) {
      case "SELECT":
        let string = defaultQuery ? `${defaultQuery}` : "*";
        setProjectSelections([]);
        where_clause = defaultQuery
          ? sanitizeInputs(defaultQuery) !== ""
            ? `WHERE ${sanitizeInputs(defaultQuery)}`
            : ""
          : "";
        executeQuery = `SELECT ${projectSelections.join(
          ","
        )} FROM ${currTable} ${where_clause}`;
        if (whereHavingStr !== "") {
          executeQuery += `WHERE ${whereHavingStr}`;
        }
        break;

      case "INSERT":
        let entities = Object.keys(query).join(",");
        let values = Object.values(query)
          .map((entity) => {
            const converted = convertStringToIntIfPossible(entity);
            return typeof converted === "number" ? converted : `'${converted}'`;
          })
          .join(",");
        executeQuery = `INSERT INTO ${currTable} VALUES (${values}); COMMIT`;
        break;

      case "DELETE":
        let condition = Object.entries(query)
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(" AND ");

        executeQuery = `DELETE FROM ${currTable} WHERE ${condition}; COMMIT`;
        break;

      case "UPDATE":
        let targetRow = Object.entries(query)
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(" AND ");

        console.log(updateValues);

        let updates = Object.entries(updateValues)
          .filter(([key, value]) => value.trim() !== "")
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(", ");
        executeQuery = `UPDATE ${currTable} SET ${updates} WHERE ${targetRow}; COMMIT`;
        setUpdateValues({});
        break;

      case "PROJECT":
        setProjectSelections([]);
        executeQuery = `SELECT ${projectSelections.join(
          ","
        )} FROM ${currTable}`;
        break;

      case "JOIN":
        setProjectSelections([]);
        where_clause = defaultQuery
          ? sanitizeInputs(defaultQuery) !== ""
            ? `WHERE ${sanitizeInputs(defaultQuery)}`
            : ""
          : "";
        let distinctOn = distinct ? "DISTINCT" : "";
        executeQuery = `SELECT ${distinctOn} ${projectSelections.join(
          ", "
        )} FROM ${currTable}, ${joinSelection} ${where_clause}`;

        if (whereHavingStr !== "") {
          executeQuery += `WHERE ${whereHavingStr}`;
        }

        break;

      case "RAW QUERY":
        executeQuery = defaultQuery;
        break;

      case "AGGREGATION":
        if (groupBy[1] == undefined) {
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}) FROM ${currTable}`;
        } else {
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}), ${groupBy[1]} FROM ${currTable} GROUP BY ${groupBy[1]} `;
        }

        if (whereHavingStr !== "") {
          console.log(aggrKeys);
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}), ${groupBy[1]} FROM ${currTable} GROUP BY ${groupBy[1]} `;
          executeQuery += `HAVING ${whereHavingStr}`;
        }
        console.log(executeQuery);
        break;

      case "SUMMARY":
        if (divisionQuery in divisionQueries) {
          executeQuery = divisionQuery ? divisionQueries[divisionQuery] : "";
        } else {
          executeQuery = nestedAggregation[divisionQuery]
        }
        
        break;
      
      case "MULTIJOIN":
        executeQuery = `
          SELECT * FROM CHARACTERINFO
          NATURAL JOIN PLAYER
          NATURAL JOIN DEVELOPS
          NATURAL JOIN COORDINATELOCATIONS
          NATURAL JOIN INVENTORY
        `
        break;
    }

    requestResult(executeQuery);
  };

  return (
    <>
      <div className={styles.container}>
        <div className="flex h-full w-full text-slate-900">
          <div className="bg-slate-200 h-full mr-3 p-2 overflow-y-scroll">
            <h1
              className={`p-12 text-3xl font-onest text-slate-950 ${
                sideMenuVisible ? "" : "hidden"
              }`}
            >
              MyGameManager
            </h1>
            Game Data:
            <ListGroup as={"ul"}>
              {tableNames.map((tableName: any, count) => {
                if (HIDDEN_TABLES.has(tableName.TABLE_NAME)) {
                  return null;
                }
                return (
                  <div
                    className={styles.table_item}
                    key={`${tableName.TABLE_NAME}`}
                  >
                    <ListGroup.Item
                      key={`count${tableName}`}
                      as={"li"}
                      className="mt-2"
                      onClick={() => {
                        changeVisibleTable(tableName.TABLE_NAME);
                        setDistinct(false);
                      }}
                    >
                      <div className={styles.table_item}>
                        {USER_TABLE_NAME[tableName.TABLE_NAME as keyof typeof USER_TABLE_NAME]}
                      </div>
                    </ListGroup.Item>
                  </div>
                );
              })}
            </ListGroup>
          </div>

          <div>
            <Alert
              isVisible={alert.isVisible}
              msg={alert.msg}
              op_result={alert.op_result}
            />
            <div className={styles.btn_group}>
              <ButtonGroup aria-label="Basic example">
                {Object.keys(OPERATION_FRONTEND).map((operation, count) => {

                  let sql_op = OPERATION_FRONTEND[operation as keyof typeof OPERATION_FRONTEND]
                  return (
                    <Button
                      key={count}
                      variant="outline-primary"
                      onClick={() => {
                        changeVisibleTable(currTable);
                        setOperation(sql_op);
                      }}
                    >
                      {operation}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
            <div className={styles.form}>
              {operationUI[operation] ? operationUI[operation] : null}
            </div>
            <div className="flex justify-center gap-2">
              <div className={styles.reset_btn}>
                <Button
                  onClick={() => {
                    changeVisibleTable(currTable);
                  }}
                  variant="outline-danger"
                >
                  Clear
                </Button>
              </div>
              <div className={styles.reset_btn}>
                <Button onClick={handleExecuteQuery} variant="outline-primary">
                  Run
                </Button>
              </div>
            </div>
            <div className="text-cyan-800">
              {currTable
                ? `Current Table: ${currTable}`
                : "Select a table to view"}
            </div>
            <div className="text-cyan-800">
              {operation ? `Current Operation: ${operation}` : null}
            </div>
            <div className={styles.table}>
              {result.length > 0 ? (
                <DataTable data={result} />
              ) : (
                <Spinner animation="border" />
              )}
            </div>
            {/* <div className={styles.table}>
              {(() => {
                if (
                  joinTableResult.length > 0 &&
                  (operation === "JOIN" || operation === "DIVISION")
                ) {
                  return <DataTable data={joinTableResult} />;
                } else {
                  return <></>;
                }
              })()}
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;